# Triya.io AutoLCA - ISO 14040 & IDEF0 Guide

Welcome to the **Triya.io AutoLCA Software**! This system has been upgraded to act as an advanced, "idiot-proof" Life Cycle Assessment (LCA) tool aligned with **ISO 14040/14044** and **JRC EF 3.1** standards.

## 🚀 How to Launch the Application

The environment has been cleanly configured. To launch the web applications without using Docker, simply run the startup batch script in Windows:

1. Open a Command Prompt or PowerShell in the `AutoLCA` directory.
2. Execute the batch file:
   ```cmd
   start_app.bat
   ```
3. This will ignite both the FastAPI Python Backend and Next.js React Frontend.
4. Your browser will automatically be capable of accessing the app at: **[http://localhost:3000](http://localhost:3000)**

*(Note: Ensure you have run `install_dependencies.bat` first if this is a fresh setup from scratch!)*

---

## 🔬 Understanding the Scientific Canvas (IDEF0)

The drag-and-drop workspace has been upgraded strictly to the scientific **IDEF0 (Integrated Definition Methods)** topology.

This prevents common LCA graphing errors by forcing all data mappings to fall within four strict constraints:

| IDEF0 Category | Flow Direction | Handle Location | Description |
| :--- | :--- | :--- | :--- |
| **Input** | Incoming | Left (Green) | The raw materials or assemblies consumed by the process. |
| **Output** | Outgoing | Right (Red) | The created product(s), coproducts, and emissions to biosphere. |
| **Control** | Imposed | Top (Grey) | Regulatory constraints, ISO directives, or quality limits affecting operations. |
| **Mechanism** | Supporting | Bottom (Dark) | The machinery, manpower, or infrastructural energy required to produce the output. |

### The "Idiot-Proof" Connection Rules
Our engine prevents invalid lifecycle mappings before they can be calculated:
* **Rule 1:** Connections **MUST** originate from an **Output** node. You cannot link a machine to an input without first defining its production output.
* **Rule 2:** Connections **CANNOT** target another **Output**. They must route correctly into a downstream Input, Control, or Mechanism.

*If you violate these rules, the interface will intercept the action and instantly raise an architecture warning toast.*

---

## 📊 ISO 14040 Reporting System

Triya.io's "Generate PDF Report" algorithm has been explicitly hardcoded to map to the 4 formal phases of LCA:

1. **Goal and Scope Definition**: Automatically documents Functional Unit scaling and System Boundaries (Cradle-to-Gate vs. Cradle-to-Grave).
2. **Inventory Analysis**: Breaks down the node hierarchy and records the generated flow topologies (the idef0 snapshot).
3. **Impact Assessment**: Conducts Monte Carlo calculation iterations mapping flows to our built-in JRC EF 3.1 (16 categories) LCIA methodologies.
4. **Interpretation (Hotspot & Uncertainty)**: Identifies your highest contributing nodes and provides 95% Confidence Intervals mapped to deterministic data.

### How to calculate a full model:
1. Load a Demo graph via **"Shuffle Example"** on the left panel.
2. Adjust any **Node Parameter / Scale**.
3. Click **"Calculate Supply Chain"** to invoke the LCIA engine and populate the results dashboards.
4. Click **"Generate PDF report"** to serialize the ISO-14044 document for stakeholder use.
