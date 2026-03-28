---
description: How to perform a Life Cycle Assessment for a 3D Printed Object
---

# Workflow: 3D Printing LCA (Expert Protocol)

This workflow describes the professional steps to translate a 3D geometry (STL) into a high-fidelity Life Cycle Assessment, accounting for material density, machine efficiency, and carbon factors.

## 1. Geometric Input & Scaling
1.  **Upload STL**: Drag and drop the `.stl` file into the "3D Print Analyzer" portal.
2.  **Verify Volume**: The system calculates the object's volume (mm³) using a Gaussian divergence theorem algorithm.
3.  **Apply Scale factor**: Adjust the "Object Scale" parameter to simulate size variants (e.g., 200% scaling increases volume by 8x).

## 2. Material Selection & Carbon Factors
1.  **Select Polymer/Metal**: Choose from the "Material Composition" dropdown.
2.  **Carbon Factor Retrieval**: The system maps the selection to a specific LCI dataset (e.g., *Polylactic acid (PLA), production, GLO, Ecoinvent 3.9*).
3.  **Mass Calculation**: `Mass (kg) = Volume (m³) * Density (kg/m³)`.

## 3. Printing Process LCI (Technosphere)
1.  **Machine Profile**: Select the printer class (e.g., *Industrial SLS*, *Desktop FDM*).
2.  **Energy Demand**: Factor in the specific energy consumption (SEC) in kWh/kg of material processed.
3.  **Waste Fraction**: Adjust the "Infill/Support" parameter to account for structural waste (non-recyclable scrap).

## 4. LCIA Integration & Visualization
1.  **Impact Mapping**: Map technosphere flows to environmental midpoints (GWP, ODP, POCP).
2.  **Simulation Results**: Review the "Compliance & Impact Assurance Console" for the final carbon footprint (kg CO2-eq).
3.  **ISO 14044 Validation**: Ensure the system boundary includes "Cradle-to-Gate" (A1-A3) stages for the printed product.

// turbo
## 5. Automated Data Sync
Run the LCIA simulation to synchronize the model logic with the latest carbon factors from the Integrated Database.
```powershell
# Command-line verify for developer sync
npm run sync-carbon-factors --material="PLA"
```
