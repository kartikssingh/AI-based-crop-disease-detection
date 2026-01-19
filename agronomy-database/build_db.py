import sqlite3
import json
import os

# Files configuration
DB_NAME = "agronomy.db"
SCHEMA_FILE = "schema.sql"
DATA_DIR = "data"
LANG_FILES = {
    "en": "english.json",
    "hi": "hindi.json",
    "te": "telugu.json"
}

def init_db():
    """Creates the database tables from schema.sql"""
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME) # Clean slate
    
    conn = sqlite3.connect(DB_NAME)
    with open(SCHEMA_FILE, 'r') as f:
        conn.executescript(f.read())
    return conn

def populate_db(conn):
    cursor = conn.cursor()
    
    for lang_code, filename in LANG_FILES.items():
        filepath = os.path.join(DATA_DIR, filename)
        
        if not os.path.exists(filepath):
            print(f"⚠️ Warning: {filename} not found. Skipping.")
            continue
            
        print(f"Processing {lang_code} from {filename}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            # Loop through Crops (tomato, potato...)
            for crop, diseases in data.items():
                
                # Loop through Diseases (Tomato_mosaic_virus...)
                for disease_key, info in diseases.items():
                    
                    # Convert Lists to JSON Strings for SQLite storage
                    causes_str = json.dumps(info.get("cause", []))
                    cures_str = json.dumps(info.get("cure", []))
                    suggestions_str = json.dumps(info.get("suggestions", []))
                    
                    # Create a TTS Summary (Join the first cure sentence)
                    # This creates a simple string for the robot to speak
                    tts_text = ""
                    if info.get("cause"):
                         tts_text += info["cause"][0] + ". "
                    if info.get("cure"):
                         tts_text += "Solution: " + info["cure"][0]

                    cursor.execute("""
                        INSERT INTO disease_content 
                        (crop_name, disease_key, language_code, causes_json, cures_json, suggestions_json, tts_summary)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (crop, disease_key, lang_code, causes_str, cures_str, suggestions_str, tts_text))

    conn.commit()
    print(f"✅ Database {DB_NAME} built successfully!")

if __name__ == "__main__":
    connection = init_db()
    populate_db(connection)
    connection.close()