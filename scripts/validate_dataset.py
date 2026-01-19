import json
import os
import difflib

# ==========================================
# 1. SETUP PATHS
# ==========================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(CURRENT_DIR, "../agronomy-db/data/english.json")

LABEL_FILES = {
    "corn":   os.path.join(CURRENT_DIR, "../ml-model/export/corn/labels_gemini.txt"),
    "potato": os.path.join(CURRENT_DIR, "../ml-model/export/potato/labels_potato.txt"),
    "rice":   os.path.join(CURRENT_DIR, "../ml-model/export/rice/labels.txt")
    # Add tomato if you have a separate labels file for it, otherwise it uses internal logic
}

# ==========================================
# 2. MANUAL MAPPING (The Bridge)
# ==========================================
# If the script fails to match automatically, add the pair here:
# "Model_Label_Name": "Your_JSON_Key"
MANUAL_MAP = {
    # Rice Mismatches
    "Bacterial_blight": "Bacterial_Leaf_Blight",
    
    # Corn Mismatches
    "Corn_(maize)___Common_rust_": "Common_rust",
    
    # Tomato Mismatches (Example)
    "Tomato___Bacterial_spot": "Bacterial_spot",
    "Tomato___Tomato_mosaic_virus": "Tomato_mosaic_virus"
}

def normalize(text):
    """Removes 'Crop___' prefixes and extra underscores for fuzzy matching"""
    if "___" in text:
        text = text.split("___")[1]
    return text.lower().replace("_", "").replace(" ", "")

def validate():
    print(f"🔍 Reading JSON from: {os.path.basename(JSON_PATH)}")
    
    if not os.path.exists(JSON_PATH):
        print(f"❌ CRITICAL ERROR: Could not find {JSON_PATH}")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    # 1. Flatten JSON Keys for easier searching
    # Structure: {'tomato': ['Bacterial_spot', ...], 'rice': [...]}
    flattened_json = {}
    for crop, diseases in json_data.items():
        flattened_json[crop] = list(diseases.keys())

    # 2. Validate against Labels
    for crop_name, label_path in LABEL_FILES.items():
        print(f"\nChecking Crop: {crop_name.upper()}")
        
        if not os.path.exists(label_path):
            print(f"⚠️  Label file missing: {label_path}")
            continue

        with open(label_path, 'r') as f:
            model_labels = [line.strip() for line in f.readlines() if line.strip()]

        json_keys = flattened_json.get(crop_name, [])

        for label in model_labels:
            match_found = False
            
            # Check 1: Exact Match
            if label in json_keys:
                match_found = True
            
            # Check 2: Manual Map
            elif label in MANUAL_MAP and MANUAL_MAP[label] in json_keys:
                match_found = True
                
            # Check 3: Smart Fuzzy Match (Strip Prefix)
            else:
                norm_label = normalize(label)
                for key in json_keys:
                    if norm_label == normalize(key):
                        match_found = True
                        break
            
            if match_found:
                print(f"✅ Linked: {label}")
            else:
                print(f"❌ MISMATCH: Model output '{label}' has no match in JSON.")
                # Suggest closest match
                closest = difflib.get_close_matches(label, json_keys, n=1)
                if closest:
                    print(f"   Did you mean: '{closest[0]}'?")

if __name__ == "__main__":
    validate()