import os
import sys
import psycopg2

# Try to load DATABASE_URL from app settings first
DATABASE_URL = None
try:
    from app.core.config import settings  # type: ignore
    if getattr(settings, "database_url", None):
        DATABASE_URL = settings.database_url
except Exception:
    pass

# CLI arg overrides everything
if len(sys.argv) > 1 and sys.argv[1]:
    DATABASE_URL = sys.argv[1]

# Env var fallback
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not provided. Pass it as an argument or set it in env or app settings.")
    sys.exit(1)

RENAMES = {
    "servicetype": [
        ("MAINTENANCE", "maintenance"),
        ("REPAIR", "repair"),
        ("INSPECTION", "inspection"),
        ("CLEANING", "cleaning"),
        ("FUEL_REFILL", "fuel_refill"),
        ("TIRE_CHANGE", "tire_change"),
        ("OIL_CHANGE", "oil_change"),
    ],
    "servicestatus": [
        ("SCHEDULED", "scheduled"),
        ("IN_PROGRESS", "in_progress"),
        ("COMPLETED", "completed"),
        ("CANCELLED", "cancelled"),
        ("OVERDUE", "overdue"),
    ],
    "servicepriority": [
        ("LOW", "low"),
        ("MEDIUM", "medium"),
        ("HIGH", "high"),
        ("CRITICAL", "critical"),
    ],
}

SQL_CHECK_LABEL = """
SELECT 1 FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
WHERE t.typname = %s AND e.enumlabel = %s
"""

SQL_RENAME = "ALTER TYPE {type} RENAME VALUE %s TO %s;"


def main():
    print(f"Connecting to {DATABASE_URL}")
    try:
        conn = psycopg2.connect(DATABASE_URL)
    except Exception as ex:
        print("Failed to connect to the database. Provide a valid connection string.")
        print(ex)
        sys.exit(1)

    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            for enum_type, mappings in RENAMES.items():
                for old, new in mappings:
                    cur.execute(SQL_CHECK_LABEL, (enum_type, old))
                    exists_old = cur.fetchone() is not None
                    if not exists_old:
                        continue
                    cur.execute(SQL_CHECK_LABEL, (enum_type, new))
                    exists_new = cur.fetchone() is not None
                    if exists_new:
                        print(f"[{enum_type}] target label '{new}' already exists; skipping rename from '{old}'.")
                        continue
                    stmt = SQL_RENAME.format(type=enum_type)
                    try:
                        cur.execute(stmt, (old, new))
                        print(f"[{enum_type}] Renamed '{old}' -> '{new}'.")
                    except Exception as ex:
                        print(f"[{enum_type}] Failed to rename '{old}' -> '{new}': {ex}")
        print("Done.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()

