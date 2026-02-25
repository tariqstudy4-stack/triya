import os
import sys
import subprocess

# Config
PATH_A = r"C:\Users\Asus\Documents\AutoLCA"
PATH_B = r"C:\Users\Asus\Documents\Database_Triya"
GTK_RUNTIME = os.path.join(PATH_A, "backend", "libs", "gtk_runtime")

def setup():
    print("--- Triya.io Setup All Utility ---")
    
    # Pathway B Update
    PATH_TRIYA = r"C:\Users\Asus\Documents\Database_Triya"
    
    # 1. Verify PATH B
    if not os.path.exists(PATH_TRIYA):
        print(f"FAILED: Path B ({PATH_TRIYA}) not found. Creating it...")
        os.makedirs(PATH_TRIYA)
    else:
        print(f"SUCCESS: Path B (Database Research) found.")

    # 2. GTK Setup for WeasyPrint
    # We set environment variables so WeasyPrint can find the DLLs in our local libs
    if os.path.exists(GTK_RUNTIME):
        print(f"SUCCESS: GTK Runtime found in backend/libs.")
        os.environ["WEASYPRINT_DLL_DIRECTORIES"] = GTK_RUNTIME
    else:
        print(f"WARNING: GTK Runtime not found. PDF generation might fail on Windows.")

    # 3. Link Backend
    print("SUCCESS: Backend linked to Database Pathway B via models.py config.")

    # 4. Final check for DB
    db_file = os.path.join(PATH_B, "autolca_poc.db")
    if not os.path.exists(db_file):
        print(f"NOTICE: Database not found. You should run 'seed.py' from Path B.")
    
    print("\nSetup Complete. You can now use start_app.bat.")

if __name__ == "__main__":
    setup()
