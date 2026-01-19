import sqlite3
import json
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "../agronomy-db/agronomy.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "../agronomy-db/schema.sql")
DATA_DIR = os.path.join(BASE_DIR, "../agronomy-db/data")

# Labels Paths (To map Model Label -> JSON Content)
LABEL_FILES = {
    "corn":   os.path.join(BASE_DIR, "../ml-model/export/corn/labels_gemini.txt"),
    "potato": os.path.join(BASE_DIR, "../ml-model/export/potato/labels_potato.txt"),
    "rice":   os.path.join(BASE_DIR, "../ml-model/export/rice/labels.txt"),
    # Add tomato if you have a label file, otherwise logic below handles generic mapping
}

# Manual Overrides: Model_Label -> JSON_Key
KEY_MAP = {
    "Bacterial_blight": "Bacterial_Leaf_Blight",
    "Corn_(maize)___Common_rust_": "Common_rust",
}

def normalize(text):
    if "___" in text: text = text.split("___")[1]
    return text.lower().replace("_", "").replace(" ", "")

def find_json_key_for_label(label, json_keys):
    """Finds the JSON key that corresponds to the Model Label"""
    # 1. Exact Match
    if label in json_keys: return label
    
    # 2. Manual Map
    if label in KEY_MAP:
        if KEY_MAP[label] in json_keys: return KEY_MAP[label]

    # 3. Fuzzy Match
    norm_label = normalize(label)
    for key in json_keys:
        if norm_label == normalize(key):
            return key
            
    return None

def init_db():
    if os.path.exists(DB_PATH): os.remove(DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    with open(SCHEMA_PATH, 'r') as f:
        conn.executescript(f.read())
    return conn

def populate(conn):
    cursor = conn.cursor()
    
    # Load all label files first
    model_labels_map = {} # crop -> list of labels
    for crop, path in LABEL_FILES.items():
        if os.path.exists(path):
            with open(path, 'r') as f:
                model_labels_map[crop] = [l.strip() for l in f.readlines() if l.strip()]

    # Process Languages
    for lang_code, filename in {"en": "english.json", "hi": "hindi.json", "te": "telugu.json"}.items():
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath): continue
        
        print(f"Processing {lang_code}...")
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for crop, diseases in data.items():
            # Get the official model labels for this crop
            # If we don't have a label file (e.g. tomato), we assume JSON keys are the labels (fallback)
            official_labels = model_labels_map.get(crop, diseases.keys())

            for label in official_labels:
                # Find which JSON content matches this Model Label
                matched_key = find_json_key_for_label(label, diseases.keys())

                if matched_key:
                    info = diseases[matched_key]
                    
                    # Prepare Data
                    causes = json.dumps(info.get("cause", []))
                    cures = json.dumps(info.get("cure", []))
                    suggestions = json.dumps(info.get("suggestions", []))
                    
                    tts = ""
                    if info.get("cause"): tts += info["cause"][0] + ". "
                    if info.get("cure"): tts += "Solution: " + info["cure"][0]

                    # INSERT using LABEL as the key (Important!)
                    try:
                        cursor.execute("""
                            INSERT INTO disease_content 
                            (crop_name, disease_key, language_code, causes_json, cures_json, suggestions_json, tts_summary)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        """, (crop, label, lang_code, causes, cures, suggestions, tts))
                    except sqlite3.IntegrityError:
                        pass # Skip duplicates
                else:
                    print(f"⚠️ Warning: No JSON content found for Model Label '{label}' in {lang_code}")

    conn.commit()
    print(f"✅ Database created successfully at: {DB_PATH}")

if __name__ == "__main__":
    conn = init_db()
    populate(conn)
    conn.close()