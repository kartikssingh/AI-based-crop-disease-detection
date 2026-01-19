-- schema.sql

-- 1. Table to store disease information
-- We use a composite Unique Key (disease_key + language_code) 
-- to ensure we find the exact translation quickly.

CREATE TABLE IF NOT EXISTS disease_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- The crop category (e.g., 'tomato', 'potato')
    crop_name TEXT NOT NULL,
    
    -- The key MUST match your TFLite Model Output exactly 
    -- (e.g., 'Tomato_mosaic_virus', 'Late_blight')
    disease_key TEXT NOT NULL,
    
    -- Language code: 'en', 'hi', 'te'
    language_code TEXT NOT NULL,
    
    -- CONTENT COLUMNS
    -- Since SQLite doesn't support Arrays, we store these 
    -- as TEXT strings formatted as JSON (e.g., "['Cause 1', 'Cause 2']")
    causes_json TEXT,
    cures_json TEXT,
    suggestions_json TEXT,

    -- Optional: A consolidated string for Text-to-Speech to read smoothly
    tts_summary TEXT,

    -- Performance Index: Makes lookups instant
    UNIQUE(disease_key, language_code)
);

-- 2. Index for fast retrieval
-- When the app asks: "Give me Tomato Mosaic Virus in Telugu", this index makes it instant.
CREATE INDEX idx_lookup ON disease_content (disease_key, language_code);