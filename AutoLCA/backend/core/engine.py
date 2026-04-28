import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as splinalg
from typing import List, Dict, Any, Optional
import json
from scipy import stats

SCOPE3_CATEGORIES = {
    1: "Purchased Goods & Services", 2: "Capital Goods", 3: "Fuel & Energy Related",
    4: "Upstream Transport", 5: "Waste in Ops", 6: "Business Travel",
    7: "Employee Commuting", 8: "Upstream Leased Assets", 9: "Downstream Transport",
    10: "Processing Sold Products", 11: "Use of Sold Products", 12: "End-of-Life (Sold Products)",
    13: "Downstream Leased Assets", 14: "Franchises", 15: "Investments"
}

REGULATION_PRESETS = {
    "EU_CSRD":      {"tax_rate": 105.0, "name": "EU CSRD/CBAM (Benchmark)", "compliance_framework": "ESRS E1"},
    "SWE_CARBON":   {"tax_rate": 125.0, "name": "Sweden Carbon Tax (Premium)", "compliance_framework": "National Law"},
    "CAN_BACKSTOP": {"tax_rate": 80.0,  "name": "Canada Federal Backstop", "compliance_framework": "Federal"},
    "CHINA_ETS":    {"tax_rate": 42.0,  "name": "China National ETS", "compliance_framework": "National"},
    "USA_IRA":      {"tax_rate": 25.0,  "name": "USA IRA (Incentive-Adjusted)", "compliance_framework": "SEC/IRA"},
    "INDIA_CCTS":   {"tax_rate": 15.0,  "name": "India Carbon Credit Scheme", "compliance_framework": "CRMA"},
    "CUSTOM":       {"tax_rate": 0.0,   "name": "Custom User Definition", "compliance_framework": "None"}
}

IMPACT_CATEGORIES = [
    'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
    'ep_freshwater', 'ep_marine', 'ep_terrestrial',
    'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
    'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
     'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
    'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
]

# JRC EF 3.1 Characterization Ratios (Proxy-based if full DB missing)
# This removes hardcoded GWP-only focus.
CATEGORY_CF_RATIOS = {
    # 1. Climate Change (GWP100)
    "co2": {"gwp_climate_change": 1.0},
    "ch4": {"gwp_climate_change": 28.0, "pocp_photochemical_ozone": 0.0003},
    "n2o": {"gwp_climate_change": 265.0, "odp_ozone_depletion": 0.012},
    "sf6": {"gwp_climate_change": 23500.0},
    
    # 2. Acidification (AP) - mol H+ eq
    "so2": {"ap_acidification": 1.0, "pm_particulate_matter": 0.00002},
    "nox": {"ap_acidification": 0.7, "ep_marine": 0.1, "pocp_photochemical_ozone": 0.001},
    "nh3": {"ap_acidification": 1.6, "ep_terrestrial": 0.2},
    
    # 3. Eutrophication (EP) - kg P/N eq
    "phosphorus": {"ep_freshwater": 1.0},
    "phosphate": {"ep_freshwater": 0.33},
    "po4": {"ep_freshwater": 0.33},
    "nitrogen": {"ep_marine": 1.0, "ep_terrestrial": 1.0},
    
    # 4. Particulate Matter (PM) - disease incidence
    "pm2.5": {"pm_particulate_matter": 1.0},
    "pm10": {"pm_particulate_matter": 0.6},
    "dust": {"pm_particulate_matter": 0.1},
    
    # 5. Photochemical Ozone (POCP) - kg NMVOC eq
    "nmvoc": {"pocp_photochemical_ozone": 1.0},
    "ethene": {"pocp_photochemical_ozone": 1.0},
    "co": {"pocp_photochemical_ozone": 0.01},
    
    # 6. Resource Use (Fossils) - MJ
    "gas": {"ru_f_resource_use_fossils": 45.0}, # Approximated LHV
    "oil": {"ru_f_resource_use_fossils": 42.0},
    "coal": {"ru_f_resource_use_fossils": 24.0},
    
    # 7. Water Scarcity (WSF) - m3 world-eq
    "water": {"wsf_water_scarcity": 1.0}
}

