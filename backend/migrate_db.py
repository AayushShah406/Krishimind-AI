import sqlite3

def run_migration():
    con = sqlite3.connect("backend/krishimind.db")
    cur = con.cursor()

    def add_col_if_missing(table, col, col_type):
        cols = [c[1] for c in cur.execute(f"PRAGMA table_info({table})").fetchall()]
        if col not in cols:
            print(f"Adding {col} to {table}...")
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
            con.commit()

    add_col_if_missing("soil_readings", "electrical_conductivity", "REAL")
    add_col_if_missing("soil_readings", "notes", "TEXT")
    add_col_if_missing("soil_readings", "source", "TEXT DEFAULT 'manual'")
    add_col_if_missing("soil_readings", "device_id", "TEXT")

    add_col_if_missing("crop_images", "question", "TEXT")

    add_col_if_missing("image_analyses", "crop_detected", "TEXT")
    add_col_if_missing("image_analyses", "possible_disease", "TEXT")
    add_col_if_missing("image_analyses", "possible_pest_damage", "TEXT")
    add_col_if_missing("image_analyses", "possible_nutrient_deficiency", "TEXT")
    add_col_if_missing("image_analyses", "recommended_next_steps", "TEXT")
    add_col_if_missing("image_analyses", "prevention_measures", "TEXT")
    add_col_if_missing("image_analyses", "is_confirmed_diagnosis", "BOOLEAN DEFAULT 0")
    add_col_if_missing("image_analyses", "diagnosis_disclaimer", "TEXT")
    add_col_if_missing("image_analyses", "retrieved_knowledge", "TEXT")
    add_col_if_missing("image_analyses", "conversation_history", "TEXT")

    con.close()
    print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
