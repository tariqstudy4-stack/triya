import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Database_Triya", "triya_poc.db")
# Fallback to local data directory
if not os.path.exists(db_path):
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "lca_data.db")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(lca_processes);")
cols = cursor.fetchall()
for col in cols:
    print(f"Col: {col[1]}")
conn.close()
