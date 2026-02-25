---
description: How to ingest professional openLCA databases (NEEDS, ecoinvent) into AutoLCA
---

// turbo-all
# Professional Data Ingestion Workflow

This workflow describes how to move from raw openLCA files (like those in `C:\Users\Asus\Documents\Database_AutoLCA`) to a live AutoLCA database.

### 1. Preparation
AutoLCA is optimized for **JSON-LD** data. This is the fastest and most transparent way to pipe environmental science into the AI engine.

- **Current Files**: You have `needs_18.zolca` and `openLCA LCIA Methods 2.8.0.zip`.
- **Requirement**: Open these in openLCA one last time and select **Export -> JSON-LD**.

### 2. Dumping to Imports
Move your exported JSON-LD folders into the designated space:
- Copy the `processes/` folder to `C:\Users\Asus\Documents\AutoLCA\imports\processes`
- Copy the `flows/` folder to `C:\Users\Asus\Documents\AutoLCA\imports\flows`

### 3. Running the Ingestor
Once the files are in `imports/`, run the ingestion script (to be implemented as needed):
```powershell
venv\Scripts\python ingest_jsonld.py
```

### 4. Verification
Run the standard "Benchy" benchmark to ensure the new data hasn't shifted the baseline accuracy:
```powershell
venv\Scripts\python test_benchy.py
```

> [!TIP]
> Using JSON-LD allows the AutoLCA engine to read the "Recipe" of every process independently, which is how the KNN AI learns to predict missing data so accurately.
