import os
import sys
import psycopg2

# Load DATABASE_URL (CLI arg > env > app settings)
DATABASE_URL = None
if len(sys.argv) > 1 and sys.argv[1]:
    DATABASE_URL = sys.argv[1]
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    try:
        from app.core.config import settings  # type: ignore
        DATABASE_URL = settings.database_url
    except Exception:
        pass
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not provided.")
    sys.exit(1)

TYPES = ["servicestatus", "servicetype", "servicepriority"]

SQL = """
SELECT t.typname, e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = ANY(%s)
ORDER BY 1, 2;
"""

def main():
    print(f"Connecting to {DATABASE_URL}")
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(SQL, (TYPES,))
            rows = cur.fetchall()
            if not rows:
                print("No enum labels found for service enums.")
                return
            current = {}
            for typ, label in rows:
                current.setdefault(typ, []).append(label)
            for typ in TYPES:
                labels = current.get(typ, [])
                print(f"{typ}: {labels}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
