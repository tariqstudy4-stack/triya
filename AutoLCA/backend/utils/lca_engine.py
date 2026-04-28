import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from typing import List, Dict, Any, Optional
import copy
import logging
from core.spatial_engine import spatial_engine
from core.monte_carlo import generate_samples, calculate_stats

import ast
import operator
import math

logger = logging.getLogger(__name__)

class SafeMathEvaluator:
    """
    A minimal, safe math evaluator for LCA formulas.
    Supports basic arithmetic and power operators with parameter context.
    """
    AVAILABLE_OPS = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Pow: operator.pow,
        ast.USub: operator.neg,
    }

    def __init__(self, context: Dict[str, float] = None):
        # Normalize context: ensure values are floats
        self.context = {}
        if context:
            for k, v in context.items():
                if isinstance(v, dict):
                    self.context[k] = float(v.get("value", 0) or 0)
                else:
                    try:
                        self.context[k] = float(v or 0)
                    except (TypeError, ValueError):
                        self.context[k] = 0.0

    def evaluate(self, expression: str, default: float = 0.0) -> float:
        if not expression or not isinstance(expression, str):
            return default
        try:
            tree = ast.parse(expression.strip(), mode='eval')
            return float(self._eval_node(tree.body))
        except Exception as e:
            logger.debug(f"Math Evaluation Note: '{expression}' could not be parsed as formula, using default. ({e})")
            return default

    def _eval_node(self, node):
        if isinstance(node, ast.BinOp):
            return self.AVAILABLE_OPS[type(node.op)](self._eval_node(node.left), self._eval_node(node.right))
        elif isinstance(node, ast.UnaryOp):
            return self.AVAILABLE_OPS[type(node.op)](self._eval_node(node.operand))
        elif isinstance(node, (ast.Num, ast.Constant)): # Constant for 3.8+
            return node.n if hasattr(node, 'n') else node.value
        elif isinstance(node, ast.Name):
            return self.context.get(node.id, 0.0)
        else:
            raise TypeError(f"Unsupported math syntax: {type(node)}")

# When only a GWP keyword proxy exists, scale other EF categories as fractions of that GWP (transparent heuristic).
CATEGORY_GWP_FRACTIONS = {
    "gwp_climate_change": 1.0,
    "odp_ozone_depletion": 1e-6,
    "ap_acidification": 0.02,
    "ep_freshwater": 0.01,
    "ep_marine": 0.02,
    "ep_terrestrial": 0.02,
    "pocp_photochemical_ozone": 0.03,
    "pm_particulate_matter": 0.015,
    "ir_ionising_radiation": 0.01,
    "ht_c_human_toxicity_cancer": 0.005,
    "ht_nc_human_toxicity_non_cancer": 0.008,
    "et_fw_ecotoxicity_freshwater": 0.02,
    "lu_land_use": 0.05,
    "wsf_water_scarcity": 0.03,
    "ru_mm_resource_use_min_met": 0.04,
    "ru_f_resource_use_fossils": 0.12,
}

# JRC EF 3.1 Impact Categories
IMPACT_CATEGORIES = [
    'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
    'ep_freshwater', 'ep_marine', 'ep_terrestrial',
    'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
    'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
    'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
    'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
]

# Curated proxy GWP factors (kg CO2-eq per kg or per kWh) for common flow keywords
GWP_PROXIES = {
    "steel": 2.0, "iron": 1.9, "aluminum": 11.5, "aluminium": 11.5,
    "copper": 4.0, "titanium": 40.0, "nickel": 13.0, "zinc": 3.8,
    "concrete": 0.13, "cement": 0.83, "glass": 0.85, "plastic": 3.0,
    "pla": 2.7, "abs": 3.5, "nylon": 7.0, "pet": 2.5,
    "electricity": 0.5, "coal": 2.4, "natural gas": 2.0, "diesel": 3.16,
    "petrol": 2.96, "gasoline": 2.96, "wood": 0.04, "paper": 1.1,
    "water": 0.001, "transport": 0.1,
}

