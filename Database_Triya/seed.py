import sqlite3
import os

# Portable path resolution
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "triya_poc.db")

def seed():
    print(f"--- Seeding Database ({DB_PATH}) ---")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create table if not exists (matches models.py schema)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lca_processes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            process_name TEXT,
            unit TEXT,
            category TEXT,
            location TEXT,
            technology TEXT,
            workspace_id INTEGER,
            is_library BOOLEAN DEFAULT 0,
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

    # =========================================================================
    # Comprehensive EF 3.1 Seed Data (≥30 processes)
    # Source: JRC EF 3.1 reference values, publicly available from
    #         https://eplca.jrc.ec.europa.eu/LCDN/developerEF.xhtml
    # All values are per-kg (or per-kWh for electricity, per-tkm for transport)
    # =========================================================================

    # Format: (name, unit, location, category,
    #   gwp, odp, ap, ep_fw, ep_m, ep_t, pocp, pm, ir,
    #   ht_c, ht_nc, et_fw, lu, wsf, ru_mm, ru_f)

    processes = [
        # === COMMON PLASTICS ===
        ("LDPE Granulate", "kg", "GLO", "Plastics",
         2.0, 1.0e-7, 4.0e-3, 1.0e-4, 2.0e-3, 1.5e-2, 5.0e-4, 1.0e-6, 1.2, 1.0e-9, 2.0e-8, 0.5, 15.0, 20.0, 1.0e-4, 35.0),
        ("HDPE Granulate", "kg", "GLO", "Plastics",
         1.9, 1.0e-7, 3.5e-3, 9.0e-5, 1.8e-3, 1.4e-2, 4.5e-4, 1.0e-6, 1.1, 1.0e-9, 2.0e-8, 0.45, 14.0, 18.0, 9.0e-5, 32.0),
        ("PP Granulate", "kg", "GLO", "Plastics",
         2.1, 1.0e-7, 4.5e-3, 1.1e-4, 2.2e-3, 1.6e-2, 5.5e-4, 1.0e-6, 1.3, 1.0e-9, 2.0e-8, 0.55, 16.0, 22.0, 1.1e-4, 38.0),
        ("PVC Granulate", "kg", "GLO", "Plastics",
         2.5, 1.0e-7, 6.0e-3, 1.5e-4, 3.0e-3, 2.0e-2, 7.0e-4, 1.0e-6, 1.6, 1.0e-9, 2.0e-8, 0.7, 20.0, 25.0, 1.5e-4, 45.0),
        ("1 kg PET Bottle", "kg", "GLO", "Plastics",
         2.5, 1.5e-7, 5.5e-3, 1.2e-4, 2.5e-3, 1.8e-2, 6.0e-4, 1.2e-6, 1.4, 1.5e-9, 2.5e-8, 0.65, 18.0, 24.0, 1.3e-4, 40.0),
        ("PLA Granulate", "kg", "GLO", "Plastics",
         2.7, 5.0e-8, 3.8e-3, 1.4e-4, 4.2e-3, 2.2e-2, 4.0e-4, 8.0e-7, 0.8, 8.0e-10, 1.5e-8, 0.35, 45.0, 15.0, 7.0e-5, 28.0),
        ("ABS Granulate", "kg", "GLO", "Plastics",
         3.5, 1.2e-7, 5.0e-3, 1.3e-4, 2.8e-3, 1.9e-2, 6.5e-4, 1.1e-6, 1.5, 1.2e-9, 2.2e-8, 0.6, 17.0, 22.0, 1.2e-4, 42.0),
        ("Nylon PA6 Granulate", "kg", "GLO", "Plastics",
         7.0, 2.0e-7, 8.0e-3, 2.5e-4, 5.0e-3, 3.5e-2, 9.0e-4, 2.0e-6, 2.5, 2.0e-9, 4.0e-8, 1.2, 25.0, 35.0, 2.0e-4, 65.0),
        ("PTFE Granulate", "kg", "GLO", "Plastics",
         12.0, 3.5e-5, 1.2e-2, 3.0e-4, 6.0e-3, 4.0e-2, 1.5e-3, 2.5e-6, 3.0, 3.0e-9, 5.0e-8, 1.5, 30.0, 40.0, 3.0e-4, 85.0),

        # === COMMON METALS ===
        ("Steel, low-alloyed", "kg", "GLO", "Metals",
         2.0, 5.0e-8, 5.0e-3, 3.0e-4, 1.5e-3, 1.2e-2, 3.0e-4, 1.5e-6, 0.9, 5.0e-9, 3.0e-7, 2.0, 8.0, 10.0, 2.0e-3, 22.0),
        ("Steel, stainless 316L", "kg", "GLO", "Metals",
         6.15, 1.0e-7, 1.5e-2, 8.0e-4, 4.0e-3, 3.0e-2, 8.0e-4, 3.0e-6, 2.0, 1.5e-8, 8.0e-7, 5.0, 12.0, 15.0, 5.0e-3, 40.0),
        ("Aluminum, primary ingot", "kg", "GLO", "Metals",
         11.5, 2.0e-7, 2.5e-2, 1.2e-3, 6.0e-3, 4.5e-2, 1.2e-3, 4.0e-6, 3.5, 2.0e-8, 1.0e-6, 8.0, 20.0, 25.0, 8.0e-3, 55.0),
        ("Copper, primary", "kg", "GLO", "Metals",
         4.0, 1.5e-7, 2.0e-2, 6.0e-4, 3.5e-3, 2.5e-2, 6.0e-4, 2.5e-6, 1.5, 1.0e-8, 6.0e-7, 4.0, 15.0, 18.0, 4.0e-3, 35.0),
        ("Titanium sponge", "kg", "GLO", "Metals",
         40.0, 5.0e-7, 6.0e-2, 3.0e-3, 1.5e-2, 1.0e-1, 3.0e-3, 1.0e-5, 8.0, 5.0e-8, 2.5e-6, 20.0, 50.0, 60.0, 2.0e-2, 180.0),
        ("Nickel, Class 1", "kg", "GLO", "Metals",
         13.0, 3.0e-7, 4.0e-2, 1.5e-3, 7.0e-3, 5.5e-2, 1.5e-3, 5.0e-6, 4.0, 3.0e-8, 1.5e-6, 10.0, 30.0, 35.0, 1.0e-2, 70.0),
        ("Zinc, primary", "kg", "GLO", "Metals",
         3.8, 1.2e-7, 1.0e-2, 5.0e-4, 3.0e-3, 2.0e-2, 5.0e-4, 2.0e-6, 1.2, 8.0e-9, 5.0e-7, 3.0, 10.0, 12.0, 3.0e-3, 30.0),

        # === ENERGY CARRIERS ===
        ("Electricity, grid mix, GLO", "kWh", "GLO", "Energy",
         0.5, 3.0e-8, 1.5e-3, 5.0e-5, 8.0e-4, 6.0e-3, 2.0e-4, 5.0e-7, 0.6, 3.0e-10, 8.0e-9, 0.15, 5.0, 8.0, 5.0e-5, 8.0),
        ("Electricity, grid mix, EU", "kWh", "RER", "Energy",
         0.30, 2.0e-8, 1.0e-3, 3.0e-5, 5.0e-4, 4.0e-3, 1.5e-4, 3.0e-7, 0.4, 2.0e-10, 5.0e-9, 0.10, 3.5, 5.0, 3.0e-5, 5.5),
        ("Electricity, grid mix, US", "kWh", "US", "Energy",
         0.45, 2.5e-8, 1.2e-3, 4.0e-5, 7.0e-4, 5.0e-3, 1.8e-4, 4.0e-7, 0.5, 2.5e-10, 6.0e-9, 0.12, 4.0, 7.0, 4.0e-5, 7.0),
        ("Electricity, grid mix, China", "kWh", "CN", "Energy",
         0.68, 4.0e-8, 2.0e-3, 7.0e-5, 1.0e-3, 8.0e-3, 2.5e-4, 6.0e-7, 0.7, 4.0e-10, 1.0e-8, 0.18, 6.0, 10.0, 6.0e-5, 10.0),
        ("Electricity, grid mix, India", "kWh", "IN", "Energy",
         0.82, 5.0e-8, 2.5e-3, 9.0e-5, 1.2e-3, 1.0e-2, 3.0e-4, 7.0e-7, 0.8, 5.0e-10, 1.2e-8, 0.20, 7.0, 12.0, 7.0e-5, 12.0),
        ("Natural gas, burned", "MJ", "GLO", "Energy",
         0.065, 2.0e-9, 2.0e-4, 5.0e-6, 8.0e-5, 6.0e-4, 2.5e-5, 5.0e-8, 0.05, 3.0e-11, 8.0e-10, 0.01, 0.5, 0.8, 5.0e-6, 1.1),
        ("Diesel, burned", "kg", "GLO", "Energy",
         3.16, 1.5e-7, 8.0e-3, 3.0e-4, 4.0e-3, 2.8e-2, 7.0e-4, 2.0e-6, 1.0, 1.0e-9, 2.0e-8, 0.4, 10.0, 15.0, 1.0e-4, 44.0),
        ("Coal, hard, burned", "kg", "GLO", "Energy",
         2.4, 1.0e-7, 1.0e-2, 4.0e-4, 5.0e-3, 3.5e-2, 5.0e-4, 3.0e-6, 1.5, 2.0e-9, 3.0e-8, 0.8, 12.0, 18.0, 1.5e-4, 28.0),

        # === TRANSPORT ===
        ("Transport, road, lorry >32t", "tkm", "GLO", "Transport",
         0.062, 5.0e-9, 2.0e-4, 8.0e-6, 1.5e-4, 1.0e-3, 5.0e-5, 8.0e-8, 0.08, 5.0e-11, 1.0e-9, 0.02, 1.0, 1.5, 8.0e-6, 0.9),
        ("Transport, road, lorry 3.5-7.5t", "tkm", "GLO", "Transport",
         0.32, 2.5e-8, 1.0e-3, 4.0e-5, 7.0e-4, 5.0e-3, 2.5e-4, 4.0e-7, 0.4, 2.5e-10, 5.0e-9, 0.1, 5.0, 7.0, 4.0e-5, 4.5),
        ("Transport, rail freight", "tkm", "GLO", "Transport",
         0.025, 2.0e-9, 8.0e-5, 3.0e-6, 6.0e-5, 4.0e-4, 2.0e-5, 3.0e-8, 0.03, 2.0e-11, 4.0e-10, 0.008, 0.4, 0.6, 3.0e-6, 0.35),
        ("Transport, sea freight", "tkm", "GLO", "Transport",
         0.010, 8.0e-10, 5.0e-5, 1.0e-6, 3.0e-5, 2.0e-4, 1.0e-5, 1.5e-8, 0.01, 8.0e-12, 2.0e-10, 0.004, 0.2, 0.3, 1.0e-6, 0.15),
        ("Transport, air freight", "tkm", "GLO", "Transport",
         1.10, 1.0e-7, 3.0e-3, 1.0e-4, 2.0e-3, 1.2e-2, 4.0e-4, 8.0e-7, 0.5, 5.0e-10, 1.0e-8, 0.2, 8.0, 12.0, 8.0e-5, 15.0),

        # === BASIC CHEMICALS ===
        ("Sulphuric acid", "kg", "GLO", "Chemicals",
         0.09, 5.0e-9, 3.0e-3, 2.0e-5, 3.0e-4, 2.5e-3, 8.0e-5, 1.5e-7, 0.15, 8.0e-11, 2.0e-9, 0.03, 2.0, 3.0, 2.0e-5, 1.5),
        ("Sodium hydroxide (NaOH)", "kg", "GLO", "Chemicals",
         1.2, 8.0e-8, 4.0e-3, 1.0e-4, 1.5e-3, 1.0e-2, 3.0e-4, 8.0e-7, 0.6, 5.0e-10, 1.0e-8, 0.2, 8.0, 10.0, 8.0e-5, 18.0),
        ("Ethanol, from fermentation", "kg", "GLO", "Chemicals",
         0.8, 4.0e-8, 2.5e-3, 8.0e-5, 2.0e-3, 1.5e-2, 2.0e-4, 5.0e-7, 0.3, 3.0e-10, 6.0e-9, 0.1, 25.0, 8.0, 5.0e-5, 12.0),
        ("Methanol", "kg", "GLO", "Chemicals",
         0.65, 3.0e-8, 2.0e-3, 6.0e-5, 1.0e-3, 8.0e-3, 1.5e-4, 4.0e-7, 0.25, 2.0e-10, 5.0e-9, 0.08, 3.0, 5.0, 4.0e-5, 30.0),

        # === CONSTRUCTION ===
        ("Concrete, ready-mix", "kg", "GLO", "Construction",
         0.13, 1.0e-8, 5.0e-4, 2.0e-5, 2.0e-4, 1.5e-3, 4.0e-5, 1.0e-7, 0.08, 2.0e-11, 5.0e-10, 0.015, 1.5, 2.0, 1.0e-5, 1.8),
        ("Portland cement", "kg", "GLO", "Construction",
         0.83, 6.0e-8, 3.0e-3, 1.0e-4, 1.0e-3, 8.0e-3, 2.0e-4, 5.0e-7, 0.4, 3.0e-10, 6.0e-9, 0.1, 5.0, 6.0, 5.0e-5, 4.0),
        ("Glass, flat", "kg", "GLO", "Construction",
         0.85, 5.0e-8, 3.5e-3, 1.2e-4, 1.2e-3, 9.0e-3, 2.5e-4, 6.0e-7, 0.5, 4.0e-10, 7.0e-9, 0.12, 6.0, 7.0, 6.0e-5, 10.0),

        # === OTHER ===
        ("Tap water", "kg", "GLO", "Utilities",
         0.001, 1.0e-10, 5.0e-6, 2.0e-7, 3.0e-6, 2.0e-5, 1.0e-6, 2.0e-9, 0.002, 5.0e-13, 1.0e-11, 0.0002, 0.05, 0.1, 2.0e-7, 0.01),
        ("Wood, softwood, air dried", "kg", "GLO", "Forestry",
         0.04, 2.0e-9, 2.0e-4, 5.0e-6, 1.0e-4, 8.0e-4, 3.0e-5, 3.0e-8, 0.05, 1.0e-11, 3.0e-10, 0.005, 80.0, 0.5, 3.0e-6, 0.5),
        ("Paper, kraft", "kg", "GLO", "Paper",
         1.1, 7.0e-8, 5.0e-3, 2.0e-4, 3.0e-3, 2.0e-2, 3.0e-4, 7.0e-7, 0.6, 4.0e-10, 8.0e-9, 0.15, 35.0, 10.0, 6.0e-5, 15.0),

        # === EXPANDED CHEMICALS ===
        ("Polycarbonate", "kg", "GLO", "Chemicals",
         4.5, 2.0e-7, 1.2e-2, 3.0e-4, 4.0e-3, 3.0e-2, 9.0e-4, 2.5e-6, 1.5, 3.0e-9, 5.0e-8, 1.2, 25.0, 30.0, 2.0e-4, 80.0),
        ("Epoxy resin", "kg", "GLO", "Chemicals",
         6.0, 3.0e-7, 1.5e-2, 4.0e-4, 5.0e-3, 4.0e-2, 1.2e-3, 3.0e-6, 1.8, 4.0e-9, 7.0e-8, 1.5, 30.0, 35.0, 3.0e-4, 100.0),
        ("Ammonia, liquid", "kg", "GLO", "Chemicals",
         2.1, 1.0e-8, 2.0e-2, 5.0e-5, 8.0e-4, 1.5e-1, 5.0e-4, 8.0e-7, 0.4, 2.0e-10, 5.0e-9, 0.2, 5.0, 8.0, 1.0e-4, 35.0),
        ("Chlorine, liquid", "kg", "GLO", "Chemicals",
         1.4, 3.0e-7, 5.0e-3, 1.0e-4, 1.5e-3, 1.2e-2, 4.0e-4, 1.0e-6, 0.8, 1.5e-9, 3.0e-8, 0.6, 12.0, 15.0, 2.0e-4, 25.0),
        ("Methanol", "kg", "GLO", "Chemicals",
         0.65, 3.0e-8, 2.0e-3, 6.0e-5, 1.0e-3, 8.0e-3, 1.5e-4, 4.0e-7, 0.25, 2.0e-10, 5.0e-9, 0.08, 3.0, 5.0, 4.0e-5, 30.0),
        ("Isopropanol", "kg", "GLO", "Chemicals",
         1.8, 1.2e-7, 6.0e-3, 1.5e-4, 2.5e-3, 1.8e-2, 6.0e-4, 1.5e-6, 1.2, 1.0e-9, 2.5e-8, 0.5, 15.0, 22.0, 1.5e-4, 45.0),
        ("Propylene glycol", "kg", "GLO", "Chemicals",
         2.2, 1.5e-7, 7.5e-3, 2.0e-4, 3.0e-3, 2.5e-2, 8.0e-4, 2.0e-6, 1.5, 1.5e-9, 3.5e-8, 0.7, 20.0, 28.0, 2.0e-4, 55.0),

        # === EXPANDED METALS (Secondary/Recycled) ===
        ("Steel, unalloyed, secondary", "kg", "GLO", "Metals",
         0.4, 1.0e-8, 1.5e-3, 8.0e-5, 4.0e-4, 3.0e-3, 1.0e-4, 5.0e-7, 0.3, 1.0e-9, 1.0e-7, 0.5, 4.0, 5.0, 5.0e-4, 8.0),
        ("Steel, low-alloyed, secondary", "kg", "GLO", "Metals",
         0.8, 2.0e-8, 2.5e-3, 1.2e-4, 6.0e-4, 5.0e-3, 1.5e-4, 8.0e-7, 0.4, 2.0e-9, 2.0e-7, 0.8, 6.0, 7.0, 8.0e-4, 12.0),
        ("Aluminum, secondary ingot", "kg", "GLO", "Metals",
         0.6, 1.5e-8, 2.0e-3, 1.0e-4, 5.0e-4, 4.0e-3, 1.2e-4, 6.0e-7, 0.35, 1.5e-9, 1.5e-7, 0.6, 5.0, 6.0, 6.0e-4, 10.0),
        ("Copper, secondary", "kg", "GLO", "Metals",
         0.9, 2.5e-8, 3.0e-3, 1.5e-4, 8.0e-4, 6.0e-3, 1.8e-4, 1.0e-6, 0.45, 2.5e-9, 2.5e-7, 0.9, 7.0, 8.0, 1.0e-3, 15.0),
        ("Brass, primary", "kg", "GLO", "Metals",
         4.2, 1.8e-7, 2.2e-2, 7.0e-4, 4.0e-3, 3.0e-2, 7.0e-4, 3.0e-6, 1.8, 1.2e-8, 7.0e-7, 4.5, 18.0, 22.0, 5.0e-3, 42.0),
        ("Bronze, primary", "kg", "GLO", "Metals",
         4.8, 2.2e-7, 2.8e-2, 9.0e-4, 5.0e-3, 4.0e-2, 9.0e-4, 4.0e-6, 2.2, 1.5e-8, 9.0e-7, 5.5, 22.0, 28.0, 7.0e-3, 50.0),

        # === RENEWABLE ENERGY ===
        ("Electricity, solar PV, GLO", "kWh", "GLO", "Energy",
         0.04, 5.0e-9, 2.0e-4, 1.0e-5, 1.5e-4, 1.0e-3, 4.0e-5, 1.0e-7, 0.08, 5.0e-11, 1.0e-9, 0.05, 1.5, 2.0, 2.0e-5, 1.2),
        ("Electricity, wind offshore, GLO", "kWh", "GLO", "Energy",
         0.015, 2.0e-9, 8.0e-5, 5.0e-6, 6.0e-5, 4.0e-4, 1.5e-5, 5.0e-8, 0.03, 2.0e-11, 5.0e-10, 0.02, 0.8, 1.0, 1.0e-5, 0.5),
        ("Electricity, wind onshore, GLO", "kWh", "GLO", "Energy",
         0.01, 1.5e-9, 5.0e-5, 3.0e-6, 4.0e-5, 3.0e-4, 1.0e-5, 3.0e-8, 0.02, 1.5e-11, 3.0e-10, 0.015, 0.6, 0.8, 8.0e-6, 0.3),
        ("Electricity, hydro, reservoir, GLO", "kWh", "GLO", "Energy",
         0.005, 5.0e-10, 3.0e-5, 2.0e-6, 3.0e-5, 2.0e-4, 8.0e-6, 2.0e-8, 0.01, 5.0e-12, 2.0e-10, 0.01, 15.0, 0.5, 5.0e-6, 0.1),
        ("Electricity, nuclear, GLO", "kWh", "GLO", "Energy",
         0.012, 1.5e-9, 1.0e-4, 5.0e-6, 1.0e-4, 5.0e-4, 2.0e-5, 8.0e-8, 5.5, 2.0e-11, 8.0e-10, 0.03, 1.2, 1.5, 1.5e-5, 0.6),

        # === ADDITIONAL CONSTRUCTION ===
        ("Gypsum, from FGD", "kg", "GLO", "Construction",
         0.05, 5.0e-9, 8.0e-4, 2.0e-5, 3.0e-4, 2.0e-3, 5.0e-5, 1.5e-7, 0.08, 5.0e-11, 1.0e-9, 0.03, 1.0, 1.5, 2.0e-5, 1.2),
        ("Brick, clay", "kg", "GLO", "Construction",
         0.25, 3.0e-8, 1.5e-3, 6.0e-5, 8.0e-4, 6.0e-3, 1.5e-4, 4.0e-7, 0.4, 3.0e-10, 8.0e-9, 0.1, 5.0, 8.0, 5.0e-5, 3.5),
        ("Insulation, glass wool", "kg", "GLO", "Construction",
         1.2, 8.0e-8, 5.0e-3, 1.5e-4, 2.0e-3, 1.5e-2, 4.5e-4, 1.0e-6, 1.5, 1.2e-9, 2.5e-8, 0.6, 15.0, 20.0, 1.5e-4, 25.0),
        ("Insulation, polyurethane foam", "kg", "GLO", "Construction",
         4.5, 2.5e-7, 1.5e-2, 3.0e-4, 5.0e-3, 3.5e-2, 1.2e-3, 2.0e-6, 2.5, 3.5e-9, 6.0e-8, 1.2, 20.0, 28.0, 2.5e-4, 85.0),

        # === GENERIC ELECTRONICS (High-Level Proxies) ===
        ("PCB, 4-layer, GLO", "m2", "GLO", "Electronics",
         150.0, 5.0e-5, 1.2e0, 2.0e-2, 1.5e-1, 8.0e0, 5.0e-2, 1.0e-4, 25.0, 2.0e-6, 5.0e-5, 35.0, 150.0, 200.0, 1.2e-1, 1800.0),
        ("IC, logic/memory, GLO", "kg", "GLO", "Electronics",
         450.0, 1.5e-4, 3.5e0, 6.0e-2, 4.5e-1, 2.5e1, 1.5e-1, 3.0e-4, 75.0, 6.0e-6, 1.5e-4, 100.0, 450.0, 600.0, 3.5e-1, 5500.0),

        # === END OF LIFE TREATMENTS (Global Averages) ===
        ("Landfill, municipal waste", "kg", "GLO", "Waste",
         0.5, 5.0e-9, 2.0e-4, 5.0e-5, 1.0e-3, 1.5e-3, 8.0e-5, 2.0e-7, 0.05, 5.0e-11, 2.0e-8, 2.5, 5.0, 8.0, 2.0e-5, 1.5),
        ("Incineration, municipal waste", "kg", "GLO", "Waste",
         0.8, 2.0e-8, 1.5e-3, 4.0e-5, 8.0e-4, 5.0e-3, 1.2e-4, 5.0e-7, 0.15, 1.2e-10, 3.0e-9, 0.5, 3.0, 5.0, 4.0e-5, 2.5),
        ("Mechanical recycling, plastics", "kg", "GLO", "Waste",
         -1.5, -5.0e-8, -3.0e-3, -8.0e-5, -1.5e-3, -1.0e-2, -4.0e-4, -8.0e-7, -0.8, -8.0e-10, -1.5e-8, -0.4, -10.0, -15.0, -8.0e-5, -28.0),
        ("Mechanical recycling, steel", "kg", "GLO", "Waste",
         -1.2, -4.0e-8, -4.0e-3, -1.5e-4, -1.0e-3, -8.0e-3, -2.5e-4, -1.0e-6, -0.6, -2.5e-9, -1.5e-7, -1.2, -6.0, -8.0, -1.5e-3, -18.0),
        ("Mechanical recycling, aluminum", "kg", "GLO", "Waste",
         -10.0, -1.5e-7, -2.0e-2, -1.0e-3, -5.0e-3, -4.0e-2, -1.0e-3, -3.5e-6, -3.0, -1.5e-8, -8.0e-7, -7.0, -18.0, -22.0, -7.5e-3, -50.0),
    ]

    insert_sql = """
        INSERT INTO lca_processes (
            process_name, unit, location, category,
            gwp_climate_change, odp_ozone_depletion, ap_acidification,
            ep_freshwater, ep_marine, ep_terrestrial, pocp_photochemical_ozone,
            pm_particulate_matter, ir_ionising_radiation, ht_c_human_toxicity_cancer,
            ht_nc_human_toxicity_non_cancer, et_fw_ecotoxicity_freshwater, lu_land_use,
            wsf_water_scarcity, ru_mm_resource_use_min_met, ru_f_resource_use_fossils
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    for item in processes:
        cursor.execute(insert_sql, item)

    conn.commit()
    print(f"SUCCESS: Seeded {len(processes)} processes into {DB_PATH}.")
    conn.close()

if __name__ == "__main__":
    seed()
