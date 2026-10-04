import logging
from sqlalchemy import inspect, text

logger = logging.getLogger(__name__)

def run_auto_migrations(engine):
    """
    Ensures that any new schema columns added to SQLAlchemy models
    are dynamically applied to existing tables without data loss.
    """
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        with engine.connect() as conn:
            # 1. fields table
            if "fields" in tables:
                field_cols = [c["name"] for c in inspector.get_columns("fields")]
                if "area_unit" not in field_cols:
                    conn.execute(text("ALTER TABLE fields ADD COLUMN area_unit VARCHAR(20) DEFAULT 'acres'"))
                if "irrigation_method" not in field_cols:
                    conn.execute(text("ALTER TABLE fields ADD COLUMN irrigation_method VARCHAR(50)"))

            # 2. crops table
            if "crops" in tables:
                crop_cols = [c["name"] for c in inspector.get_columns("crops")]
                if "expected_harvest_date" not in crop_cols:
                    conn.execute(text("ALTER TABLE crops ADD COLUMN expected_harvest_date DATETIME"))
                if "irrigation_method" not in crop_cols:
                    conn.execute(text("ALTER TABLE crops ADD COLUMN irrigation_method VARCHAR(50)"))
                if "notes" not in crop_cols:
                    conn.execute(text("ALTER TABLE crops ADD COLUMN notes TEXT"))

            # 3. soil_readings table
            if "soil_readings" in tables:
                soil_cols = [c["name"] for c in inspector.get_columns("soil_readings")]
                if "organic_carbon" not in soil_cols:
                    conn.execute(text("ALTER TABLE soil_readings ADD COLUMN organic_carbon FLOAT"))
                if "source" not in soil_cols:
                    conn.execute(text("ALTER TABLE soil_readings ADD COLUMN source VARCHAR(50) DEFAULT 'manual'"))

            # 4. farms table
            if "farms" in tables:
                farm_cols = [c["name"] for c in inspector.get_columns("farms")]
                if "unit" not in farm_cols:
                    conn.execute(text("ALTER TABLE farms ADD COLUMN unit VARCHAR(20) DEFAULT 'acres'"))
                if "state" not in farm_cols:
                    conn.execute(text("ALTER TABLE farms ADD COLUMN state VARCHAR(100)"))
                if "district" not in farm_cols:
                    conn.execute(text("ALTER TABLE farms ADD COLUMN district VARCHAR(100)"))
                if "city" not in farm_cols:
                    conn.execute(text("ALTER TABLE farms ADD COLUMN city VARCHAR(100)"))
                if "latitude" not in farm_cols:
                    conn.execute(text("ALTER TABLE farms ADD COLUMN latitude FLOAT"))
                if "longitude" not in farm_cols:
                    conn.execute(text("ALTER TABLE farms ADD COLUMN longitude FLOAT"))
                if "description" not in farm_cols:
                    conn.execute(text("ALTER TABLE farms ADD COLUMN description TEXT"))

            conn.commit()
            logger.info("Auto-migrations completed successfully.")
    except Exception as e:
        logger.warning(f"Auto-migration note: {e}")