# JRC 2018 Global Normalization Factors (World-Average Impacts per capita/year)
# Units: same as IMPACT_CATEGORIES (e.g. kg CO2-eq, m3-eq)
WORLD_BENCHMARKS_PER_CAPITA = {
    "gwp_climate_change":          8100.0,  # kg CO2 eq
    "odp_ozone_depletion":         0.052,   # kg CFC-11 eq
    "ap_acidification":            22.4,    # mol H+ eq
    "ep_freshwater":               0.39,    # kg P eq
    "ep_marine":                   2.7,     # kg N eq
    "ep_terrestrial":              28.0,    # mol N eq
    "pocp_photochemical_ozone":    19.0,    # kg NMVOC eq
    "pm_particulate_matter":       0.00045, # disease inc.
    "ir_ionising_radiation":       4300.0,  # kBq U235 eq
    "ht_c_human_toxicity_cancer":  1.7e-5,  # CTUh
    "ht_nc_human_toxicity_non_cancer": 3.7e-4, # CTUh
    "et_fw_ecotoxicity_freshwater": 12000.0, # CTUe
    "lu_land_use":                 0.8e6,   # Pt (approx)
    "wsf_water_scarcity":          140.0,   # m3 depriv.
    "ru_mm_resource_use_min_met":  0.06,    # kg Sb eq
    "ru_f_resource_use_fossils":   62000.0, # MJ
}


from sqlalchemy.orm import Session
from models import DBProcess

