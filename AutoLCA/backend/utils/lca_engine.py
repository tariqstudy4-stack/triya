import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from typing import List, Dict, Any, Optional
import random
from core.spatial_engine import spatial_engine
from core.monte_carlo import generate_samples, calculate_stats

# JRC EF 3.1 Impact Categories
IMPACT_CATEGORIES = [
    'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
    'ep_freshwater', 'ep_marine', 'ep_terrestrial',
    'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
    'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
    'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
    'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
]

class LCAEngine:
    def __init__(self, db_processes: Optional[List[Dict[str, Any]]] = None):
        """
        Extended LCA Engine for High-Scale Graphs & Uncertainty.
        """
        self.db_processes = db_processes if db_processes is not None else []
        self.imputer = KNNImputer(n_neighbors=2)
        self.feature_matrix = pd.DataFrame() # Initialize as empty df
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

    def calculate_supply_chain(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], iterations: int = 1) -> Dict[str, Any]:
        """
        Master LCIA Calculation: Handles Scalable Graphs, Parameters, and Monte Carlo.
        """
        if iterations > 1:
            return self._compute_deterministic(nodes, edges, iterations=iterations)
        
        return self._compute_deterministic(nodes, edges)

    def _compute_deterministic(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], iterations: int = 1) -> Dict[str, Any]:
        node_map = {str(n['id']): n for n in nodes}
        adj = {str(n['id']): [] for n in nodes}
        for e in edges:
            adj[str(e['target'])].append(str(e['source']))

        memo = {}
        stack = set()
        
        state = {"is_ai_predicted": False}

        def walk(node_id: str):
            if node_id in stack:
                if iterations > 1:
                    return {cat: np.zeros(iterations) for cat in IMPACT_CATEGORIES}, False
                return {cat: 0.0 for cat in IMPACT_CATEGORIES}, False
            if node_id in memo:
                return memo[node_id]

            stack.add(node_id)
            node = node_map.get(node_id)
            if not node:
                stack.remove(node_id)
                if iterations > 1:
                    return {cat: np.zeros(iterations) for cat in IMPACT_CATEGORIES}, False
                return {cat: 0.0 for cat in IMPACT_CATEGORIES}, False

            data = node.get('data', {})
            exchanges = data.get('exchanges', [])
            params = data.get('parameters', {})
            
            if iterations > 1:
                current_impacts = {cat: np.zeros(iterations) for cat in IMPACT_CATEGORIES}
            else:
                current_impacts = {cat: 0.0 for cat in IMPACT_CATEGORIES}
            node_is_ai = False

            # 1. Direct Impacts
            for ex in exchanges:
                flow_name = ex.get('flow_name', '')
                base_amount = float(ex.get('amount', 0))
                
                # Distribution logic for Monte Carlo
                if iterations > 1:
                    # If the exchange itself has a distribution
                    ex_unc = ex.get('uncertainty')
                    if ex_unc and ex_unc.get('type') != 'none':
                        amounts = generate_samples(ex_unc, iterations)
                    else:
                        amounts = np.full(iterations, base_amount)
                    
                    # If there's a parameter override (stochastic params)
                    if flow_name in params:
                        p_val = params[flow_name]
                        p_unc = p_val.get('uncertainty')
                        if p_unc and p_unc.get('type') != 'none':
                            # Use parameter distribution
                            amounts = generate_samples(p_unc, iterations)
                        else:
                            # Use parameter scalar
                            amounts = np.full(iterations, float(p_val.get('value', base_amount)))
                else:
                    # Deterministic
                    amounts = base_amount
                    if flow_name in params:
                        amounts = float(params[flow_name].get('value', base_amount))
                
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
                imputed, was_imputed = self.impute_missing_impacts(proxy)
                if was_imputed: node_is_ai = True
                
                for cat in IMPACT_CATEGORIES:
                    current_impacts[cat] += amounts * imputed.get(cat, 0.0)

            # 2. Upstream Impacts
            for upstream_id in adj.get(node_id, []):
                up_impacts, up_ai = walk(upstream_id)
                if up_ai: node_is_ai = True
                for cat in IMPACT_CATEGORIES:
                    current_impacts[cat] += up_impacts[cat]

            stack.remove(node_id)
            memo[node_id] = (current_impacts, node_is_ai)
            return current_impacts, node_is_ai

        # 3. Final Aggregation & Statistical Analysis
        total_impact_raw = {cat: np.zeros(iterations) if iterations > 1 else 0.0 for cat in IMPACT_CATEGORIES}
        sources = {str(e['source']) for e in edges}
        sinks = [nid for nid in node_map if nid not in sources]
        
        for nid in node_map:
            impacts, was_ai = walk(nid)
            if was_ai: state["is_ai_predicted"] = True
            
            if nid in sinks:
                for cat in IMPACT_CATEGORIES:
                    total_impact_raw[cat] += impacts[cat]

        # Process results and calculate stats if MC
        final_total_impacts = {}
        uncertainty_analysis = {}

        for cat in IMPACT_CATEGORIES:
            raw_data = total_impact_raw[cat]
            if iterations > 1:
                stats = calculate_stats(raw_data)
                final_total_impacts[cat] = stats['mean']
                uncertainty_analysis[cat] = stats
            else:
                final_total_impacts[cat] = raw_data

        # Node Breakdown processing
        final_node_breakdown = {}
        for nid, (raw_impacts, was_ai) in memo.items():
            processed_impacts = {}
            node_mc_stats = {}
            for cat in IMPACT_CATEGORIES:
                val = raw_impacts[cat]
                if iterations > 1:
                    s = calculate_stats(val)
                    processed_impacts[cat] = s['mean']
                    node_mc_stats[cat] = s
                else:
                    processed_impacts[cat] = val
            
            final_node_breakdown[nid] = {
                "name": node_map[nid].get('data', {}).get('processName', 'Unnamed'),
                "module": node_map[nid].get('data', {}).get('module', 'A1-A3'),
                "impacts": processed_impacts,
                "uncertainty": node_mc_stats if iterations > 1 else None,
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
            "uncertainty": uncertainty_analysis if iterations > 1 else None,
            "node_breakdown": final_node_breakdown,
            "is_ai_predicted": state["is_ai_predicted"],
            "hotspots": [hotspot] if hotspot['node_id'] else [],
            "iterations": iterations
        }

    def _perturb_data(self, nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        import copy
        new_nodes = copy.deepcopy(nodes)
        for n in new_nodes:
            params = n.get('data', {}).get('parameters', {})
            for p_key, p_val in params.items():
                unc = p_val.get('uncertainty')
                if unc:
                    p_type = unc.get('type')
                    p_params = unc.get('params', {})
                    if p_type == 'lognormal':
                        # mu calculation from mean and sd_g
                        mean = float(p_val.get('value', 1.0))
                        sd_g = float(p_params.get('sd_g', 1.2))
                        n['data']['parameters'][p_key]['value'] = np.random.lognormal(np.log(mean), np.log(sd_g))
                    elif p_type == 'normal':
                        mean = float(p_val.get('value', 1.0))
                        std = float(p_params.get('std', 0.1))
                        n['data']['parameters'][p_key]['value'] = np.random.normal(mean, std)
        return new_nodes

    def _find_proxy_impacts(self, name: str, region_id: str = 'GLO') -> Dict[str, Any]:
        if not name: return {cat: 0.0 for cat in IMPACT_CATEGORIES}
        name_lower = name.lower().strip()
        
        # Hierarchical Fallback: Region -> Nation -> GLO
        hierarchy = spatial_engine.get_hierarchical_fallback(region_id)
        
        for reg in hierarchy:
            for proc in self.db_processes:
                if name_lower == str(proc.get('name', '')).lower() and reg == proc.get('location', 'GLO'):
                    return {cat: proc.get(cat, 0.0) for cat in IMPACT_CATEGORIES}
        
        # Fallback dictionary (Keyword-based)
        fallbacks = {"steel": 2.5, "aluminum": 12.0, "electricity": 0.5, "diesel": 3.2, "titanium": 45.0}
        gwp = 0.5
        for k, v in fallbacks.items():
            if k in name_lower: gwp = v; break

        # Apply regional variation if it's water (AWARE v1.2 logic simulation)
        if "water" in name_lower:
            # Mock regional factor: US=1.5, EU=0.8, GLO=1.0
            regional_factors = {"US": 1.5, "EU": 0.8, "GLO": 1.0}
            factor = regional_factors.get(region_id, 1.0)
            gwp *= factor

        return {cat: (gwp if cat == 'gwp_climate_change' else gwp * 0.05) for cat in IMPACT_CATEGORIES}
