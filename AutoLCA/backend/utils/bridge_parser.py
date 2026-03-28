import sqlite3
import json
import os
import ijson
from typing import List, Dict, Any

db_dir = r"C:\Users\Asus\Documents\triya\Database_Triya\data_bases"

def fetch_detailed_process(zolca_filename: str, process_id: str) -> Dict[str, Any]:
    """
    Connects to OpenLCA SQLite databases to extract EXACT LCI exchanges.
    Differentiates between technosphere (product) and biosphere (elementary) flows.
    """
    path = os.path.join(db_dir, zolca_filename)
    if not os.path.exists(path):
        return {"error": f"Database {zolca_filename} not found."}
        
    try:
        conn = sqlite3.connect(path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # 1. Fetch Process Metadata
        cursor.execute("SELECT name, description, f_category FROM tbl_processes WHERE id = ?", (process_id,))
        proc = cursor.fetchone()
        if not proc:
            cursor.execute("SELECT name, description, f_category FROM tbl_processes WHERE id = ?", (int(process_id) if process_id.isdigit() else 0,))
            proc = cursor.fetchone()
        
        if not proc:
            conn.close()
            return {"error": f"Process ID {process_id} not found in {zolca_filename}"}

        # 2. Fetch All Exchanges (Inputs and Outputs)
        # We join with tbl_flows to get the nomenclature and classification
        query = """
            SELECT 
                f.id as flow_id, 
                f.name as flow_name, 
                f.f_flow_type,
                e.f_amount as amount, 
                e.is_input,
                u.name as unit_name
            FROM tbl_exchanges e
            JOIN tbl_flows f ON e.f_flow = f.id
            LEFT JOIN tbl_units u ON e.f_unit = u.id
            WHERE e.f_owner = ?
        """
        cursor.execute(query, (process_id,))
        rows = cursor.fetchall()
        conn.close()
        
        inputs = []
        outputs = []
        elementary_flows = []
        
        for row in rows:
            exchange = {
                "id": str(row["flow_id"]),
                "name": row["flow_name"],
                "amount": float(row["amount"]),
                "unit": row["unit_name"] or "kg",
                "is_input": bool(row["is_input"]),
                "flow_type": row["f_flow_type"]
            }
            
            # OpenLCA flow_type: 
            # ELEMENTARY_FLOW -> Biosphere
            # PRODUCT_FLOW -> Technosphere
            # WASTE_FLOW -> Technosphere/End-of-Life
            if row["f_flow_type"] == "ELEMENTARY_FLOW":
                elementary_flows.append(exchange)
            else:
                if row["is_input"]:
                    inputs.append(exchange)
                else:
                    outputs.append(exchange)
            
        return {
            "id": process_id,
            "name": proc["name"],
            "description": proc["description"],
            "category": proc["f_category"],
            "inputs": inputs,
            "outputs": outputs,
            "elementary_flows": elementary_flows,
            "source": zolca_filename
        }
    except Exception as e:
        return {"error": str(e)}

def parse_json_ld(filename: str, query_key: str) -> Dict[str, Any]:
    # (Remains similar but ensures it can handle the same unified structure)
    path = os.path.join(db_dir, filename)
    ... # (Keeping the ijson logic)
