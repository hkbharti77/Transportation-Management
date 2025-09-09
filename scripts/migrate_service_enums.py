import os
import sys
import psycopg2

# CLI arg > env
DATABASE_URL = sys.argv[1] if len(sys.argv) > 1 else os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: Provide DATABASE_URL as CLI arg or env var.")
    sys.exit(1)

NEW_TYPES = {
    "vehicle_servicetype": ["maintenance", "repair", "inspection", "cleaning", "fuel_refill", "tire_change", "oil_change"],
    "vehicle_servicestatus": ["scheduled", "in_progress", "completed", "cancelled", "overdue"],
    "vehicle_servicepriority": ["low", "medium", "high", "critical"],
}

SQL_CREATE_ENUM = "CREATE TYPE {name} AS ENUM ({values});"
SQL_ENUM_EXISTS = "SELECT 1 FROM pg_type WHERE typname = %s;"

# Compare via text and coerce any unknown/legacy labels to 'scheduled'
SQL_ADD_COL_TMP = """
ALTER TABLE services ADD COLUMN status_tmp "{status_type}";
UPDATE services SET status_tmp = (
  CASE status::text
    WHEN 'SCHEDULED' THEN 'scheduled'
    WHEN 'IN_PROGRESS' THEN 'in_progress'
    WHEN 'COMPLETED' THEN 'completed'
    WHEN 'CANCELLED' THEN 'cancelled'
    WHEN 'OVERDUE' THEN 'overdue'
    WHEN 'scheduled' THEN 'scheduled'
    WHEN 'in_progress' THEN 'in_progress'
    WHEN 'completed' THEN 'completed'
    WHEN 'cancelled' THEN 'cancelled'
    WHEN 'overdue' THEN 'overdue'
    ELSE 'scheduled'
  END
)::text::"{status_type}";
ALTER TABLE services ALTER COLUMN status TYPE "{status_type}" USING status_tmp;
ALTER TABLE services DROP COLUMN status_tmp;
"""

SQL_ALTER_TYPE = "ALTER TABLE services ALTER COLUMN {col} TYPE \"{type}\" USING {col}::text::\"{type}\";"


def ensure_types(cur):
    for name, labels in NEW_TYPES.items():
        cur.execute(SQL_ENUM_EXISTS, (name,))
        if cur.fetchone():
            continue
        values = ",".join(["'%s'" % v for v in labels])
        cur.execute(SQL_CREATE_ENUM.format(name=name, values=values))
        print(f"Created type {name}")


def migrate_status_column(cur):
    cur.execute(SQL_ADD_COL_TMP.format(status_type="vehicle_servicestatus"))
    print("Migrated services.status to vehicle_servicestatus")


def migrate_other_columns(cur):
    cur.execute(SQL_ALTER_TYPE.format(col="service_type", type="vehicle_servicetype"))
    print("Migrated services.service_type to vehicle_servicetype")
    cur.execute(SQL_ALTER_TYPE.format(col="priority", type="vehicle_servicepriority"))
    print("Migrated services.priority to vehicle_servicepriority")


def main():
    print(f"Connecting to {DATABASE_URL}")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            ensure_types(cur)
            migrate_status_column(cur)
            migrate_other_columns(cur)
        print("Done.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
