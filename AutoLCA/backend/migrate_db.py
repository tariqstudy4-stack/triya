import sqlite3
import os

# Resolve database path portably
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Database_Triya", "triya_poc.db")
if not os.path.exists(db_path):
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "lca_data.db")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get existing columns
cursor.execute("PRAGMA table_info(lca_processes);")
existing_cols = {col[1] for col in cursor.fetchall()}

# All desired columns from models.py
all_cols = [
    "gwp_climate_change", "odp_ozone_depletion", "ap_acidification", 
    "ep_freshwater", "ep_marine", "ep_terrestrial",
    "pocp_photochemical_ozone", "pm_particulate_matter", "ir_ionising_radiation", 
    "ht_c_human_toxicity_cancer", "ht_nc_human_toxicity_non_cancer", 
    "et_fw_ecotoxicity_freshwater", "lu_land_use", "wsf_water_scarcity", 
    "ru_mm_resource_use_min_met", "ru_f_resource_use_fossils",
    "category", "location", "technology"
]

for col in all_cols:
    if col not in existing_cols:
        print(f"Adding column: {col}")
        try:
            cursor.execute(f"ALTER TABLE lca_processes ADD COLUMN {col} FLOAT;")
        except Exception as e:
            print(f"Error adding {col}: {e}")

# Also check lca_exchanges
cursor.execute("PRAGMA table_info(lca_exchanges);")
existing_ex_cols = {col[1] for col in cursor.fetchall()}
ex_cols = {
    "uncertainty_type": "TEXT",
    "uncertainty_params": "JSON",
    "allocation_factor": "FLOAT",
    "is_parameter": "BOOLEAN",
    "description": "TEXT"
}

for col, dtype in ex_cols.items():
    if col not in existing_ex_cols:
        print(f"Adding column to lca_exchanges: {col}")
        try:
            cursor.execute(f"ALTER TABLE lca_exchanges ADD COLUMN {col} {dtype};")
        except Exception as e:
            print(f"Error adding {col} to exchanges: {e}")

conn.commit()
conn.close()
print("Migration done.")
