"""
Sanitize React Flow payloads before LCIA: dangling edges, empty graph, and
unify inputs/outputs/elementary_flows into exchanges the engine understands.
"""
from __future__ import annotations

import copy
import logging
from typing import Any, Dict, List, Tuple

logger = logging.getLogger(__name__)


def _flow_to_exchange(flow: Dict[str, Any], *, default_name: str = "") -> Dict[str, Any]:
    name = flow.get("name") or flow.get("flow_name") or default_name
    try:
        amount = float(flow.get("amount", 0) or 0)
    except (TypeError, ValueError):
        amount = 0.0
    return {
        "flow_name": str(name),
        "amount": amount,
        "formula": flow.get("formula"),
        "allocation_factor": float(flow.get("allocation_factor", 1.0) or 1.0),
        "uncertainty": flow.get("uncertainty"),
    }


def normalize_node_for_engine(node: Dict[str, Any]) -> Dict[str, Any]:
    """Deep-clone a node and attach merged exchanges + processName for LCAEngine."""
    n = copy.deepcopy(node)
    data = dict(n.get("data") or {})
    label = data.get("label") or data.get("processName") or "Unnamed"
    data["processName"] = data.get("processName") or label
    data["label"] = data.get("label") or label

    exchanges: List[Dict[str, Any]] = list(data.get("exchanges") or [])
    for f in data.get("inputs") or []:
        exchanges.append(_flow_to_exchange(f))
    for f in data.get("outputs") or []:
        exchanges.append(_flow_to_exchange(f))
    for f in data.get("elementary_flows") or []:
        exchanges.append(_flow_to_exchange(f))

    data["exchanges"] = exchanges
    n["data"] = data
    return n


def sanitize_graph(
    nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[str]]:
    """
    Drop edges whose source/target are missing; optionally log warnings.
    Returns (sanitized_nodes, sanitized_edges, warnings).
    """
    warnings: List[str] = []
    node_ids = {str(n.get("id")) for n in nodes if n.get("id") is not None}
    clean_edges: List[Dict[str, Any]] = []
    for e in edges or []:
        sid = str(e.get("source", ""))
        tid = str(e.get("target", ""))
        if sid not in node_ids or tid not in node_ids:
            warnings.append(f"Dropped dangling edge {e.get('id', '?')}: {sid} -> {tid}")
            continue
        clean_edges.append(e)

    if warnings:
        for w in warnings[:20]:
            logger.info(w)
        if len(warnings) > 20:
            logger.info("... %d more dangling edges omitted", len(warnings) - 20)

    normalized_nodes = [normalize_node_for_engine(n) for n in nodes]
    return normalized_nodes, clean_edges, warnings


def prepare_lcia_payload(
    nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Full pipeline for /api/calculate-lcia."""
    n2, e2, _ = sanitize_graph(nodes, edges)
    return n2, e2
