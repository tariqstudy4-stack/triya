import sqlite3
db_path = r"C:\Users\Asus\Documents\Database_Triya\triya_poc.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(lca_processes);")
cols = cursor.fetchall()
for col in cols:
    print(f"Col: {col[1]}")
conn.close()
