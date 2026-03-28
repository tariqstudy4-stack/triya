import pytest
import numpy as np
from core.engine import perform_monte_carlo

def test_monte_carlo_deterministic_seed():
    """
    CI/CD Hardened Stochastic Test.
    Objective: Prove that injecting a static seed yields deterministic LCA results.
    """
    # Titanium-like Scenario
    nodes = [
        {"id": "A1", "type": "process", "data": {
            "label": "Rutile Extraction", 
            "exchanges": [{"flow_type": "output", "amount": 1.0, "transfer_rate": 1.0}], 
            "lcia_impacts": {"Climate Change (kg CO2-eq)": 10.0},
            "metadata": {"pedigree_matrix": {"reliability": 2, "completeness": 2, "temporal_correlation": 1, "geographical_correlation": 1, "technological_correlation": 1}}
        }},
        {"id": "A2", "type": "process", "data": {
            "label": "VAR Smelting", 
            "exchanges": [{"flow_type": "output", "amount": 1.0, "transfer_rate": 1.0}], 
            "lcia_impacts": {"Climate Change (kg CO2-eq)": 5.0}
        }},
    ]
    edges = [
        {"id": "e1", "source": "A1", "target": "A2"}
    ]

    # Execute with deterministic seed 42
    results = perform_monte_carlo(nodes, edges, iterations=100, random_seed=42)
    
    # HARD ASSERTIONS (Values derived from deterministic run)
    assert abs(results["mean"] - 14.96128) < 1e-4, f"Deterministic Mean mismatch: {results['mean']}"
    assert abs(results["p95"] - 15.43878) < 1e-4, f"Deterministic P95 mismatch: {results['p95']}"
    assert results["sd"] > 0, "Standard deviation must be non-zero"
    assert results["iterations"] == 100
    
    print("\u2705 Stochastic Proof: Deterministic MC suite verified with seed 42.")
