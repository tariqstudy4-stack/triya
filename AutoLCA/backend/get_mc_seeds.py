import numpy as np
import scipy.stats as stats
from core.engine import perform_monte_carlo

# Simulate the test scenario
nodes = [
    {"id": "A1", "type": "process", "data": {"label": "Rutile Extraction", "exchanges": [{"flow_type": "output", "amount": 1.0, "transfer_rate": 1.0}], "lcia_impacts": {"Climate Change (kg CO2-eq)": 10.0}, "metadata": {"pedigree_matrix": {"reliability": 2, "completeness": 2, "temporal_correlation": 1, "geographical_correlation": 1, "technological_correlation": 1}}}},
    {"id": "A2", "type": "process", "data": {"label": "VAR Smelting", "exchanges": [{"flow_type": "output", "amount": 1.0, "transfer_rate": 1.0}], "lcia_impacts": {"Climate Change (kg CO2-eq)": 5.0}}},
]
edges = [
    {"id": "e1", "source": "A1", "target": "A2"}
]

results = perform_monte_carlo(nodes, edges, iterations=100, random_seed=42)
print(f"MEAN: {results['mean']}")
print(f"P95: {results['p95']}")