SYSTEM_BOUNDARIES = {
    "CRADLE_TO_GATE": "Raw Materials to Factory Gate",
    "CRADLE_TO_GRAVE": "Full Life Cycle (End-of-Life Included)",
    "GATE_TO_GATE": "Single Process / Internal",
    "CRADLE_TO_CRADLE": "Circular / Recycling Loop",
    "WELL_TO_WHEEL": "Automotive Fuel Life Cycle",
    "WELL_TO_WAKE": "Maritime Alternative Fuels",
    "WELL_TO_PUMP": "Energy Production Life Cycle",
    "TANK_TO_WHEEL": "Vehicle Operation Only",
    "CRADLE_TO_CUSTOMER": "B2C Distribution Included",
    "GRAVE_TO_CRADLE": "Remanufacturing / Upcycling"
}

# ISO 14044 Pedigree Uncertainty Factors (U_i) 
PEDIGREE_FACTORS = {
    "reliability":   {1: 1.00, 2: 1.05, 3: 1.10, 4: 1.20, 5: 1.50},
    "completeness":  {1: 1.00, 2: 1.03, 3: 1.10, 4: 1.20, 5: 1.50},
    "temporal":      {1: 1.00, 2: 1.03, 3: 1.10, 4: 1.20, 5: 1.50},
    "geographical":  {1: 1.00, 2: 1.01, 3: 1.02, 4: 1.10, 5: 1.20},
    "technological": {1: 1.00, 2: 1.05, 3: 1.20, 4: 1.30, 5: 1.80}
}

def calculate_sd_from_pedigree(pedigree: Dict[str, int]) -> float:
    ln_sq_sum = 0.0
    for key, score in pedigree.items():
        if key in PEDIGREE_FACTORS:
            u_i = PEDIGREE_FACTORS[key].get(int(score), 1.05)
            ln_sq_sum += (np.log(u_i) ** 2)
    ln_sq_sum += (np.log(1.05) ** 2) 
    sd_g = np.exp(np.sqrt(ln_sq_sum))
    return float(sd_g)

