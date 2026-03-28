# Triya + AM_Pri Integration Walkthrough

Welcome to the newly enhanced Triya.io, now featuring the **AM_Pri 3D Print Analyzer**!
This guide explains how to run the integrated application, understand its architecture, and use its core features.

---

## 🚀 1. How to Start the App

The project consists of a FastAPI backend and a Next.js (React Flow) frontend. You'll need two separate terminals.

### Start the Backend (FastAPI)
1. Open your terminal and navigate to the backend directory:
   ```bash
   cd C:\Users\Asus\Documents\triya\AutoLCA\backend
   ```
2. Activate your virtual environment (if applicable) and start the Uvicorn server:
   ```bash
   python main.py
   # Or using uvicorn directly: uvicorn main:app --reload
   ```
   *The backend runs on `http://localhost:8000`.*

### Start the Frontend (Next.js)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd C:\Users\Asus\Documents\triya\AutoLCA\frontend
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on `http://localhost:3000`.*

---

## 🌊 2. How the Data Flows (React -> PyTorch GNN -> LCA)

The new **3D Print Analyzer** feature allows you to upload an `.stl` file and immediately see its Environmental Life Cycle Assessment (LCA). Here is exactly how the data moves through the stack:

1. **React UI (Frontend)**: 
   - You upload an `.stl` file and select your `Material`, `Machine`, and `Energy Grid` in the *3D Print Analyzer* tab on the left panel.
   - The React app sends this file and form data as a multipart `POST` request to `/api/analyze-stl` on the FastAPI backend.

2. **API Bridge (FastAPI)**:
   - FastAPI temporarily saves the `.stl` file.
   - It constructs a powerful cross-environment subprocess call, invoking the Python executable inside the `AM_Pri` virtual environment (`venv/Scripts/python.exe`).
   - It executes `plugin_api.py`, passing the temporary `.stl` file and locating the trained PyTorch weights (`am_gnn_model.pth`).

3. **PyTorch Model (AM_Pri)**:
   - The GNN extracts graphs and heuristics (like bounding box volume, surface area, and overhang ratio representing support waste).
   - The model predicts the manufacturability cost score and prints out the results, which the FastAPI bridge captures via standard output string parsing.

4. **LCA Translation Math (FastAPI)**:
   - FastAPI translates the geometry metrics to mass and energy. 
   - **Material (kg)**: Calculates the volume of the part + support waste (derived from the overhang ratio), and multiplies it by the density of the chosen material (e.g., PLA, Titanium).
   - **Energy (kWh)**: Divides the bounding box volume by the machine's speed, factoring in the machine's power draw.
   - **Carbon (GWP)**: Multiplies the mass and energy by localized carbon intensity factors (e.g., US-East grid vs. China grid).

5. **Dynamic Canvas (React)**:
   - The backend constructs an IDEF0 graph array (Nodes & Edges) dynamically.
   - React Flow receives this payload and automatically plots the nodes on the canvas: `Raw Material` → `Electricity` → `3D Printing Process` → `Waste Disposal`. 
   - It updates the Dashboard with real-time Carbon Equivalents and Hotspots.

---

## 📊 3. How to Use Databases & Examples

If you want to use the standard "Canvas Builder" mode instead of the 3D Analyzer:

- **Switch Modes**: Use the toggle at the very top of the Left Panel to switch between `Canvas Builder` and `3D Print Analyzer`.
- **Preloaded Industry Templates**: Click the **Shuffle Example** button. This will automatically query the backend for pre-existing process data (e.g., *Aluminum Smelting*, *PET Bottle*, *Electricity*) and instantly map out an entire IDEF0 compliant supply chain on the canvas.
- **IDEF0 Node Logic**: Every node respects the ISO rules:
   - **Inputs (Left)**: Physical inputs like steel or filament.
   - **Outputs (Right)**: Final products and waste. You must connect outputs to downstream inputs!
   - **Controls (Top)**: Regulatory limits or design specs (e.g., *GNN Score*).
   - **Mechanisms (Bottom)**: The machinery doing the work.
- **Upload Databases**: In Canvas Builder mode, use the drag-and-drop zone to import LCA datasets. The system will parse the exchanges and store them locally (and upload backups to AWS S3 if configured).

Happy Modelling! 🌍
