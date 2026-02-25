import json
import pandas as pd
import tempfile
import os
import zipfile
import sqlite3

def parse_openlca_json(file_path):
    """
    Parse OpenLCA JSON-LD file and extract processes with exchanges.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    processes = []

    # JSON-LD can be a list or dict
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        items = [data]
    else:
        return processes

    for item in items:
        if item.get('@type') == 'Process':
            process = {
                'id': item.get('@id', ''),
                'name': item.get('name', ''),
                'description': item.get('description', ''),
                'exchanges': []
            }
            exchanges = item.get('exchanges', [])
            for exch in exchanges:
                exchange = {
                    'flow_name': exch.get('flow', {}).get('name', ''),
                    'amount': exch.get('amount', 0.0),
                    'unit': exch.get('unit', {}).get('name', ''),
                    'flow_type': 'input' if exch.get('isInput', False) else 'output'
                }
                process['exchanges'].append(exchange)
            processes.append(process)

    return processes

def parse_csv_database(file_path):
    """
    Parse CSV LCA database.
    Assumes columns: process_name, unit, and exchange columns like exchange_flow_1, exchange_amount_1, etc.
    """
    df = pd.read_csv(file_path)
    processes = []

    for _, row in df.iterrows():
        process = {
            'name': row.get('process_name', ''),
            'unit': row.get('unit', ''),
            'exchanges': []
        }
        # Find exchange columns
        i = 1
        while f'exchange_flow_{i}' in df.columns and pd.notna(row.get(f'exchange_flow_{i}')):
            exchange = {
                'flow_name': row[f'exchange_flow_{i}'],
                'amount': row.get(f'exchange_amount_{i}', 0.0),
                'unit': row.get(f'exchange_unit_{i}', 'kg'),
                'flow_type': row.get(f'exchange_type_{i}', 'input')
            }
            process['exchanges'].append(exchange)
            i += 1
        processes.append(process)

    return processes

def parse_sqlite_database(db_path):
    """
    Parse OpenLCA SQLite database and extract processes with exchanges.
    Also handles Derby databases by providing helpful error messages.
    """
    processes = []
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if this is actually a Derby database
        try:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1")
            tables = cursor.fetchall()
        except sqlite3.DatabaseError as e:
            # This might be a Derby database
            conn.close()
            print(f"Warning: {db_path} appears to be a Derby database, not SQLite. OpenLCA .zolca files use Derby databases which require Java JDBC drivers to access from Python. Consider exporting your database to JSON-LD format from OpenLCA instead.")
            return processes
        cursor.execute("""
            SELECT id, ref_id, name, description 
            FROM tbl_processes 
            WHERE name IS NOT NULL
        """)
        
        process_rows = cursor.fetchall()
        
        for process_row in process_rows:
            process_id, ref_id, name, description = process_row
            
            process = {
                'id': ref_id or str(process_id),
                'name': name or '',
                'description': description or '',
                'exchanges': []
            }
            
            # Query exchanges for this process
            cursor.execute("""
                SELECT e.amount, e.is_input, f.name as flow_name, u.name as unit_name
                FROM tbl_exchanges e
                JOIN tbl_flows f ON e.f_flow = f.id
                LEFT JOIN tbl_units u ON e.f_unit = u.id
                WHERE e.f_owner = ?
            """, (process_id,))
            
            exchange_rows = cursor.fetchall()
            
            for exchange_row in exchange_rows:
                amount, is_input, flow_name, unit_name = exchange_row
                
                exchange = {
                    'flow_name': flow_name or '',
                    'amount': amount or 0.0,
                    'unit': unit_name or 'kg',
                    'flow_type': 'input' if is_input else 'output'
                }
                process['exchanges'].append(exchange)
            
            processes.append(process)
        
        conn.close()
        
    except Exception as e:
        print(f"Error parsing SQLite database: {e}")
        # Fallback: try to find JSON files if SQLite parsing fails
        return []
    
    return processes

def parse_uploaded_file(file_path, filename):
    """
    Parse uploaded file based on extension.
    """
    if filename.endswith('.json'):
        return parse_openlca_json(file_path)
    elif filename.endswith('.csv'):
        return parse_csv_database(file_path)
    elif filename.endswith(('.zip', '.zolca')):
        # For zip/zolca, extract and look for database files or JSON files
        processes = []
        with tempfile.TemporaryDirectory() as temp_dir:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Check if this is a Derby database (OpenLCA .zolca format)
            derby_indicators = ['service.properties', 'seg0/']
            has_derby = any(os.path.exists(os.path.join(temp_dir, indicator)) for indicator in derby_indicators)
            
            if has_derby:
                print(f"Warning: {filename} contains a Derby database (OpenLCA native format). Python cannot directly read Derby databases without Java JDBC drivers.")
                print("To use this database with Triya.io, please export it from OpenLCA as JSON-LD format and upload the .json file instead.")
                return processes
            
            # First, look for SQLite database files
            for root, dirs, files in os.walk(temp_dir):
                for f in files:
                    if f.endswith('.db') or f == 'olca.db':
                        db_path = os.path.join(root, f)
                        db_processes = parse_sqlite_database(db_path)
                        if db_processes:
                            processes.extend(db_processes)
                            break  # Found database, no need to look further
            
            # If no database found, look for JSON files (fallback)
            if not processes:
                for root, dirs, files in os.walk(temp_dir):
                    for f in files:
                        if f.endswith('.json'):
                            json_path = os.path.join(root, f)
                            processes.extend(parse_openlca_json(json_path))
        
        return processes
    else:
        raise ValueError("Unsupported file type")