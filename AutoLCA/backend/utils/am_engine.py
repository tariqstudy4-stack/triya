import trimesh
import os
import logging
import uuid

logger = logging.getLogger(__name__)

class AdditiveManufacturingEngine:
    """
    AM_Pri 3D Geometry Engine (Zero-Compromise Edition):
    Converts .stl meshes into industrial LCA inventory data with repair & circularity.
    """
    
    # Material densities in g/cm3 (Standard Industrial Proxies)
    DENSITIES = {
        "PLA": 1.24,
        "ABS": 1.04,
        "PETG": 1.27,
        "Nylon": 1.01,
        "TPU": 1.21,
        "Ti6Al4V": 4.43,
        "SS316L": 7.98,
        "AlSi10Mg": 2.68,
        "Inconel625": 8.44
    }
    
    # Energy Intensity in kWh/g (Machine Heuristics)
    ENERGY_INTENSITY = {
        "FDM_desktop": 0.05,
        "FDM_industrial": 0.04,
        "SLA": 0.08,
        "SLS": 0.45,
        "DMLS": 1.20,
        "EBM": 0.95,
        "Binder_Jetting": 0.15
    }

    # Idle / Warm-up Energy (kWh) per Job start
    WARMUP_ENERGY = 0.5 # 500Wh baseline for chamber heating

    def repair_mesh(self, mesh: trimesh.Trimesh):
        """
        Industrial Mesh Recovery: Fixes normals and fills small manifold holes.
        """
        trimesh.repair.fix_normals(mesh)
        trimesh.repair.fill_holes(mesh)
        return mesh

    def _run_gnn_efficiency_prediction(self, mesh: trimesh.Trimesh) -> float:
        """
        Mocked GNN Hook:
        Analyzes topology (Area/Volume ratio) as a proxy for cooling/energy efficiency.
        High ratio = high complexity = high thermal loss.
        """
        try:
            ratio = mesh.area / mesh.volume
            # Normalize complex geometries (high ratio) to increase energy factor
            adjustment = 1.0 + (min(ratio, 5.0) / 10.0) 
            logger.info(f"[AI GNN] Topology analyzed: S/V Ratio {ratio:.2f}. Thermal Adjustment: {adjustment:.2f}")
            return adjustment
        except:
            return 1.0

    def calculate_lci(self, file_path: str, material: str, infill_percentage: float, machine_type: str, support_enabled: bool = True) -> dict:
        """
        Calculates Mass (kg), Energy (kWh), and Circularity LCI from a 3D geometry file.
        """
        try:
            # Load mesh
            mesh = trimesh.load(file_path)
            
            # 1. Mesh Repair
            mesh = self.repair_mesh(mesh)
            
            # Trimesh volume is in mm3 if STL is exported in mm (standard)
            # 1 cm3 = 1000 mm3
            raw_volume_cm3 = mesh.volume / 1000.0
            
            if raw_volume_cm3 <= 0:
                # Mesh might be non-watertight; fallback to bounding box calculation
                logger.warning(f"Non-watertight mesh detected in {file_path}. Using bounding box fallback.")
                raw_volume_cm3 = max(0.001, getattr(mesh.bounding_box_oriented, 'volume', 0.0) / 1000.0 * 0.7) # 0.7 is a standard heuristic
            
            # AI GNN Efficiency Adjustment
            efficiency_factor = self._run_gnn_efficiency_prediction(mesh)
            
            # 2. Mass Calculation
            density = self.DENSITIES.get(material, 1.0)
            infill_factor = infill_percentage / 100.0
            mass_g = raw_volume_cm3 * density * infill_factor
            
            # Support Structure Waste (+20% mass if enabled)
            if support_enabled:
                mass_g *= 1.20 # Heuristic for AM support waste
            
            mass_kg = mass_g / 1000.0
            
            # 3. Printing Energy Calculation
            # Energy(kWh) = (Mass(g) * Intensity(kWh/g) * AI_Factor) + Warmup
            energy_intensity = self.ENERGY_INTENSITY.get(machine_type, 0.05)
            energy_kwh = (mass_g * energy_intensity * efficiency_factor) + self.WARMUP_ENERGY
            
            # 4. Circularity / Module D (EoL) logic
            eol_flow = "General Waste Treatment"
            if material == "PLA":
                eol_flow = "PLA Waste Treatment (Industrial Composting)"
            elif material in ["Ti6Al4V", "SS316L", "AlSi10Mg", "Inconel625"]:
                eol_flow = f"{material} Scrap for Recycling"
            
            # Format as Triya LCI Exchanges
            exchanges = [
                {
                    "flow_name": f"{material} Filament/Powder",
                    "amount": mass_kg,
                    "unit": "kg",
                    "flow_type": "input",
                    "category": "Raw Material"
                },
                {
                    "flow_name": "Electricity (3D Printing)",
                    "amount": energy_kwh,
                    "unit": "kWh",
                    "flow_type": "input",
                    "category": "Energy"
                },
                {
                    "flow_name": eol_flow,
                    "amount": mass_kg,
                    "unit": "kg",
                    "flow_type": "output",
                    "category": "End-of-Life"
                }
            ]
            
            return {
                "mass_kg": mass_kg,
                "energy_kwh": energy_kwh,
                "volume_cm3": raw_volume_cm3,
                "efficiency_factor": efficiency_factor,
                "exchanges": exchanges,
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"AM Engine Analysis Failed: {e}")
            return {"status": "error", "message": str(e), "exchanges": []}
