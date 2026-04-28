import sqlite3
import os

# Resolve database path - pointing to backend/data/lca_data.db
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_path = os.path.join(backend_dir, "data", "lca_data.db")

print(f"Opening database at: {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Update 'processes' table
cursor.execute("PRAGMA table_info(processes);")
proc_cols = {col[1] for col in cursor.fetchall()}
if "parameters_json" not in proc_cols:
    print("Adding parameters_json column to 'processes'...")
    cursor.execute("ALTER TABLE processes ADD COLUMN parameters_json JSON DEFAULT '{}';")

# 2. Update 'exchanges' table
cursor.execute("PRAGMA table_info(exchanges);")
ex_cols = {col[1] for col in cursor.fetchall()}
if "formula" not in ex_cols:
    print("Adding formula column to 'exchanges'...")
    cursor.execute("ALTER TABLE exchanges ADD COLUMN formula TEXT;")

conn.commit()
conn.close()
print("Migration completed successfully.")
