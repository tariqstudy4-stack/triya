import sqlite3
import os

# Triya.io Configuration - Pathway B (Persistent)
DB_PATH = r"C:\Users\Asus\Documents\triya\Database_Triya\triya_poc.db"
DATA_BASES_DIR = r"C:\Users\Asus\Documents\triya\Database_Triya\data_bases"

# Shifted Global Databases
LCIA_METHODS_ZIP = os.path.join(DATA_BASES_DIR, "openLCA LCIA Methods 2.8.0 2025-12-15.zip")
NEEDS_ZOLCA = os.path.join(DATA_BASES_DIR, "needs_18.zolca")
AWARE_JSON = os.path.join(DATA_BASES_DIR, "AWARE_v1_2_setup_openlca_2024-10-30.json")

def seed():
    print(f"--- Seeding Database in Triya.io Research Pathway ({DB_PATH}) ---")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create table if not exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lca_processes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_name TEXT,
            unit TEXT,
            gwp_climate_change REAL,
            odp_ozone_depletion REAL,
            ap_acidification REAL,
            ep_freshwater REAL,
            ep_marine REAL,
            ep_terrestrial REAL,
            pocp_photochemical_ozone REAL,
            pm_particulate_matter REAL,
            ir_ionising_radiation REAL,
            ht_c_human_toxicity_cancer REAL,
            ht_nc_human_toxicity_non_cancer REAL,
            et_fw_ecotoxicity_freshwater REAL,
            lu_land_use REAL,
            wsf_water_scarcity REAL,
            ru_mm_resource_use_min_met REAL,
            ru_f_resource_use_fossils REAL
        )
    """)

    # Clear old data
    cursor.execute("DELETE FROM lca_processes")

    # 1. Background Dataset (for AI Context)
    background_data = [
        ("LDPE Granulate", "kg", 2.0, 1e-7, 0.004, 0.0001, 0.002, 0.015, 0.0005, 1e-6, 1.2, 1e-9, 2e-8, 0.5, 15, 20, 0.0001, 35),
        ("HDPE Granulate", "kg", 1.9, 1e-7, 0.0035, 0.00009, 0.0018, 0.014, 0.00045, 1e-6, 1.1, 1e-9, 2e-8, 0.45, 14, 18, 0.00009, 32),
        ("PP Granulate", "kg", 2.1, 1e-7, 0.0045, 0.00011, 0.0022, 0.016, 0.00055, 1e-6, 1.3, 1e-9, 2e-8, 0.55, 16, 22, 0.00011, 38),
        ("PVC Granulate", "kg", 2.5, 1e-7, 0.006, 0.00015, 0.003, 0.02, 0.0007, 1e-6, 1.6, 1e-9, 2e-8, 0.7, 20, 25, 0.00015, 45)
    ]

    for item in background_data:
        cursor.execute("""
            INSERT INTO lca_processes (
                process_name, unit, gwp_climate_change, odp_ozone_depletion, ap_acidification,
                ep_freshwater, ep_marine, ep_terrestrial, pocp_photochemical_ozone,
                pm_particulate_matter, ir_ionising_radiation, ht_c_human_toxicity_cancer,
                ht_nc_human_toxicity_non_cancer, et_fw_ecotoxicity_freshwater, lu_land_use,
                wsf_water_scarcity, ru_mm_resource_use_min_met, ru_f_resource_use_fossils
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, item)

    # 2. PET Benchy (With Intentional Gaps for AI Demo)
    # Gaps: Acidification (None), Eutrophication Freshwater (None)
    cursor.execute("""
        INSERT INTO lca_processes (
            process_name, unit, gwp_climate_change, odp_ozone_depletion, ap_acidification,
            ep_freshwater, ep_marine, ep_terrestrial, pocp_photochemical_ozone,
            pm_particulate_matter, ir_ionising_radiation, ht_c_human_toxicity_cancer,
            ht_nc_human_toxicity_non_cancer, et_fw_ecotoxicity_freshwater, lu_land_use,
            wsf_water_scarcity, ru_mm_resource_use_min_met, ru_f_resource_use_fossils
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "1 kg PET Bottle", "kg", 2.5, 1.5e-7, None, 
        None, 0.0025, 0.018, 0.0006, 1.2e-6, 1.4, 1.5e-9, 
        2.5e-8, 0.65, 18, 24, 0.00013, 40
    ))

    conn.commit()
    print(f"SUCCESS: Seeded {len(background_data) + 1} processes into {DB_PATH}.")
    conn.close()

if __name__ == "__main__":
    seed()
