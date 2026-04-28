import uuid
from typing import Dict, Any, List

# Global in-memory storage for templates created during current session
CUSTOM_DEMO_TEMPLATES: Dict[str, Dict[str, Any]] = {}

def add_custom_template(name: str, data: Dict[str, Any]):
    """Adds a dynamic template to the registry."""
    global CUSTOM_DEMO_TEMPLATES
    CUSTOM_DEMO_TEMPLATES[name] = data

def get_golden_templates() -> Dict[str, Dict[str, Any]]:
    """
    Returns the 4 Golden ISO-Compliant LCA Examples for Triya.io,
    merged with any session-generated custom templates.
    """
    static_templates = {
        "Aerospace Titan (AM vs CNC)": {
            "goalAndScope": {
                "projectTitle": "Aerospace Titanium Bracket: AM vs. Subtractive",
                "functional_unit": "1 Finished Aerospace Grade Bracket (Ti-6Al-4V)",
                "system_boundary": "Cradle-to-Gate (including End-of-Life Recycling Credits)",
                "cut_off_criteria": "1% by mass / energy",
                "allocation": "Mass-based for metal scrap recycling (Module D)",
                "data_quality": "Primary data for printing (2024), Secondary for Mining (Ecoinvent 3.9)",
                "location": "RER (Europe)"
            },
            "nodes": [
                {
                    "id": "am-titan-1", "type": "process", "position": {"x": 100, "y": 200},
                    "data": {
                        "label": "Titanium Mining & Sponge Production", "category": "Extraction", "location": "US", "data_year": 2023, "dqi_score": 2, "variance_percentage": 0.12,
                        "inputs": [{"name": "Titanite sand", "amount": 150.0, "unit": "kg"}, {"name": "Diesel", "amount": 45.0, "unit": "L"}],
                        "outputs": [{"name": "Titanium Sponge", "amount": 80.0, "unit": "kg"}]
                    }
                },
                {
                    "id": "am-titan-2", "type": "process", "position": {"x": 400, "y": 100},
                    "data": {
                        "label": "Powder Atomization (O2 Low)", "category": "Refining", "location": "RER", "data_year": 2024, "dqi_score": 1, "variance_percentage": 0.05,
                        "inputs": [{"name": "Titanium Sponge", "amount": 80.0, "unit": "kg"}, {"name": "Argon gas", "amount": 50.0, "unit": "kg"}],
                        "outputs": [{"name": "Ti-64 Powder", "amount": 75.0, "unit": "kg"}]
                    }
                },
                {
                    "id": "am-titan-3", "type": "process", "position": {"x": 700, "y": 200},
                    "data": {
                        "label": "DMLS 3D Printing (Aerospace Grade)", "category": "Additive", "location": "GLO", "data_year": 2024, "dqi_score": 1, "variance_percentage": 0.15,
                        "inputs": [{"name": "Ti-64 Powder", "amount": 12.0, "unit": "kg"}, {"name": "Electricity", "amount": 850.0, "unit": "kWh"}],
                        "outputs": [{"name": "Raw Printed Bracket", "amount": 5.5, "unit": "kg"}]
                    }
                },
                {
                    "id": "am-titan-4", "type": "process", "position": {"x": 1000, "y": 200},
                    "data": {
                        "label": "CNC Post-Processing (Superfinish)", "category": "Precision", "location": "RER", "data_year": 2023, "dqi_score": 1, "variance_percentage": 0.04,
                        "inputs": [{"name": "Raw Printed Bracket", "amount": 5.5, "unit": "kg"}, {"name": "Coolant", "amount": 2.0, "unit": "L"}],
                        "outputs": [{"name": "Certified Flight Bracket", "amount": 4.5, "unit": "kg"}, {"name": "Titanium Swarf", "amount": 1.0, "unit": "kg"}]
                    }
                }
            ],
            "edges": [
                {"id": "e1-2", "source": "am-titan-1", "target": "am-titan-2", "animated": True},
                {"id": "e2-3", "source": "am-titan-2", "target": "am-titan-3", "animated": True},
                {"id": "e3-4", "source": "am-titan-3", "target": "am-titan-4", "animated": True}
            ]
        },
        "EV Battery Cell (NMC 811)": {
            "goalAndScope": {
                "projectTitle": "NMC 811 EV Battery Cell: Circular Supply Chain",
                "functional_unit": "10.0 kg of NMC 811 Lithium-Ion Battery Cells (Prismatic)",
                "system_boundary": "Cradle-to-Gate (Extraction to Finished Cell Assembly)",
                "cut_off_criteria": "0.1% for trace minerals",
                "allocation": "Mass-based for Co-product (Cobalt/Nickel)",
                "data_quality": "Industry-average (REPA 2023)",
                "location": "CN (China Processing)"
            },
            "nodes": [
                {
                    "id": "batt-1", "type": "process", "position": {"x": 100, "y": 150},
                    "data": {
                        "label": "Lithium/Cobalt Mining", "category": "Extraction", "location": "GLO", "data_year": 2023, "dqi_score": 3, "variance_percentage": 0.22,
                        "inputs": [{"name": "Diesel fuel", "amount": 120.0, "unit": "L"}],
                        "outputs": [{"name": "Refined Sulfates (Co/Ni)", "amount": 5.0, "unit": "kg"}]
                    }
                },
                {
                    "id": "batt-2", "type": "process", "position": {"x": 400, "y": 150},
                    "data": {
                        "label": "Cathode Slurry Coating (Dry Room)", "category": "Industrial", "location": "CN", "data_year": 2024, "dqi_score": 1, "variance_percentage": 0.08,
                        "inputs": [{"name": "Refined Sulfates (Co/Ni)", "amount": 5.0, "unit": "kg"}, {"name": "Electricity (HVAC)", "amount": 150.0, "unit": "kWh"}],
                        "outputs": [{"name": "Coated Foil Unit", "amount": 4.8, "unit": "kg"}]
                    }
                },
                {
                    "id": "batt-3", "type": "process", "position": {"x": 700, "y": 150},
                    "data": {
                        "label": "Cell Winding & Electrolyte Filling", "category": "Assembly", "location": "RER", "data_year": 2024, "dqi_score": 1, "variance_percentage": 0.05,
                        "inputs": [{"name": "Coated Foil Unit", "amount": 4.8, "unit": "kg"}, {"name": "Electrolyte (Lithium salt)", "amount": 1.2, "unit": "L"}],
                        "outputs": [{"name": "Finished NMC Cell", "amount": 10.0, "unit": "kg"}]
                    }
                }
            ],
            "edges": [
                {"id": "eb1-2", "source": "batt-1", "target": "batt-2", "animated": True},
                {"id": "eb2-3", "source": "batt-2", "target": "batt-3", "animated": True}
            ]
        },
        "Bio-based Packaging (PLA)": {
            "goalAndScope": {
                "projectTitle": "Polylactic Acid (PLA) Comparative Packaging",
                "functional_unit": "10,000 Rigid Bio-based Containers (500ml)",
                "system_boundary": "Cradle-to-Compost (Zero EoL burden via Aerobic Digestion)",
                "cut_off_criteria": "2.5% for organic dyes",
                "allocation": "Cut-off for Corn-to-Dextrose conversion",
                "data_quality": "NatureWorks Secondary Data (2022)",
                "location": "US (Iowa Cluster)"
            },
            "nodes": [
                {
                    "id": "pla-1", "type": "process", "position": {"x": 100, "y": 200},
                    "data": {
                        "label": "Corn Cultivation (Wet Milling)", "category": "Agriculture", "location": "US", "data_year": 2023, "dqi_score": 4, "variance_percentage": 0.35,
                        "inputs": [{"name": "Water (River)", "amount": 450.0, "unit": "m3"}, {"name": "Phosphate Fertilizer", "amount": 12.0, "unit": "kg"}],
                        "outputs": [{"name": "Corn Starch", "amount": 100.0, "unit": "kg"}]
                    }
                },
                {
                    "id": "pla-2", "type": "process", "position": {"x": 400, "y": 200},
                    "data": {
                        "label": "Fermentation (Dextrose to PLA)", "category": "Bio-Chemical", "location": "US", "data_year": 2024, "dqi_score": 2, "variance_percentage": 0.12,
                        "inputs": [{"name": "Corn Starch", "amount": 100.0, "unit": "kg"}, {"name": "Electricity (Solar)", "amount": 45.0, "unit": "kWh"}],
                        "outputs": [{"name": "PLA Polymer Ingot", "amount": 80.0, "unit": "kg"}]
                    }
                },
                {
                    "id": "pla-3", "type": "process", "position": {"x": 700, "y": 200},
                    "data": {
                        "label": "Thermoforming & Logistics", "category": "Conversion", "location": "US", "data_year": 2024, "dqi_score": 1, "variance_percentage": 0.05,
                        "inputs": [{"name": "PLA Polymer Ingot", "amount": 80.0, "unit": "kg"}],
                        "outputs": [{"name": "Retail Packaging Unit", "amount": 1.0, "unit": "box"}]
                    }
                }
            ],
            "edges": [
                {"id": "ep1-2", "source": "pla-1", "target": "pla-2", "animated": True},
                {"id": "ep2-3", "source": "pla-2", "target": "pla-3", "animated": True}
            ]
        },
        "Industrial Wind Turbine Blade": {
            "goalAndScope": {
                "projectTitle": "Mega-Structure LCA: 100m Fiberglass Wind Blade",
                "functional_unit": "1 Operational Wind Turbine Blade (50-Year Lifespan)",
                "system_boundary": "Cradle-to-Grave (including On-site Landfill vs. Pyrolysis)",
                "cut_off_criteria": "0.1% by mass",
                "allocation": "Mass-based for Fiberglass scrap",
                "data_quality": "Vestas Industry Transparency Data (2023)",
                "location": "DK (Denmark Offshore)"
            },
            "nodes": [
                {
                    "id": "wind-1", "type": "process", "position": {"x": 100, "y": 150},
                    "data": {
                        "label": "Fiberglass (Glass Wool) Extrusion", "category": "High-Mass", "location": "GLO", "data_year": 2023, "dqi_score": 2, "variance_percentage": 0.08,
                        "inputs": [{"name": "Silica sand", "amount": 25.0, "unit": "t"}, {"name": "Gas Furnace", "amount": 5000.0, "unit": "MJ"}],
                        "outputs": [{"name": "Glass Fiber Roll", "amount": 20.0, "unit": "t"}]
                    }
                },
                {
                    "id": "wind-2", "type": "process", "position": {"x": 400, "y": 150},
                    "data": {
                        "label": "Epoxy Resin Synthesis", "category": "Chemicals", "location": "RER", "data_year": 2022, "dqi_score": 2, "variance_percentage": 0.12,
                        "inputs": [{"name": "Bisphenol A (BPA)", "amount": 5.0, "unit": "t"}],
                        "outputs": [{"name": "Liquid Epoxy Resin", "amount": 4.8, "unit": "t"}]
                    }
                },
                {
                    "id": "wind-3", "type": "process", "position": {"x": 700, "y": 150},
                    "data": {
                        "label": "Vacuum Infusion Casting (100m)", "category": "Infrastructure", "location": "GLO", "data_year": 2024, "dqi_score": 3, "variance_percentage": 0.15,
                        "inputs": [{"name": "Glass Fiber Roll", "amount": 20.0, "unit": "t"}, {"name": "Liquid Epoxy Resin", "amount": 4.8, "unit": "t"}],
                        "outputs": [{"name": "100m Composite Blade", "amount": 1.0, "unit": "unit"}]
                    }
                }
            ],
            "edges": [
                {"id": "ew1-3", "source": "wind-1", "target": "wind-3", "animated": True},
                {"id": "ew2-3", "source": "wind-2", "target": "wind-3", "animated": True}
            ]
        }
    }
    
    # Merge with dynamically added session templates
    all_templates = static_templates.copy()
    all_templates.update(CUSTOM_DEMO_TEMPLATES)
    return all_templates
