import os
import requests
import pytest

BASE_URL = "http://localhost:8000/api/process"

# Database Configuration for Benchmarking
DATA_BASES_DIR = r"C:\Users\Asus\Documents\triya\Database_Triya\data_bases"
NEEDS_DB = os.path.join(DATA_BASES_DIR, "needs_18.zolca")
AWARE_DB = os.path.join(DATA_BASES_DIR, "AWARE_v1_2_setup_openlca_2024-10-30.json")
LCIA_METHODS = os.path.join(DATA_BASES_DIR, "openLCA LCIA Methods 2.8.0 2025-12-15.zip")

def test_pet_benchy_accuracy():
    # 1. First, find the ID for the "1 kg PET Bottle"
    # We'll assume the process we just seeded is the target. 
    # In seed.py, it was the 5th process added (index 4 in list + 1). 
    # But to be safe, we'll fetch all processes if possible or just try ID 5.
    pet_id = 5 
    quantity = 10000
    
    response = requests.get(f"{BASE_URL}/{pet_id}/scale?params=quantity={quantity}")
    # Wait, our endpoint is /api/process/{process_id}/scale?quantity={val}
    response = requests.get(f"{BASE_URL}/{pet_id}/scale?quantity={quantity}")
    
    assert response.status_code == 200
    data = response.json()
    
    print(f"\nBenchmark Results for {data['process_name']}:")
    print(f"Scaled Quantity: {data['scaled_quantity']} {data['unit']}")
    
    impacts = data['impacts']
    
    # Assertion 1: Linear Scaling (GWP)
    # Ground Truth GWP = 2.5 per kg. For 10,000 kg -> 25,000
    gwp = impacts['gwp_climate_change']
    print(f"Climate Change (GWP): {gwp} kg CO2-eq")
    assert gwp == 25000.0, f"Expected 25000.0, got {gwp}"
    
    # Assertion 2: AI Imputation (Acidification Potential)
    # Ground Truth AP = 0.005 per kg. For 10,000 kg -> 50.0
    # Tolerance window: 40 to 60
    ap = impacts['ap_acidification']
    print(f"Acidification (AP): {ap} mol H+ eq")
    assert ap is not None
    assert 40 <= ap <= 60, f"AP {ap} out of tolerance window (40-60)"
    
    # Assertion 3: AI Imputation (Eutrophication Freshwater)
    # Ground Truth EP = 0.0001 per kg. For 10,000 kg -> 1.0
    ep = impacts['ep_freshwater']
    print(f"Eutrophication (EP): {ep} kg P eq")
    assert ep is not None
    assert 0.5 <= ep <= 1.5, f"EP {ep} out of tolerance window (0.5-1.5)"

    print("Benchmark PASSED: AI imputation and scaling are scientifically accurate.")

if __name__ == "__main__":
    # Run test manually if not using pytest
    try:
        test_pet_benchy_accuracy()
    except Exception as e:
        print(f"Benchmark FAILED: {e}")
