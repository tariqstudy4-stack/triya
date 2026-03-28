import pytest
import numpy as np
from core.engine import calculate_lca

def test_titanium_feedback_convergence():
    """
    Scenario: Titanium BTF 10:1
    A1: Rutile Extraction (Supply node)
    A2: VAR Smelting (Intermediate with recycling input)
    A3: CNC Milling (Output node with high swarf feedback)
    
    Feedback: A3 -> A2 (Swarf Recycling)
    CNC Coefficients: 0.1 (Product), 0.9 (Swarf Feedback)
    Functional Unit: 1.0 kg of CNC Product
    Requirement: Convergence to 10.0 kg Smelting activity to produce 1.0 kg Product.
    """
    # Define Nodes
    nodes = [
        {"id": "A1", "data": {"label": "Rutile Extraction", "exchanges": [
            {"flow_name": "Rutile", "flow_type": "output", "amount": 1.0}
        ]}},
        {"id": "A2", "data": {"label": "VAR Smelting", "exchanges": [
            {"flow_name": "Rutile", "flow_type": "input", "amount": 1.0},
            {"flow_name": "Ti Sponge", "flow_type": "output", "amount": 1.0}
        ]}},
        {"id": "A3", "data": {"label": "CNC Milling", "exchanges": [
            {"flow_name": "Ti Sponge", "flow_type": "input", "amount": 1.0},
            {"flow_name": "Ti Bracket", "flow_type": "output", "amount": 1.0, "transfer_rate": 0.1},
            {"flow_name": "Ti Swarf", "flow_type": "output", "amount": 1.0, "transfer_rate": 0.9}
        ]}}
    ]
    
    # Define Edges
    edges = [
        {"id": "e1", "source": "A1", "target": "A2"},
        {"id": "e2", "source": "A2", "target": "A3"},
        {"id": "e3", "source": "A3", "target": "A2", "data": {"isFeedbackLoop": True}} # Feedback Swarf
    ]
    
    # Execute LCIA Computation
    result = calculate_lca(nodes, edges, functional_unit="Ti Bracket", reference_flow=1.0)
    
    contributions = {c['node_id']: c['mass_required'] for c in result['contributions']}
    
    # ASSERTIONS
    # To get 1kg of Bracket from CNC (0.1 efficiency), we need 10kg of CNC activity
    assert abs(contributions['A3'] - 10.0) < 1e-9, f"CNC Activity should be 10.0, got {contributions['A3']}"
    
    # Smelting activity scales with CNC 1:1 in this topology
    assert abs(contributions['A2'] - 10.0) < 1e-9, "VAR Smelting activity should be 10.0 kg"

    # VIRGIN EXTRACTION PROOF:
    # Smelter needs 10kg Total. 9kg comes from A3 (Recycled Swarf).
    # Virgin Extraction (A1) must only provide the 1.0kg makeup.
    assert abs(contributions['A1'] - 1.0) < 1e-9, f"VIRGIN DOUBLE-COUNT DETECTED: A1 Extraction should be 1.0, got {contributions['A1']}"
    
    print("\u2705 Physics Proof: Mass Balance Paradox resolved. Virgin extraction = 1.0, Smelting = 10.0.")

if __name__ == "__main__":
    test_titanium_feedback_convergence()