class LCAEngine:
    def __init__(self, db_session: Session = None, db_processes: Optional[List[Dict[str, Any]]] = None):
        """
        Extended LCA Engine for High-Scale Graphs & Uncertainty.
        Configured to read from live SQLite data if initialized with a db_session.
        """
        self.db_processes = db_processes if db_processes is not None else []
        
        if db_session:
            all_procs = db_session.query(DBProcess).all()
            self.db_processes = [
                {cat: getattr(p, cat, 0.0) for cat in IMPACT_CATEGORIES} | {"name": p.process_name, "location": p.location}
                for p in all_procs
            ]
            
        self.imputer = KNNImputer(n_neighbors=2)
        self.feature_matrix = pd.DataFrame()  # Initialize as empty df
        self._build_feature_matrix()

    def _build_feature_matrix(self):
        if not self.db_processes:
            return
        data = []
        for proc in self.db_processes:
            row = {cat: proc.get(cat) for cat in IMPACT_CATEGORIES}
            data.append(row)
        self.feature_matrix = pd.DataFrame(data)

    def impute_missing_impacts(self, impact_profile: Dict[str, Any]) -> tuple[Dict[str, Any], bool]:
        if self.feature_matrix is None or self.feature_matrix.empty:
            return impact_profile, False

        missing = any(impact_profile.get(cat) is None or np.isnan(impact_profile.get(cat, 0)) for cat in IMPACT_CATEGORIES)
        if not missing:
            return impact_profile, False

        new_row = pd.DataFrame([{cat: impact_profile.get(cat) for cat in IMPACT_CATEGORIES}])
        combined = pd.concat([self.feature_matrix, new_row], ignore_index=True)
        
        try:
            imputed_data = self.imputer.fit_transform(combined)
            imputed_row = imputed_data[-1] 
            return {cat: float(imputed_row[i]) for i, cat in enumerate(IMPACT_CATEGORIES)}, True
        except:
            return impact_profile, False

    def predict_impacts(self, process_data: dict, region_id: str = 'GLO') -> Dict[str, Any]:
        """
        AI & Machine Learning Brain:
        Uses the KNN Imputer to predict the 16 JRC IMPACT_CATEGORIES based on numerical features 
        derived from the process_data (e.g., mass, energy inputs).
        """
        # Feature extraction (mass, energy mapping)
        extracted_features = {cat: process_data.get(cat, 0.0) for cat in IMPACT_CATEGORIES}
        
        # Pass features into the KNN imputer
        predicted_profile, was_imputed = self.impute_missing_impacts(extracted_features)
        
        if was_imputed:
            predicted_profile["_source"] = "ai_knn_predicted"
        else:
            predicted_profile["_source"] = "deterministic"
            
        return predicted_profile

    def calculate_supply_chain(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        iterations: int = 1,
        global_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Master LCIA calculation.
        iterations=1  → deterministic, fast.
        iterations>1  → Monte Carlo using internal stochastic paths.
        """
        # Resolve graph structure once (adj[target] = list of upstream source ids)
        node_map = {str(n["id"]): n for n in nodes}
        adj = {str(n["id"]): [] for n in nodes}
        for e in edges:
            t, s = str(e.get("target", "")), str(e.get("source", ""))
            if t in adj and s in node_map:
                adj[t].append(s)
        
        source_ids = {str(e['source']) for e in edges}
        sink_ids = [nid for nid in node_map if nid not in source_ids]
        
        global_params = global_params or {}
        memo = {}
        
        state = {
            "is_ai_predicted": False, 
            "ai_nodes": [], 
            "has_uncharacterized_flows": False, 
            "uncharacterized_flows": []
        }

        def walk(node_id: str):
            if node_id in memo:
                return memo[node_id]

            node = node_map.get(node_id)
            if not node:
                return np.zeros((iterations, len(IMPACT_CATEGORIES))), False

            data = node.get('data', {})
            exchanges = data.get('exchanges', [])
            local_params = data.get('parameters', {})
            params = {**global_params, **local_params}
            
            # Impacts: (iterations, categories)
            current_impacts = np.zeros((iterations, len(IMPACT_CATEGORIES)))
            node_is_ai = False

            # 1. Direct Impacts
            for ex in exchanges:
                flow_name = ex.get('flow_name', '')
                base_amount = float(ex.get('amount', 0))
                allocation_factor = float(ex.get('allocation_factor', 1.0))
                unc = ex.get('uncertainty')
                
                # 0. Deep Math Evaluation (NEW)
                evaluator = SafeMathEvaluator(params)
                formula = ex.get('formula')
                if formula:
                    base_amount = evaluator.evaluate(formula, base_amount)

                # Sampling logic for exchange amount
                if iterations > 1 and unc and unc.get('type') != 'none':
                    amounts = generate_samples(unc, iterations)
                elif flow_name in params:
                    p_raw = params[flow_name]
                    if isinstance(p_raw, dict):
                        val = float(p_raw.get("value", base_amount))
                    else:
                        try:
                            val = float(p_raw)
                        except (TypeError, ValueError):
                            val = base_amount
                    amounts = np.full(iterations, val)
                else:
                    amounts = np.full(iterations, base_amount)

                amounts = amounts * allocation_factor
                
                # Local scaling logic (Scenario override)
                intensity = float(data.get('intensity', 100)) / 100.0
                amounts = amounts * intensity

                proxy = self._find_proxy_impacts(flow_name, 'GLO') 
                if proxy.get("_source") == "uncharacterized":
                    state["has_uncharacterized_flows"] = True
                    continue

                # --- ISO 14044 Cut-off Rule Integration ---
                # Fixed: Correctly extract from nested goalAndScope schema structure
                cutoff = 0.0
                if global_params:
                    # Check both flat and nested locations for robustness
                    cutoff = float(global_params.get("cutoffThreshold") or 
                                   global_params.get("systemBoundary", {}).get("cutoffThreshold", 0.0))
                
                impact_val = float(proxy.get("gwp_climate_change") or 0.0)
                # If flow is < X% of reference (approximated here as unit 1.0), skip it
                if cutoff > 0 and impact_val < (cutoff * 10): # Heuristic threshold link
                     continue

                proxy_clean = {cat: proxy.get(cat) for cat in IMPACT_CATEGORIES}
                imputed, was_imputed = self.impute_missing_impacts(proxy_clean)
                
                # Quality tagging
                quality = proxy.get("_source", "verified")
                if was_imputed: quality = "imputed"
                if node_id not in state["ai_nodes"] and was_imputed: 
                    state["ai_nodes"].append(node_id)
                
                # Summation: use (iterations,1) * (1, categories) broadcasting
                imp_values = np.array([float(imputed.get(cat) or 0.0) for cat in IMPACT_CATEGORIES])
                current_impacts += (amounts.reshape(-1, 1) @ imp_values.reshape(1, -1))

                # Track node-level quality
                if "quality_profile" not in data: data["quality_profile"] = {}
                data["quality_profile"][flow_name] = quality

            # 2. Upstream Impacts
            for upstream_id in adj.get(node_id, []):
                up_impacts, up_ai = walk(upstream_id)
                if up_ai: node_is_ai = True
                current_impacts += up_impacts

            memo[node_id] = (current_impacts, node_is_ai)
            return current_impacts, node_is_ai

        # Fire calculation from sinks
        total_stochastic_impacts = np.zeros((iterations, len(IMPACT_CATEGORIES)))
        for nid in sink_ids:
            impacts, was_ai = walk(nid)
            if was_ai: state["is_ai_predicted"] = True
            total_stochastic_impacts += impacts

        # Aggregate Results
        mean_impacts = np.mean(total_stochastic_impacts, axis=0)
        final_impacts = {cat: float(mean_impacts[i]) for i, cat in enumerate(IMPACT_CATEGORIES)}
        
        uncertainty_analysis = {}
        if iterations > 1:
            for i, cat in enumerate(IMPACT_CATEGORIES):
                uncertainty_analysis[cat] = calculate_stats(total_stochastic_impacts[:, i])

        # Node Breakdown (Mean only for simplicity in UI)
        node_breakdown = {}
        for nid, (raw_impacts, was_ai) in memo.items():
            means = np.mean(raw_impacts, axis=0)
            node_breakdown[nid] = {
                "name": node_map[nid].get('data', {}).get('processName', 'Unnamed'),
                "module": node_map[nid].get('data', {}).get('module', 'A1-A3'),
                "impacts": {cat: float(means[i]) for i, cat in enumerate(IMPACT_CATEGORIES)},
                "is_ai": was_ai
            }

        return {
            "gwp": final_impacts.get("gwp_climate_change", 0.0),
            "impacts": final_impacts,
            "uncertainty": uncertainty_analysis if iterations > 1 else None,
            "node_breakdown": node_breakdown,
            "is_ai_predicted": state["is_ai_predicted"],
            "iterations": iterations,
            "has_uncharacterized_flows": state["has_uncharacterized_flows"],
        }

    def _compute_deterministic(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        global_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        node_map = {str(n['id']): n for n in nodes}
        adj = {str(n['id']): [] for n in nodes}
        for e in edges:
            adj[str(e['target'])].append(str(e['source']))

        global_params = global_params or {}
        memo = {}
        stack = set()
        
        state = {"is_ai_predicted": False, "ai_nodes": [], "has_uncharacterized_flows": False, "uncharacterized_flows": []}

        def walk(node_id: str):
            if node_id in stack:
                return {cat: 0.0 for cat in IMPACT_CATEGORIES}, False
            if node_id in memo:
                return memo[node_id]

            stack.add(node_id)
            node = node_map.get(node_id)
            if not node:
                stack.remove(node_id)
                return {cat: 0.0 for cat in IMPACT_CATEGORIES}, False

            data = node.get('data', {})
            exchanges = data.get('exchanges', [])
            
            # Hierarchical Scoping: Local Node Params > Global Params
            local_params = data.get('parameters', {})
            params = {**global_params, **local_params}
            
            current_impacts = {cat: 0.0 for cat in IMPACT_CATEGORIES}
            node_is_ai = False

            # 1. Direct Impacts
            for ex in exchanges:
                flow_name = ex.get('flow_name', '')
                base_amount = float(ex.get('amount', 0))
                allocation_factor = float(ex.get('allocation_factor', 1.0))
                
                # 0. Deep Math Evaluation (NEW)
                evaluator = SafeMathEvaluator(params)
                formula = ex.get('formula')
                if formula:
                    base_amount = evaluator.evaluate(formula, base_amount)

                # Deterministic path
                if flow_name in params:
                    p_raw = params[flow_name]
                    if isinstance(p_raw, dict):
                        amounts = float(p_raw.get("value", base_amount))
                    else:
                        try:
                            amounts = float(p_raw)
                        except (TypeError, ValueError):
                            amounts = base_amount
                else:
                    amounts = base_amount

                # Apply allocation — correctly partitions impacts to the declared product fraction
                amounts = amounts * allocation_factor
                
                # Spatial Context
                loc = data.get('location')
                region_id = 'GLO'
                if loc:
                    if loc.get('type') == 'coordinate':
                        coords = loc.get('value', [0, 0])
                        region_id = spatial_engine.resolve_region_from_coords(coords[0], coords[1])
                    else:
                        region_id = loc.get('value', 'GLO')

                proxy = self._find_proxy_impacts(flow_name, region_id)
                
                # Check for uncharacterized flows
                if proxy.get("_source") == "uncharacterized":
                    state["has_uncharacterized_flows"] = True
                    if proxy.get("_warning"):
                        state["uncharacterized_flows"].append(proxy["_warning"])
                    continue  # Skip this flow in impact summation

                # Filter out metadata keys before imputation
                proxy_clean = {cat: proxy.get(cat) for cat in IMPACT_CATEGORIES}
                
                # Replace None values with 0.0 for summation
                for cat in IMPACT_CATEGORIES:
                    if proxy_clean[cat] is None:
                        proxy_clean[cat] = 0.0
                
                imputed, was_imputed = self.impute_missing_impacts(proxy_clean)
                if was_imputed: 
                    node_is_ai = True
                    if node_id not in state["ai_nodes"]:
                        state["ai_nodes"].append(node_id)
                
                for cat in IMPACT_CATEGORIES:
                    current_impacts[cat] += amounts * float(imputed.get(cat, 0.0))

            # 2. Upstream Impacts
            for upstream_id in adj.get(node_id, []):
                up_impacts, up_ai = walk(upstream_id)
                if up_ai: node_is_ai = True
                for cat in IMPACT_CATEGORIES:
                    current_impacts[cat] += up_impacts[cat]

            # 3. Apply Node-Level Intensity (Scenario Override)
            intensity = float(data.get('intensity', 100)) / 100.0
            for cat in IMPACT_CATEGORIES:
                current_impacts[cat] *= intensity

            stack.remove(node_id)
            memo[node_id] = (current_impacts, node_is_ai)
            return current_impacts, node_is_ai

        # Final Aggregation — only sum sink nodes; walk() already propagated upstream
        total_impact_raw = {cat: 0.0 for cat in IMPACT_CATEGORIES}

        # First, call walk() on every node to populate memo and set is_ai flag
        for nid in node_map:
            _, was_ai = walk(nid)
            if was_ai:
                state["is_ai_predicted"] = True

        # Then aggregate ONLY from sinks (nodes with no outgoing edges)
        source_ids = {str(e['source']) for e in edges}
        sink_ids = [nid for nid in node_map if nid not in source_ids]

        for nid in sink_ids:
            impacts, _ = memo.get(nid, ({cat: 0.0 for cat in IMPACT_CATEGORIES}, False))
            for cat in IMPACT_CATEGORIES:
                total_impact_raw[cat] += impacts[cat]

        # Process results
        final_total_impacts = {cat: total_impact_raw[cat] for cat in IMPACT_CATEGORIES}

        # Node Breakdown processing
        final_node_breakdown = {}
        for nid, (raw_impacts, was_ai) in memo.items():
            processed_impacts = {cat: raw_impacts[cat] for cat in IMPACT_CATEGORIES}
            
            final_node_breakdown[nid] = {
                "name": node_map[nid].get('data', {}).get('processName', 'Unnamed'),
                "module": node_map[nid].get('data', {}).get('module', 'A1-A3'),
                "impacts": processed_impacts,
                "uncertainty": None,
                "is_ai": was_ai
            }

        # Hotspot
        total_gwp = final_total_impacts.get('gwp_climate_change', 0.0)
        max_gwp = -1.0
        hotspot = {"node_id": None, "name": "N/A", "percentage": 0.0}
        
        for nid, res in final_node_breakdown.items():
            gwp = res['impacts'].get('gwp_climate_change', 0.0)
            if gwp > max_gwp:
                max_gwp = gwp
                hotspot = {
                    "node_id": nid,
                    "name": res['name'],
                    "percent": (gwp/total_gwp*100) if total_gwp > 0 else 0
                }

        return {
            "gwp": float(final_total_impacts.get('gwp_climate_change', 0.0)),
            "impacts": final_total_impacts,
            "uncertainty": None,
            "node_breakdown": final_node_breakdown,
            "is_ai_predicted": state["is_ai_predicted"],
            "ai_nodes": state["ai_nodes"],
            "hotspots": [hotspot] if hotspot['node_id'] else [],
            "iterations": 1,
            "has_uncharacterized_flows": state["has_uncharacterized_flows"],
            "uncharacterized_flows": state["uncharacterized_flows"],
        }

    def _perturb_data(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        new_nodes = copy.deepcopy(nodes)
        for n in new_nodes:
            data = n.get('data', {})
            # Perturb exchange amounts if they have uncertainty
            for ex in data.get('exchanges', []):
                unc = ex.get('uncertainty')
                if unc and unc.get('type') and unc.get('type') != 'none':
                    samples = generate_samples(unc, 1)
                    ex['amount'] = float(samples[0])
            
            # Perturb parameters
            params = data.get('parameters', {})
            for p_key, p_val in params.items():
                if isinstance(p_val, dict):
                    unc = p_val.get('uncertainty')
                    if unc:
                        p_type = unc.get('type')
                        p_params = unc.get('params', {})
                        if p_type == 'lognormal':
                            mean = float(p_val.get('value', 1.0))
                            sd_g = float(p_params.get('sd_g', p_params.get('geom_sd', 1.2)))
                            n['data']['parameters'][p_key]['value'] = np.random.lognormal(np.log(mean), np.log(sd_g))
                        elif p_type == 'normal':
                            mean = float(p_val.get('value', 1.0))
                            std = float(p_params.get('std', 0.1))
                            n['data']['parameters'][p_key]['value'] = np.random.normal(mean, std)
        return new_nodes

    def _find_proxy_impacts(self, name: str, region_id: str = 'GLO') -> Dict[str, Any]:
        if not name:
            return {cat: None for cat in IMPACT_CATEGORIES}

        name_lower = name.lower().strip()

        # 1. Exact DB match with regional fallback hierarchy
        hierarchy = spatial_engine.get_hierarchical_fallback(region_id)
        for reg in hierarchy:
            for proc in self.db_processes:
                if name_lower == str(proc.get('name', '')).lower() and reg == proc.get('location', 'GLO'):
                    return {cat: proc.get(cat) for cat in IMPACT_CATEGORIES}

        # 2. Partial DB match (substring)
        for proc in self.db_processes:
            if name_lower in str(proc.get('name', '')).lower():
                result = {cat: proc.get(cat) for cat in IMPACT_CATEGORIES}
                result["_source"] = "partial_db_match"
                return result

        # 3. Keyword proxy — scientifically grounded, clearly flagged
        gwp_base = None
        for keyword, gwp_val in GWP_PROXIES.items():
            if keyword in name_lower:
                gwp_base = gwp_val
                break

        if gwp_base is not None:
            proxy = {cat: gwp_base * CATEGORY_GWP_FRACTIONS.get(cat, 0.0) for cat in IMPACT_CATEGORIES}
            proxy["_source"] = "keyword_proxy"
            proxy["_warning"] = (
                f"Impact factors for '{name}' estimated from keyword proxy. "
                "Add this process to the database for accurate results."
            )
            return proxy

        # 4. Completely uncharacterized — return None for all categories
        return {
            cat: None for cat in IMPACT_CATEGORIES
        } | {"_source": "uncharacterized", "_warning": f"Flow '{name}' is uncharacterized. Results exclude this flow."}
    def calculate_sensitivity(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], target_node_id: str, variance: float = 0.10) -> Dict[str, Any]:
        """
        Sensitivity API Engine:
        Calculates the sensitivity of the total Global Warming Potential (GWP) 
        relative to the mass/intensity of a specific node.
        """
        target_id_str = str(target_node_id)
        
        # 1. Baseline
        results_baseline = self.calculate_supply_chain(nodes, edges, iterations=1)
        baseline_gwp = results_baseline.get("gwp", 0.0)
        
        # 2. Low Scenario (-10%)
        nodes_low = copy.deepcopy(nodes)
        for n in nodes_low:
            if str(n.get("id")) == target_id_str:
                # Modifying 'intensity' is a standardized proxy for across-the-board mass fluctuation
                current_intensity = float(n.get("data", {}).get("intensity", 100))
                n["data"]["intensity"] = current_intensity * (1.0 - variance)
        
        results_low = self.calculate_supply_chain(nodes_low, edges, iterations=1)
        low_gwp = results_low.get("gwp", 0.0)
        
        # 3. High Scenario (+10%)
        nodes_high = copy.deepcopy(nodes)
        for n in nodes_high:
            if str(n.get("id")) == target_id_str:
                current_intensity = float(n.get("data", {}).get("intensity", 100))
                n["data"]["intensity"] = current_intensity * (1.0 + variance)
                
        results_high = self.calculate_supply_chain(nodes_high, edges, iterations=1)
        high_gwp = results_high.get("gwp", 0.0)
        
        # 4. Deltas
        delta_low = low_gwp - baseline_gwp
        delta_high = high_gwp - baseline_gwp
        
        # Percentage Variance relative to total
        variance_low_pct = (delta_low / (baseline_gwp if baseline_gwp > 0 else 1.0)) * 100
        variance_high_pct = (delta_high / (baseline_gwp if baseline_gwp > 0 else 1.0)) * 100
        
        logger.info(f"[SENSITIVITY] Node {target_id_str} analyzed. Total GWP shift: {variance_low_pct:+.2f}% / {variance_high_pct:+.2f}%")
        
        return {
            "node_id": target_id_str,
            "node_name": next((n.get("data", {}).get("processName", "Unnamed") for n in nodes if str(n.get("id")) == target_id_str), "Unnamed"),
            "baseline": baseline_gwp,
            "low_scenario": low_gwp,
            "high_scenario": high_gwp,
            "delta_low": delta_low,
            "delta_high": delta_high,
            "variance_low_pct": variance_low_pct,
            "variance_high_pct": variance_high_pct,
            "unit": "kg CO2 eq"
        }

    def generate_interpretation(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deep Interpretation Engine:
        Analyzes LCIA results to generate actionable narratives and benchmark comparisons.
        """
        impacts = result.get("impacts", {})
        gwp = result.get("gwp", 0.0)
        breakdown = result.get("node_breakdown", {})
        
        # 1. Benchmark Comparison
        benchmarks = {}
        for cat, val in impacts.items():
            world_avg = WORLD_BENCHMARKS_PER_CAPITA.get(cat)
            if world_avg:
                benchmarks[cat] = {
                    "value": val,
                    "world_avg": world_avg,
                    "ratio": (val / world_avg) if world_avg > 0 else 0,
                    "status": "High" if val > world_avg else "Optimized"
                }

        # 2. Flow contribution analysis (Hotspots)
        sorted_nodes = sorted(breakdown.items(), key=lambda x: x[1].get("impacts", {}).get("gwp_climate_change", 0), reverse=True)
        top_hotspots = []
        for nid, data in sorted_nodes[:3]:
            top_hotspots.append({
                "id": nid,
                "name": data.get("name"),
                "contribution": (data.get("impacts", {}).get("gwp_climate_change", 0) / gwp * 100) if gwp > 0 else 0
            })

        # 3. Narrative Generation
        if top_hotspots:
            major_hotspot = top_hotspots[0]["name"]
            pct = top_hotspots[0]["contribution"]
            narrative = (
                f"Total Climate Impact is {gwp:.2f} kg CO2e. "
                f"The primary driver is '{major_hotspot}', contributing {pct:.1f}% of carbon equivalents. "
            )
        else:
            major_hotspot = "N/A"
            narrative = f"Total Climate Impact is {gwp:.2f} kg CO2e. No node-level hotspot breakdown available."

        advice = "No critical optimizations detected."
        if gwp > WORLD_BENCHMARKS_PER_CAPITA.get("gwp_climate_change", 999999):
            advice = "Impact significantly exceeds world annual per-capita average. Consider energy grid regionalization."
        elif top_hotspots and top_hotspots[0]["contribution"] > 50:
            advice = f"Supply chain is heavily skewed toward '{major_hotspot}'. Audit this node's mass efficiency."

        return {
            "narrative": narrative,
            "advice": advice,
            "benchmarks": benchmarks,
            "hotspots": top_hotspots
        }
