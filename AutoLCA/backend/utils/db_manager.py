import os
import uuid
import logging
from typing import List, Dict, Any, Optional
from utils.lca_parser import parse_uploaded_file

logger = logging.getLogger(__name__)

# Resolve library dir from env (same var as main.py) with cross-platform default
_default_db_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "Database_Triya", "data_bases")
)
LOCAL_DB_PATH = os.environ.get("LOCAL_DATABASE_DIR") or os.environ.get("LOCAL_DB_PATH") or _default_db_path

# Global Cache for ingested nodes to enable searching and direct retrieval
INGESTED_NODES_CACHE: Dict[str, Dict[str, Any]] = {}

def scan_local_databases(db_path: str = LOCAL_DB_PATH) -> List[Dict[str, Any]]:
    """
    Scans the local directory for supported LCA database files and parses them.
    """
    all_processes = []
    
    if not os.path.exists(db_path):
        logger.warning(f"Local database path {db_path} does not exist.")
        return []

    logger.info(f"Scanning local databases in {db_path}...")
    
    for root, _, files in os.walk(db_path):
        for file in files:
            if file.lower().endswith(('.json', '.csv', '.zip', '.zolca', '.dat', '.mf', '.ctrl')):
                file_path = os.path.join(root, file)
                try:
                    logger.info(f"Ingesting {file}...")
                    result = parse_uploaded_file(file_path)
                    
                    if "error" in result:
                        logger.error(f"Failed to parse {file}: {result['error']}")
                        continue
                        
                    # Add metadata about source
                    for proc in result.get("processes", []):
                        proc["source_db"] = file
                        proc["source_path"] = file_path
                        all_processes.append(proc)
                        
                except Exception as e:
                    logger.error(f"Critical error ingesting {file}: {e}")

    logger.info(f"Ingestion complete. Found {len(all_processes)} local processes.")
    return all_processes

def get_ingested_nodes() -> List[Dict[str, Any]]:
    """
    Converts ingested processes into React Flow node format.
    """
    processes = scan_local_databases()
    nodes = []
    
    # Clear and repopulate cache
    global INGESTED_NODES_CACHE
    INGESTED_NODES_CACHE = {}

    for proc in processes:
        node_id = proc.get("id", str(uuid.uuid4()))
        
        # Calculate a mock DQI based on metadata completeness
        dqi_score = 4 # Default "Fair"
        if proc.get("version"): dqi_score -= 1
        if proc.get("location_code") and proc.get("location_code") != "GLO": dqi_score -= 1
        dqi_score = max(1, dqi_score)

        node_data = {
            "id": node_id,
            "type": "process",
            "data": {
                "label": proc.get("name", "Unnamed Process"),
                "processName": proc.get("name", "Unnamed Process"),
                "category": proc.get("category", "General"),
                "uuid": node_id,
                "location": proc.get("location_code", "GLO"),
                "data_year": proc.get("data_year", 2023),
                "dqi": dqi_score,
                "version": proc.get("version", "1.0.0"),
                "source": proc.get("source_db", "Local Ingest"),
                "source_path": proc.get("source_path"),
                "parameters": proc.get("parameters", {}),
                "exchanges": [ex for ex in proc.get("exchanges", [])],
                "inputs": [ex for ex in proc.get("exchanges", []) if ex.get("flow_type") == "Input"],
                "outputs": [ex for ex in proc.get("exchanges", []) if ex.get("flow_type") == "Output"],
                "elementary_flows": [ex for ex in proc.get("exchanges", []) if ex.get("is_elementary")]
            }
        }
        nodes.append(node_data)
        INGESTED_NODES_CACHE[node_id] = node_data
        
    return nodes

def search_ingested_nodes(query: str = "") -> List[Dict[str, Any]]:
    """
    Searches the cache for nodes matching the query.
    """
    if not INGESTED_NODES_CACHE:
        get_ingested_nodes() # Trigger one-time scan if empty
        
    if not query:
        return list(INGESTED_NODES_CACHE.values())
        
    q = query.lower()
    return [
        n for n in INGESTED_NODES_CACHE.values() 
        if q in n["data"]["label"].lower() or q in n["data"]["category"].lower()
    ]

def get_node_by_id(node_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single node's deep data from the cache.
    """
    if not INGESTED_NODES_CACHE:
        get_ingested_nodes()
    return INGESTED_NODES_CACHE.get(node_id)
