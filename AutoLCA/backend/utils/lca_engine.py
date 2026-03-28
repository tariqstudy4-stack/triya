import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from typing import List, Dict, Any, Optional
import copy
import logging
from core.spatial_engine import spatial_engine
from core.monte_carlo import generate_samples, calculate_stats

logger = logging.getLogger(__name__)

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

# Category-specific fraction of GWP for generic proxy flows (literature-derived averages)
# These are used ONLY when no DB match exists AND only for the PDF's "estimated" column
CATEGORY_GWP_FRACTIONS = {
    "gwp_climate_change":          1.000,
    "odp_ozone_depletion":         1.5e-8,
    "ap_acidification":            3.5e-3,
    "ep_freshwater":               8.0e-5,
    "ep_marine":                   1.2e-3,
    "ep_terrestrial":              9.0e-3,
    "pocp_photochemical_ozone":    3.0e-4,
    "pm_particulate_matter":       5.0e-7,
    "ir_ionising_radiation":       2.0e-1,
    "ht_c_human_toxicity_cancer":  1.0e-9,
    "ht_nc_human_toxicity_non_cancer": 2.0e-8,
    "et_fw_ecotoxicity_freshwater": 3.0e-1,
    "lu_land_use":                 1.2e1,
    "wsf_water_scarcity":          5.0e-2,
    "ru_mm_resource_use_min_met":  5.0e-5,
    "ru_f_resource_use_fossils":   1.8e1,
}


class LCAEngine:
    def __init__(self, db_processes: Optional[List[Dict[str, Any]]] = None):
        """
        Extended LCA Engine for High-Scale Graphs & Uncertainty.
        """
        self.db_processes = db_processes if db_processes is not None else []
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
        iterations>1  → Monte Carlo: perturb parameters each pass, collect distributions.
        """
        if iterations <= 1:
            return self._compute_deterministic(nodes, edges, global_params=global_params)

        # --- Monte Carlo loop ---
        # Collect per-category sample arrays across all iterations
        mc_results: Dict[str, List[float]] = {cat: [] for cat in IMPACT_CATEGORIES}
        is_ai_predicted = False

        for _ in range(iterations):
            perturbed_nodes = self._perturb_data(nodes)
            result = self._compute_deterministic(perturbed_nodes, edges, global_params=global_params)
            if result.get("is_ai_predicted"):
                is_ai_predicted = True
            for cat in IMPACT_CATEGORIES:
                mc_results[cat].append(result["impacts"].get(cat, 0.0))

        # Compute statistics across samples
        final_impacts = {}
        uncertainty_analysis = {}
        for cat in IMPACT_CATEGORIES:
            arr = np.array(mc_results[cat])
            stats = calculate_stats(arr)
            final_impacts[cat] = stats["mean"]
            uncertainty_analysis[cat] = stats

        # Run one final deterministic pass to get node_breakdown and hotspot
        deterministic = self._compute_deterministic(nodes, edges, global_params=global_params)

        return {
            "gwp": float(final_impacts.get("gwp_climate_change", 0.0)),
            "impacts": final_impacts,
            "uncertainty": uncertainty_analysis,
            "node_breakdown": deterministic.get("node_breakdown", {}),
            "is_ai_predicted": is_ai_predicted,
            "hotspots": deterministic.get("hotspots", []),
            "iterations": iterations,
            "has_uncharacterized_flows": deterministic.get("has_uncharacterized_flows", False),
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
                
                # Deterministic path
                if flow_name in params:
                    amounts = float(params[flow_name].get('value', base_amount))
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