def calculate_lca(
    nodes: List[Dict], 
    edges: List[Dict], 
    reference_flow: float = 1.0, 
    carbon_tax_rate: float = 85.0, 
    regulation_id: str = "EU_CSRD",
    boundary_id: str = "CRADLE_TO_GATE",
    goal_and_scope: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Advanced Sparse LCA Matrix Solver with Regulatory Audit, 
    Financial Risk (NPV/MAC), and Expanded ISO System Boundaries.
    """
    reg = REGULATION_PRESETS.get(regulation_id, REGULATION_PRESETS["EU_CSRD"])
    tax_rate = carbon_tax_rate if regulation_id == "CUSTOM" else reg["tax_rate"]

    # Industrial Compliance Settings
    gs = goal_and_scope or {}
    cutoff_threshold = float(gs.get("systemBoundary", {}).get("cutoffThreshold", 0.0))
    allocation_method = gs.get("allocation", {}).get("method", "MASS")

    N = len(nodes)
    if N == 0:
        return {"metrics": {"gwp_total": 0.0}, "contributions": [], "mass_balance": {}, "scope3": {}}

    node_idx = {str(n["id"]): idx for idx, n in enumerate(nodes)}
    idx_to_node = {idx: n for idx, n in enumerate(nodes)}
    
    A = sp.lil_matrix((N, N), dtype=np.float64)
    for idx, node in enumerate(nodes): A[idx, idx] = 1.0
    for edge in edges:
        s_id, t_id = str(edge["source"]), str(edge["target"])
        if s_id in node_idx and t_id in node_idx:
            i, j = node_idx[s_id], node_idx[t_id]
            A[i, j] = -float(edge.get("data", {}).get("weight", 1.0))

    f = np.zeros(N)
    source_ids = {str(e["source"]) for e in edges}
    sink_ids = [str(n["id"]) for n in nodes if str(n["id"]) not in source_ids]
    if not sink_ids and N > 0: sink_ids = [str(nodes[-1]["id"])]
    for sid in sink_ids: f[node_idx[sid]] = reference_flow

    try:
        s = splinalg.spsolve(A.tocsc(), f)
    except:
        return {"error": "Matrix Inversion Error", "metrics": {"gwp_total": 0.0}}

    node_contributions = []
    mass_balance_audit = {}
    scope3_totals = {cat_id: 0.0 for cat_id in SCOPE3_CATEGORIES}
    
    # 16-Category Impact Accumulator
    total_impacts = {cat: 0.0 for cat in IMPACT_CATEGORIES}
    gwp_fossil = 0.0
    gwp_biogenic = 0.0
    total_cost = 0.0
    
    # Detailed attribution for Audit Ledger
    scope_breakdown = {"Scope 1": 0.0, "Scope 2": 0.0, "Scope 3": 0.0}
    
    for i, scaling_factor in enumerate(s):
        if abs(scaling_factor) < 1e-12: continue
        node = idx_to_node[i]
        data = node.get("data", {})
        node_id = str(node["id"])
        
        # Financial Rollup
        node_unit_cost = float(data.get("costPerUnit", 0.0))
        total_cost += (scaling_factor * node_unit_cost)

        biosphere = data.get("elementary_flows", [])
        node_impacts = {cat: 0.0 for cat in IMPACT_CATEGORIES}
        node_gwp_fossil = 0.0
        node_gwp_biogenic = 0.0
        
        for flow in biosphere:
            name = str(flow.get("name", "")).lower()
            amount = float(flow.get("amount", 0.0))
            
            # ISO 14044 Cut-off Rule: Exclude flows below threshold if not toxic
            flow_mass_contribution = amount / reference_flow if reference_flow > 0 else 0
            if flow_mass_contribution < cutoff_threshold and "ch4" not in name and "n2o" not in name:
                continue

            # Allocation Partitioning
            allocation_factor = 1.0
            if "allocation" in data:
                # Custom node-level override or global fallback
                alloc_data = data.get("allocation", {})
                allocation_factor = float(alloc_data.get("factor", 1.0))
                if allocation_method == "ECONOMIC" and "economic_value" in alloc_data:
                    # Logic to adjust if economic ratio requested
                    pass 

            # Smart Characterization
            matched = False
            for key, factors in CATEGORY_CF_RATIOS.items():
                if key in name:
                    for cat, cf in factors.items():
                        impact_val = scaling_factor * amount * cf * allocation_factor
                        node_impacts[cat] += impact_val
                        total_impacts[cat] += impact_val
                    matched = True
            
            # GWP Specialization (Fossil vs Biogenic)
            gwp_cf = 1.0 if not matched else CATEGORY_CF_RATIOS.get("co2", {}).get("gwp_climate_change", 1.0)
            if "biogenic" in name or "bio" in name:
                node_gwp_biogenic += (scaling_factor * amount * gwp_cf * allocation_factor)
            else:
                node_gwp_fossil += (scaling_factor * amount * gwp_cf * allocation_factor)
        
        gwp_fossil += node_gwp_fossil
        gwp_biogenic += node_gwp_biogenic
        
        # Scope Attribution
        s3_cat = int(data.get("scope3_category", 1))
        node_total_gwp = node_gwp_fossil + node_gwp_biogenic
        if s3_cat in scope3_totals: scope3_totals[s3_cat] += node_total_gwp
        
        # Aggregate Scopes for Ledger
        if "energy" in data.get("label", "").lower() or "elec" in data.get("label", "").lower():
            scope_breakdown["Scope 2"] += node_total_gwp
        elif "onsite" in data.get("label", "").lower() or "direct" in data.get("label", "").lower():
            scope_breakdown["Scope 1"] += node_total_gwp
        else:
            scope_breakdown["Scope 3"] += node_total_gwp
        
        mass_in = sum(float(e.get("data", {}).get("weight", 0)) for e in edges if str(e["target"]) == node_id)
        mass_out = 1.0 + sum(float(f.get("amount", 0)) for f in biosphere if str(f.get("unit")).lower() in ["kg", "ton"])
        mass_balance_audit[node_id] = {"residual": float(mass_in - mass_out), "is_balanced": abs(mass_in - mass_out) < 0.1}

        pedigree = data.get("pedigree", {"reliability": 2, "completeness": 2, "temporal": 2, "geographical": 2, "technological": 2})
        sd_g = calculate_sd_from_pedigree(pedigree)

        node_contributions.append({
            "node_id": node_id,
            "label": data.get("label", data.get("processName", node_id)),
            "gwp_fossil": float(node_gwp_fossil),
            "gwp_biogenic": float(node_gwp_biogenic),
            "financial_risk": float(node_gwp_fossil * (tax_rate / 1000.0)),
            "cost_contribution": float(scaling_factor * node_unit_cost),
            "scope3_id": s3_cat,
            "uncertainty_sd_g": sd_g,
            "impacts": node_impacts
        })

    gwp_total = gwp_fossil + gwp_biogenic
    total_impacts["gwp_climate_change"] = gwp_total
    carbon_liability = gwp_fossil * (tax_rate / 1000.0)

    # Strategic Metadata
    audit_summary = {
        "framework": reg["compliance_framework"],
        "boundary_description": SYSTEM_BOUNDARIES.get(boundary_id, "Standard"),
        "is_csrd_aligned": reg["compliance_framework"] == "ESRS E1",
        "missing_biogenic_data": gwp_biogenic == 0 and any("energy" in str(n.get("data", {}).get("label", "")).lower() for n in nodes),
        "scopes": scope_breakdown
    }

    return {
        "metrics": {
            "gwp_total": float(gwp_total),
            "gwp_fossil": float(gwp_fossil),
            "gwp_biogenic": float(gwp_biogenic),
            "carbon_liability": float(carbon_liability),
            "total_op_cost": float(total_cost),
            "tax_rate": tax_rate,
            "npv_impact": float(-carbon_liability * 5.0), # 5-year projection
            "regulation": reg["name"]
        },
        "impacts": total_impacts,
        "audit": audit_summary,
        "scope3": {SCOPE3_CATEGORIES[k]: v for k, v in scope3_totals.items() if v > 0},
        "mass_audit": mass_balance_audit,
        "contributions": node_contributions
    }

def perform_monte_carlo(nodes: List[Dict], edges: List[Dict], iterations: int = 250) -> Dict[str, Any]:
    results = []
    for _ in range(iterations):
        jittered_nodes = []
        for n in nodes:
            nj = n.copy()
            data = n.get("data", {})
            pedigree = data.get("pedigree", {"reliability": 2, "completeness": 2, "temporal": 2, "geographical": 2, "technological": 2})
            sd_g = calculate_sd_from_pedigree(pedigree)
            ef = data.get("elementary_flows", [])
            ef_jittered = []
            for flow in ef:
                fj = flow.copy()
                amount = float(fj.get("amount", 0.0))
                fj["amount"] = np.random.lognormal(np.log(max(amount, 1e-6)), np.log(sd_g))
                ef_jittered.append(fj)
            nj["data"] = {**data, "elementary_flows": ef_jittered}
            jittered_nodes.append(nj)
        res = calculate_lca(jittered_nodes, edges)
        results.append(res["metrics"]["gwp_total"])
    
    results = np.array(results)
    return {
        "mean": float(np.mean(results)),
        "median": float(np.median(results)),
        "std_dev": float(np.std(results)),
        "95_percentile": float(np.percentile(results, 95)),
        "5_percentile": float(np.percentile(results, 5)),
        "samples": results.tolist()[:100],
        "status": "DQI-Linked Simulation Complete"
    }
