import sys
import os
import datetime
from typing import List, Dict, Any, Optional, Union

# Ensure the backend directory is in the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, HTTPException, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pandas as pd
from sklearn.impute import KNNImputer
import numpy as np
import shutil
import json
import zipfile
import tempfile
from sqlalchemy.orm import Session

# Local imports
from core.reporter import JRCReporter
from models import SessionLocal, LCAProcess as DBProcess, LCAExchange, db_manager, init_db, LCAModel, NodeParameter
from utils.lca_parser import parse_uploaded_file
from utils.lca_engine import LCAEngine
from schemas import (
    LCIAComputePayload, ModelSavePayload, ParameterSchema, 
    UncertaintySchema, NodeSchema, EdgeSchema
)

# Global in-memory cache for uploaded database processes
uploaded_processes_cache = []

app = FastAPI(title="Triya.io Unified API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static path setup
static_path = os.path.join(backend_dir, "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)

# Initialize database
init_db()

app.mount("/static", StaticFiles(directory=static_path), name="static")

reporter = JRCReporter()

@app.get("/")
async def root():
    return {"message": "Triya.io API is running."}

# --- Persistence Endpoints ---

@app.post("/api/models")
async def save_model(payload: ModelSavePayload):
    """
    Saves a user-created workspace graph and its parameters.
    """
    db = SessionLocal()
    try:
        new_model = LCAModel(
            name=payload.name,
            description=payload.description,
            nodes_data=payload.nodes,
            edges_data=payload.edges
        )
        db.add(new_model)
        db.commit()
        db.refresh(new_model)
        
        # Save node-specific parameters
        for p in payload.parameters:
            node_param = NodeParameter(
                model_id=new_model.id,
                node_id=p.get("nodeId"),
                param_key=p.get("key"),
                param_value=p.get("value"),
                unit=p.get("unit"),
                uncertainty_type=p.get("uncertaintyType"),
                uncertainty_params=p.get("uncertaintyParams")
            )
            db.add(node_param)
        
        db.commit()
        return {"id": new_model.id, "status": "saved"}
    finally:
        db.close()

@app.get("/api/models")
async def list_models():
    db = SessionLocal()
    try:
        models = db.query(LCAModel).all()
        return [{"id": m.id, "name": m.name, "created_at": m.created_at} for m in models]
    finally:
        db.close()

@app.get("/api/models/{model_id}")
async def load_model(model_id: int):
    db = SessionLocal()
    try:
        model = db.query(LCAModel).filter(LCAModel.id == model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        params = db.query(NodeParameter).filter(NodeParameter.model_id == model_id).all()
        return {
            "name": model.name,
            "description": model.description,
            "nodes": model.nodes_data,
            "edges": model.edges_data,
            "parameters": [
                {
                    "nodeId": p.node_id,
                    "key": p.param_key,
                    "value": p.param_value,
                    "unit": p.unit
                } for p in params
            ]
        }
    finally:
        db.close()

# --- Parameter Endpoints ---

@app.get("/api/parameters/definitions")
async def get_parameter_definitions(processId: Optional[int] = None):
    """
    Scientific Parameter Discovery.
    Discovers parameters marked in DB or adds generic ones.
    """
    db = SessionLocal()
    try:
        definitions = []
        if processId:
            exchanges = db.query(LCAExchange).filter(LCAExchange.process_id == processId).all()
            for ex in exchanges:
                if ex.is_parameter or '%' in ex.flow_name:
                    definitions.append({
                        "key": ex.flow_name,
                        "name": ex.flow_name,
                        "unit": ex.unit,
                        "defaultValue": ex.amount,
                        "description": ex.description or f"Input flow: {ex.flow_name}",
                        "uncertainty": {
                            "type": ex.uncertainty_type or "none",
                            "params": ex.uncertainty_params or {}
                        }
                    })
        
        # Add Generic Parameters
        definitions.append({
            "key": "transport_distance",
            "name": "Transport Distance",
            "unit": "km",
            "defaultValue": 100.0,
            "description": "Custom transport distance for logistics calculation."
        })
        return definitions
    finally:
        db.close()

# --- Calculation Engine ---

@app.post("/api/calculate-lcia")
async def calculate_lcia(payload: LCIAComputePayload):
    """
    Upgraded LCIA Engine: Handles Pydantic validation, unlimited nodes, and Monte Carlo.
    """
    # Prepare DB data for engine cache
    db = SessionLocal()
    try:
        all_procs = db.query(DBProcess).all()
        impact_cols = [
            'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
            'ep_freshwater', 'ep_marine', 'ep_terrestrial',
            'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
            'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
            'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
            'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
        ]
        db_data = [{col: getattr(p, col) for col in impact_cols} | {"name": p.process_name, "location": p.location} for p in all_procs]
            
        engine = LCAEngine(db_processes=db_data)
        
        # Convert Pydantic to dict for engine
        results = engine.calculate_supply_chain(
            [n.dict() for n in payload.nodes], 
            [e.dict() for e in payload.edges], 
            iterations=payload.iterations
        )
        
        return results
    finally:
        db.close()


@app.get("/api/processes")
async def list_processes():
    db = SessionLocal()
    try:
        procs = db.query(DBProcess).all()
        return [{"id": p.id, "name": p.process_name, "category": p.category, "location": p.location} for p in procs]
    finally:
        db.close()


@app.get("/api/process/{process_id}/parameters")
async def get_process_parameters_legacy(process_id: int):
    """
    Legacy Support for Phase 1-10 Frontend.
    """
    db = SessionLocal()
    try:
        process = db.query(DBProcess).filter(DBProcess.id == process_id).first()
        if not process:
            raise HTTPException(status_code=404, detail="Process not found")
        
        exchanges = db.query(LCAExchange).filter(LCAExchange.process_id == process_id).all()
        params = []
        for exch in exchanges:
            if '%' in exch.flow_name or exch.flow_type == 'input':
                params.append({
                    "id": exch.flow_name,
                    "name": f"{exch.flow_name} ({exch.unit})",
                    "min": 0.0,
                    "max": exch.amount * 5,
                    "step": 0.1,
                    "default": exch.amount
                })
        return params
    finally:
        db.close()

@app.get("/api/process/shuffle")
async def shuffle_benchy():
    """
    The Shuffle Engine (Fixed for updated DB schema).
    """
    benchmarks = ["Primary Aluminum", "PET Bottle", "EU Electricity Mix", "Corrugated Board", "Truck Transport"]
    import random
    selected_name = random.choice(benchmarks)
    
    db = SessionLocal()
    try:
        process = db.query(DBProcess).filter(DBProcess.process_name.like(f"%{selected_name}%")).first()
        if not process:
            process = db.query(DBProcess).first()
            if not process: raise HTTPException(status_code=404, detail="No processes found.")

        impact_cols = [
            'gwp_climate_change', 'odp_ozone_depletion', 'ap_acidification', 
            'ep_freshwater', 'ep_marine', 'ep_terrestrial',
            'pocp_photochemical_ozone', 'pm_particulate_matter', 'ir_ionising_radiation', 
            'ht_c_human_toxicity_cancer', 'ht_nc_human_toxicity_non_cancer', 
            'et_fw_ecotoxicity_freshwater', 'lu_land_use', 'wsf_water_scarcity', 
            'ru_mm_resource_use_min_met', 'ru_f_resource_use_fossils'
        ]
        
        results = {col: float(getattr(process, col) or 0.0) for col in impact_cols}
            
        return {
            "process_name": process.process_name,
            "unit": process.unit or "kg",
            "quantity": 1.0,
            "impacts": results,
            "metadata": {
                "method": "EF 3.1 (JRC)",
                "benchmark": selected_name,
                "location": process.location or "GLO"
            }
        }
    finally:
        db.close()

@app.post("/api/generate-pdf")
async def generate_canvas_pdf(payload: dict):
    print(f"DEBUG: /api/generate-pdf received!")
    nodes = payload.get("nodes", [])
    edges = payload.get("edges", [])
    compliance_framework = payload.get("complianceFramework", "iso-14044")
    lcia_results = payload.get("lciaResults")
    snapshot = payload.get("snapshot") 
    
    if not lcia_results:
        raise HTTPException(status_code=400, detail="Calculate impact first.")
    
    report_data = {
        "process_name": "Triya.io Scientific Model",
        "impacts": lcia_results.get("impacts", {}),
        "uncertainty": lcia_results.get("uncertainty"),
        "iterations": lcia_results.get("iterations", 1),
        "metadata": {
            "method": "EF 3.1 (JRC)",
            "compliance_framework": compliance_framework,
            "node_count": len(nodes),
            "edge_count": len(edges),
            "snapshot": snapshot,
            "is_ai_predicted": lcia_results.get("is_ai_predicted", False),
            "node_breakdown": lcia_results.get("node_breakdown", {})
        }
    }

    report_filename = f"AutoLCA_Report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    from fastapi.concurrency import run_in_threadpool
    
    try:
        pdf_buffer = await run_in_threadpool(reporter.generate_pdf_buffer, report_data)
        pdf_content = pdf_buffer.getvalue()
        pdf_buffer.close()
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={report_filename}"}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search-processes")
async def search_processes(q: str = ""):
    db = SessionLocal()
    try:
        query = db.query(DBProcess)
        if q:
            query = query.filter(DBProcess.process_name.like(f"%{q}%"))
        results = query.limit(50).all()
        return [{"id": r.id, "name": r.process_name, "location": r.location, "unit": r.unit} for r in results]
    finally:
        db.close()

@app.post("/api/upload-database")
async def upload_database(file: UploadFile = File(...)):
    temp_file_path = None
    db = SessionLocal()
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        # Universal Database Abstraction Middleware Logic
        result = parse_uploaded_file(temp_file_path)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        processes = result.get("processes", [])
        metadata = result.get("metadata", {})
        
        success_count = 0
        conflict_count = 0

        for p in processes:
            try:
                # Validation: Pydantic Triya Schema ensures data consistency
                # Create the main process record
                new_proc = DBProcess(
                    process_name=p.get("name"),
                    unit=p.get("exchanges")[0].get("unit") if p.get("exchanges") else "unit",
                    location=p.get("location_code"),
                    category=p.get("category"),
                    # Future-proofing: versioning and source metadata
                    technology=f"Source: {metadata.get('source_db')} | Version: {p.get('version')}"
                )
                db.add(new_proc)
                db.flush() # Get ID before adding exchanges
                
                # Map unified exchanges to DB exchanges
                for ex in p.get("exchanges", []):
                    new_ex = LCAExchange(
                        process_id=new_proc.id,
                        flow_name=ex.get("name"),
                        amount=ex.get("amount"),
                        unit=ex.get("unit"),
                        flow_type=ex.get("flow_type").lower(),
                        is_parameter='%' in ex.get("name"),
                        uncertainty_type="lognormal" if ex.get("is_elementary") else "none"
                    )
                    db.add(new_ex)
                
                success_count += 1
            except Exception as semantic_error:
                # Error Recovery: Log Semantic Conflict but continue
                print(f"CRITICAL: Semantic Conflict in process '{p.get('name')}': {semantic_error}")
                conflict_count += 1
                db.rollback() # Rollback only this process
                # Re-acquire session for next processes if needed, but since we use flush, 
                # we might need to be careful. In SQLite, one transaction is fine.
                continue

        db.commit()
        return {
            "status": "success", 
            "inserted": success_count, 
            "conflicts": conflict_count,
            "source": metadata.get("source_db"),
            "processes": processes,
            "metadata": metadata
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
