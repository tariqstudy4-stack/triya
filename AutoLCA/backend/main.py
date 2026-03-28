import sys
import os
import datetime
import logging
import copy
from typing import List, Dict, Any, Optional, Union

# Ensure the backend directory is in the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Structured logging configuration
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from pydantic import BaseModel
import uuid
import pandas as pd
from sklearn.impute import KNNImputer
import numpy as np
import shutil
import json
import zipfile
import tempfile
import io
import csv
import asyncio
from scipy import stats
from sqlalchemy.orm import Session
from fastapi import Depends
import re

# Local imports
from core.reporter import JRCReporter
from models import (
    SessionLocal, LCAProcess as DBProcess, LCAExchange, init_db,
    LCAModel, LCAModelVersion, NodeParameter, User, Organization, Project, Scenario
)
from utils.lca_parser import parse_uploaded_file
from utils.lca_engine import LCAEngine, IMPACT_CATEGORIES
from schemas import (
    LCIAComputePayload, ModelSavePayload, ParameterSchema, 
    UncertaintySchema, NodeSchema, EdgeSchema, UserCreate, UserSchema, OrganizationSchema, ProjectSchema
)
from auth import get_current_user, get_password_hash, verify_password, create_access_token, get_db
from fastapi.security import OAuth2PasswordRequestForm

# Optional imports — graceful fallback if not available
try:
    from utils.s3_manager import s3_manager
except ImportError:
    s3_manager = None
    logger.warning("S3 manager not available — uploads will be local only")

try:
    from utils.bridge_parser import fetch_detailed_process, parse_json_ld
except ImportError:
    fetch_detailed_process = None
    parse_json_ld = None
    logger.warning("Bridge parser not available")

try:
    from core.engine import calculate_lca, perform_monte_carlo
except ImportError:
    calculate_lca = None
    perform_monte_carlo = None
    logger.warning("Core matrix engine not available — using supply chain engine only")

# Global in-memory cache for uploaded database processes
uploaded_processes_cache = []

# Background Task Storage (for production, use Redis/Celery)
tasks = {}

# High-Performance Python List Search Cache
ZOLCA_CACHE = []

def load_zolca_to_memory():
    """Loads SQLite into native Python dictionaries for sub-millisecond autocomplete resolution."""
    global ZOLCA_CACHE
    # Resolve path portably
    db_path = os.environ.get(
        "ZOLCA_DB_PATH",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Database_Triya", "data_bases", "needs_18.zolca")
    )
    if not os.path.exists(db_path):
        logger.warning(f"Local Ecoinvent/Needs database not found at {db_path}.")
        return
        
    import sqlite3
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        query = """
            SELECT e.f_flow as flow_id, e.f_amount as amount, e.is_input, p.name as process_name
            FROM tbl_exchanges e
            JOIN tbl_processes p ON e.f_owner = p.id
        """
        cursor.execute(query)
        results = cursor.fetchall()
        
        ZOLCA_CACHE = []
        for row in results:
            ZOLCA_CACHE.append({
                "flow_id": row[0],
                "amount": row[1],
                "type": "input" if row[2] else "output",
                "process_name": str(row[3]),
                "geography": "GLO",
                "system_model": "Allocation cut-off",
                "search_key": str(row[3]).lower()
            })
            
        conn.close()
        logger.info(f"In-Memory Exact Dict Cache Loaded: {len(ZOLCA_CACHE)} rows.")
    except Exception as e:
        logger.error(f"Failed to load ZOLCA to memory: {e}")
        ZOLCA_CACHE = []

app = FastAPI(title="Triya.io Unified API")

# CORS — env-configurable for Docker/production
CORS_ORIGINS_RAW = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"
)
CORS_ORIGINS = [o.strip() for o in CORS_ORIGINS_RAW.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
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

@app.on_event("startup")
async def startup_event():
    load_zolca_to_memory()

reporter = JRCReporter()

@app.get("/")
async def root():
    return {"status": "Triya.io SaaS API is Online", "version": "2.0-SaaS"}

# --- SaaS Auth Endpoints ---

@app.post("/api/auth/register", response_model=UserSchema)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == user_in.organization_id).first()
    if not org:
        raise HTTPException(status_code=400, detail="Organization not found")
        
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        organization_id=user_in.organization_id,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Workspace & Project Management ---

@app.get("/api/projects", response_model=List[ProjectSchema])
async def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Project).filter(Project.workspace_id == current_user.organization_id).all()

@app.post("/api/projects", response_model=ProjectSchema)
async def create_project(project: ProjectSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_project = Project(
        name=project.name,
        description=project.description,
        workspace_id=current_user.organization_id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

# --- Persistence Endpoints ---

@app.post("/api/models")
async def save_model(payload: ModelSavePayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == payload.project_id, Project.workspace_id == current_user.organization_id).first()
    if not project:
        raise HTTPException(status_code=403, detail="Project not found or access denied")

    try:
        new_model = LCAModel(
            name=payload.name,
            description=payload.description,
            project_id=payload.project_id,
            nodes_data=payload.nodes,
            edges_data=payload.edges
        )
        db.add(new_model)
        db.commit()
        db.refresh(new_model)
        
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
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- Model Versioning ---

@app.post("/api/models/{model_id}/versions")
async def save_model_version(model_id: int, payload: dict):
    """Snapshot the current state of a model as a named version."""
    db = SessionLocal()
    try:
        model = db.query(LCAModel).filter(LCAModel.id == model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="Model not found")
        
        latest_version = db.query(LCAModelVersion)\
            .filter(LCAModelVersion.model_id == model_id)\
            .order_by(LCAModelVersion.version_number.desc()).first()
        next_version = (latest_version.version_number + 1) if latest_version else 1

        version = LCAModelVersion(
            model_id=model_id,
            version_number=next_version,
            change_description=payload.get("description", ""),
            nodes_snapshot=payload.get("nodes", model.nodes_data),
            edges_snapshot=payload.get("edges", model.edges_data),
            gwp_snapshot=payload.get("gwp"),
        )
        db.add(version)
        db.commit()
        return {"version": next_version, "id": version.id}
    finally:
        db.close()

@app.get("/api/models/{model_id}/versions")
async def list_model_versions(model_id: int):
    db = SessionLocal()
    try:
        versions = db.query(LCAModelVersion)\
            .filter(LCAModelVersion.model_id == model_id)\
            .order_by(LCAModelVersion.version_number.desc()).all()
        return [{"version": v.version_number, "id": v.id, "created_at": v.created_at,
                 "description": v.change_description, "gwp": v.gwp_snapshot} for v in versions]
    finally:
        db.close()

@app.get("/api/models/{model_id}/versions/{version_number}")
async def load_model_version(model_id: int, version_number: int):
    db = SessionLocal()
    try:
        version = db.query(LCAModelVersion)\
            .filter(LCAModelVersion.model_id == model_id,
                    LCAModelVersion.version_number == version_number).first()
        if not version:
            raise HTTPException(status_code=404, detail="Version not found")
        return {"nodes": version.nodes_snapshot, "edges": version.edges_snapshot,
                "version": version.version_number, "created_at": version.created_at}
    finally:
        db.close()

# --- Scenario & Comparative Analysis ---

@app.post("/api/scenarios")
async def create_scenario(name: str, project_id: int, deltas: Dict[str, Any], base_model_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.workspace_id == current_user.organization_id).first()
    if not project:
        raise HTTPException(status_code=403, detail="Project access denied")
        
    new_scenario = Scenario(
        name=name,
        project_id=project_id,
        parameter_deltas=deltas,
        base_model_id=base_model_id
    )
    db.add(new_scenario)
    db.commit()
    db.refresh(new_scenario)
    return new_scenario

@app.get("/api/projects/{project_id}/comparative")
async def get_comparative_data(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.workspace_id == current_user.organization_id).first()
    if not project:
        raise HTTPException(status_code=403, detail="Project access denied")
        
    scenarios = db.query(Scenario).filter(Scenario.project_id == project_id).all()
    return scenarios

@app.get("/api/models")
async def list_models(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    models = db.query(LCAModel).join(Project).filter(Project.workspace_id == current_user.organization_id).all()
    return [{"id": m.id, "name": m.name, "created_at": m.created_at} for m in models]

@app.get("/api/models/{model_id}")
async def load_model(model_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    model = db.query(LCAModel).join(Project).filter(
        LCAModel.id == model_id, 
        Project.workspace_id == current_user.organization_id
    ).first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Model not found or access denied")
    
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

@app.get("/api/processes/{zolca_filename}/{process_id}")
async def get_process_details_from_zolca(zolca_filename: str, process_id: str):
    """Fetches the precise LCI exchanges for a given process from the source SQLite."""
    if fetch_detailed_process is None:
        raise HTTPException(status_code=501, detail="Bridge parser not available")
    details = fetch_detailed_process(zolca_filename, process_id)
    if not details or "error" in details:
        raise HTTPException(
            status_code=404, 
            detail=details.get("error", f"Process {process_id} not found in {zolca_filename}")
        )
    return details

# --- Parameter Endpoints ---

@app.get("/api/parameters/definitions")
async def get_parameter_definitions(processId: Optional[int] = None):
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
async def calculate_lcia_endpoint(payload: LCIAComputePayload):
    """Upgraded LCIA Engine: Handles Pydantic validation, unlimited nodes, and Monte Carlo."""
    db = SessionLocal()
    try:
        all_procs = db.query(DBProcess).all()
        impact_cols = IMPACT_CATEGORIES
        db_data = [{col: getattr(p, col) for col in impact_cols} | {"name": p.process_name, "location": p.location} for p in all_procs]
            
        engine = LCAEngine(db_processes=db_data)
        
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

@app.get("/api/process/{process_id}")
async def get_process_detail(process_id: int, scale: float = 1.0):
    db = SessionLocal()
    try:
        process = db.query(DBProcess).filter(DBProcess.id == process_id).first()
        if not process:
            raise HTTPException(status_code=404, detail="Process not found")
        
        exchanges = db.query(LCAExchange).filter(LCAExchange.process_id == process_id).all()
        
        scaled_exchanges = [
            {"input": ex.flow_name, "amount": ex.amount * scale, "unit": ex.unit, "impact_factor": 1.0} 
            for ex in exchanges
        ]
        
        return {"id": process.id, "name": process.process_name, "exchanges": scaled_exchanges}
    finally:
        db.close()

@app.get("/api/process/{process_id}/csv")
async def download_process_csv(process_id: int, scale: float = 1.0):
    db = SessionLocal()
    process = db.query(DBProcess).filter(DBProcess.id == process_id).first()
    exchanges = db.query(LCAExchange).filter(LCAExchange.process_id == process_id).all()
    db.close()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Node", "Exchange", "Amount", "Unit"])
    for ex in exchanges:
        writer.writerow([process.process_name, ex.flow_name, ex.amount * scale, ex.unit])
    
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=process_{process_id}.csv"})


@app.get("/api/process/{process_id}/parameters")
async def get_process_parameters_legacy(process_id: int):
    """Legacy Support for Phase 1-10 Frontend."""
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
    """The Shuffle Engine (Fixed for updated DB schema)."""
    benchmarks = ["Granulate", "PET Bottle", "Aluminum", "Electricity"]
    import random
    selected_name = random.choice(benchmarks)
    
    db = SessionLocal()
    try:
        process = db.query(DBProcess).filter(DBProcess.process_name.ilike(f"%{selected_name}%")).first()
        if not process:
            process = db.query(DBProcess).first()
            if not process: raise HTTPException(status_code=404, detail="No processes found.")

        impact_cols = IMPACT_CATEGORIES
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
    logger.debug("/api/generate-pdf received!")
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
            "system_boundary": payload.get("systemBoundary", "gate-to-gate"),
            "node_count": len(nodes),
            "edge_count": len(edges),
            "snapshot": snapshot,
            "is_ai_predicted": lcia_results.get("is_ai_predicted", False),
            "node_breakdown": lcia_results.get("node_breakdown", {}),
            "has_uncharacterized_flows": lcia_results.get("has_uncharacterized_flows", False),
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
async def search_processes(q: str = "", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(DBProcess).filter(
        (DBProcess.is_library == True) | (DBProcess.workspace_id == current_user.organization_id)
    )
    if q:
        query = query.filter(DBProcess.process_name.ilike(f"%{q}%"))
    
    results = query.limit(50).all()
    return [{"id": r.id, "name": r.process_name, "location": r.location, "unit": r.unit, "is_library": r.is_library} for r in results]

@app.post("/api/upload-database")
async def upload_database(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """SaaS Cloud Migration: Uploads and parses processes into Workspace-specific Library."""
    temp_file_path = None
    try:
        # 1. Upload to Cloud Storage (S3) if available
        s3_url = None
        if s3_manager:
            file_key = f"uploads/{current_user.organization_id}/{datetime.datetime.now().timestamp()}_{file.filename}"
            s3_url = s3_manager.upload_file(file.file, file_key)

        # 2. Local processing for parsing
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            file.file.seek(0)
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        result = parse_uploaded_file(temp_file_path)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        processes = result.get("processes", [])
        metadata = result.get("metadata", {})
        
        # Savepoint-based error isolation (Fix 1.5)
        success_count = 0
        conflict_count = 0
        conflict_log = []

        for p in processes:
            try:
                savepoint = db.begin_nested()
                
                new_proc = DBProcess(
                    process_name=p.get("name"),
                    unit=(p.get("exchanges") or [{}])[0].get("unit", "unit"),
                    location=p.get("location_code", "GLO"),
                    category=p.get("category"),
                    workspace_id=current_user.organization_id,
                    is_library=False,
                    technology=f"Source: {metadata.get('source_db')} | Cloud: {s3_url or 'local'}"
                )
                db.add(new_proc)
                db.flush()

                for ex in p.get("exchanges", []):
                    new_ex = LCAExchange(
                        process_id=new_proc.id,
                        flow_name=ex.get("name"),
                        amount=ex.get("amount", 0.0),
                        unit=ex.get("unit", "unit"),
                        flow_type=ex.get("flow_type", "input").lower(),
                        is_parameter='%' in str(ex.get("name", "")),
                        uncertainty_type="lognormal" if ex.get("is_elementary") else "none",
                        allocation_factor=ex.get("allocation_factor", 1.0),
                    )
                    db.add(new_ex)

                savepoint.commit()
                success_count += 1

            except Exception as e:
                savepoint.rollback()
                conflict_count += 1
                conflict_log.append({"process": p.get("name"), "error": str(e)})
                logger.warning(f"Skipped process '{p.get('name')}': {e}")

        db.commit()
        return {
            "status": "success", 
            "inserted": success_count,
            "conflicts": conflict_count,
            "conflict_log": conflict_log[:10],  # Return first 10 conflicts
            "cloud_url": s3_url,
            "source": metadata.get("source_db")
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

# ============================================================================
# 3D PRINT ANALYZER (STL → LCA pipeline)
# ============================================================================

# Material properties database (density kg/m³, carbon intensity kg CO2/kg)
MATERIAL_DB = {
    "PLA":       {"density": 1240, "gwp_kg": 2.7,  "name": "Polylactic Acid"},
    "ABS":       {"density": 1050, "gwp_kg": 3.5,  "name": "ABS Plastic"},
    "PETG":      {"density": 1270, "gwp_kg": 2.5,  "name": "PETG"},
    "Nylon":     {"density": 1140, "gwp_kg": 7.0,  "name": "Nylon PA12"},
    "TPU":       {"density": 1210, "gwp_kg": 4.2,  "name": "TPU Flex"},
    "Ti6Al4V":   {"density": 4430, "gwp_kg": 40.0, "name": "Titanium Alloy"},
    "SS316L":    {"density": 7990, "gwp_kg": 6.15, "name": "Stainless Steel"},
    "AlSi10Mg":  {"density": 2670, "gwp_kg": 11.5, "name": "Aluminum Alloy"},
    "Inconel625": {"density": 8440, "gwp_kg": 18.0, "name": "Inconel 625"},
}

# Machine database (power_kW, build_speed_cm3_per_hr, name)
MACHINE_DB = {
    "FDM_desktop":   {"power_kW": 0.25, "speed_cm3_hr": 15,  "name": "FDM Desktop"},
    "FDM_industrial": {"power_kW": 1.2,  "speed_cm3_hr": 50,  "name": "FDM Industrial"},
    "SLA":           {"power_kW": 0.15, "speed_cm3_hr": 20,  "name": "SLA Resin"},
    "SLS":           {"power_kW": 3.5,  "speed_cm3_hr": 30,  "name": "SLS Powder Bed"},
    "DMLS":          {"power_kW": 4.0,  "speed_cm3_hr": 5,   "name": "DMLS Metal"},
    "EBM":           {"power_kW": 6.0,  "speed_cm3_hr": 8,   "name": "EBM Metal"},
    "Binder_Jetting": {"power_kW": 2.0, "speed_cm3_hr": 100, "name": "Binder Jetting"},
}

# Grid carbon intensity (kg CO2/kWh)
GRID_DB = {
    "India":       0.82,
    "China":       0.68,
    "US_East":     0.45,
    "US_West":     0.28,
    "EU_Average":  0.30,
    "EU_Nordic":   0.05,
    "Australia":   0.73,
    "Global_Avg":  0.49,
}

def _parse_stl_geometry(stl_path: str) -> Dict[str, float]:
    """
    Parse binary or ASCII STL to extract bounding box volume, surface area,
    and a simple overhang ratio heuristic (fraction of downward-facing triangles).
    """
    try:
        # Try numpy-stl first (fast, handles binary)
        try:
            from stl import mesh as stl_mesh
            m = stl_mesh.Mesh.from_file(stl_path)
            mins = m.vectors.min(axis=(0,1))
            maxs = m.vectors.max(axis=(0,1))
            dims_mm = maxs - mins
            bbox_volume_cm3 = float(np.prod(dims_mm / 10))  # mm³ → cm³

            def triangle_area(tri):
                a, b = tri[1] - tri[0], tri[2] - tri[0]
                return 0.5 * np.linalg.norm(np.cross(a, b))
            surface_area_cm2 = float(sum(triangle_area(t) for t in m.vectors) / 100)

            normals = m.normals
            downward = np.sum(normals[:, 2] < -0.5)
            overhang_ratio = float(downward / max(len(normals), 1))
            part_volume_cm3 = bbox_volume_cm3 * 0.4
            return {
                "bbox_volume_cm3": bbox_volume_cm3,
                "part_volume_cm3": part_volume_cm3,
                "surface_area_cm2": surface_area_cm2,
                "overhang_ratio": overhang_ratio,
                "triangle_count": len(m.vectors),
                "dims_mm": dims_mm.tolist(),
            }
        except ImportError:
            pass

        # Fallback: pure-python binary STL reader
        import struct
        with open(stl_path, "rb") as f:
            f.read(80)  # skip header
            tri_count = struct.unpack('<I', f.read(4))[0]
            normals_z = []
            all_verts = []
            for _ in range(tri_count):
                nx, ny, nz = struct.unpack('<fff', f.read(12))
                normals_z.append(nz)
                for _ in range(3):
                    vx, vy, vz = struct.unpack('<fff', f.read(12))
                    all_verts.append((vx, vy, vz))
                f.read(2)  # attr

        if all_verts:
            verts = np.array(all_verts)
            mins = verts.min(axis=0)
            maxs = verts.max(axis=0)
            dims_mm = maxs - mins
            bbox_volume_cm3 = float(np.prod(dims_mm / 10))
            downward = sum(1 for nz in normals_z if nz < -0.5)
            overhang_ratio = downward / max(tri_count, 1)
        else:
            bbox_volume_cm3 = max(1.0, tri_count * 0.001)
            dims_mm = [10.0, 10.0, 10.0]
            overhang_ratio = 0.15

        return {
            "bbox_volume_cm3": bbox_volume_cm3,
            "part_volume_cm3": bbox_volume_cm3 * 0.4,
            "surface_area_cm2": bbox_volume_cm3 * 0.6,
            "overhang_ratio": overhang_ratio,
            "triangle_count": tri_count,
            "dims_mm": list(dims_mm) if hasattr(dims_mm, '__iter__') else [10, 10, 10],
        }
    except Exception as e:
        logger.error(f"STL parsing failed: {e}")
        raise HTTPException(status_code=422, detail=f"Could not parse STL file: {e}")


@app.post("/api/analyze-stl")
async def analyze_stl(
    file: UploadFile = File(...),
    material: str = Form("PLA"),
    machine: str = Form("FDM_desktop"),
    energy_grid: str = Form("Global_Avg"),
    infill_percent: float = Form(20.0),
    support_enabled: bool = Form(True),
):
    """
    Full AM LCA pipeline:
    1. Parse STL geometry (bounding box, surface area, overhang ratio)
    2. Estimate part mass and support waste
    3. Calculate energy consumption from machine specs
    4. Apply grid carbon intensity
    5. Return IDEF0 node/edge payload + full LCA results
    """
    if material not in MATERIAL_DB:
        raise HTTPException(status_code=400, detail=f"Unknown material. Choose from: {list(MATERIAL_DB)}")
    if machine not in MACHINE_DB:
        raise HTTPException(status_code=400, detail=f"Unknown machine. Choose from: {list(MACHINE_DB)}")
    if energy_grid not in GRID_DB:
        raise HTTPException(status_code=400, detail=f"Unknown grid. Choose from: {list(GRID_DB)}")

    suffix = os.path.splitext(file.filename)[1].lower()
    if suffix not in (".stl",):
        raise HTTPException(status_code=400, detail="Only .stl files are accepted.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".stl") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        geo = _parse_stl_geometry(tmp_path)

        mat = MATERIAL_DB[material]
        mach = MACHINE_DB[machine]
        grid_intensity = GRID_DB[energy_grid]

        infill_fraction = min(max(infill_percent / 100.0, 0.05), 1.0)
        part_volume_cm3 = geo["bbox_volume_cm3"] * infill_fraction
        part_mass_kg = (part_volume_cm3 / 1000.0) * (mat["density"] / 1000.0)

        support_mass_kg = 0.0
        if support_enabled:
            support_volume_fraction = geo["overhang_ratio"] * 0.3
            support_mass_kg = part_mass_kg * support_volume_fraction

        total_material_kg = part_mass_kg + support_mass_kg

        build_time_hr = geo["bbox_volume_cm3"] / max(mach["speed_cm3_hr"], 0.1)
        energy_kwh = build_time_hr * mach["power_kW"]
        energy_kwh_total = energy_kwh * 1.15

        gwp_material = total_material_kg * mat["gwp_kg"]
        gwp_energy = energy_kwh_total * grid_intensity
        gwp_transport = total_material_kg * 0.001 * 100 * 0.062
        eol_factor = 0.05 if material in ("Ti6Al4V", "SS316L", "AlSi10Mg", "Inconel625") else 0.08
        gwp_eol = total_material_kg * mat["gwp_kg"] * eol_factor
        gwp_total = gwp_material + gwp_energy + gwp_transport + gwp_eol

        nodes = [
            {
                "id": "n1", "type": "lcaNode",
                "position": {"x": 80, "y": 200},
                "data": {
                    "processName": f"Raw Material — {mat['name']}",
                    "module": "A1", "gwp": round(gwp_material, 4),
                    "detail": f"{total_material_kg:.3f} kg @ {mat['gwp_kg']} kg CO₂/kg",
                    "tag": "Material Production"
                }
            },
            {
                "id": "n2", "type": "lcaNode",
                "position": {"x": 320, "y": 80},
                "data": {
                    "processName": f"Electricity — {energy_grid}",
                    "module": "A3", "gwp": round(gwp_energy, 4),
                    "detail": f"{energy_kwh_total:.2f} kWh @ {grid_intensity} kg CO₂/kWh",
                    "tag": "Energy Input"
                }
            },
            {
                "id": "n3", "type": "lcaNode",
                "position": {"x": 320, "y": 200},
                "data": {
                    "processName": f"3D Printing — {mach['name']}",
                    "module": "A3", "gwp": round(gwp_material + gwp_energy, 4),
                    "detail": f"Build time: {build_time_hr:.2f} hr | Infill: {infill_percent}%",
                    "tag": "Manufacturing"
                }
            },
            {
                "id": "n4", "type": "lcaNode",
                "position": {"x": 560, "y": 200},
                "data": {
                    "processName": "Transport & Distribution",
                    "module": "A4", "gwp": round(gwp_transport, 4),
                    "detail": "100 km average transport distance",
                    "tag": "Logistics"
                }
            },
            {
                "id": "n5", "type": "lcaNode",
                "position": {"x": 800, "y": 200},
                "data": {
                    "processName": "End of Life / Waste",
                    "module": "C3", "gwp": round(gwp_eol, 4),
                    "detail": f"Disposal factor: {eol_factor*100:.0f}% of material GWP",
                    "tag": "EoL"
                }
            },
        ]

        if support_mass_kg > 0:
            nodes.append({
                "id": "n6", "type": "lcaNode",
                "position": {"x": 320, "y": 340},
                "data": {
                    "processName": "Support Structure Waste",
                    "module": "A3", "gwp": round(support_mass_kg * mat["gwp_kg"], 4),
                    "detail": f"{support_mass_kg:.3f} kg wasted support material",
                    "tag": "Waste"
                }
            })

        edges = [
            {"id": "e1-3", "source": "n1", "target": "n3", "sourceHandle": "right", "targetHandle": "left"},
            {"id": "e2-3", "source": "n2", "target": "n3", "sourceHandle": "bottom", "targetHandle": "top"},
            {"id": "e3-4", "source": "n3", "target": "n4", "sourceHandle": "right", "targetHandle": "left"},
            {"id": "e4-5", "source": "n4", "target": "n5", "sourceHandle": "right", "targetHandle": "left"},
        ]
        if support_mass_kg > 0:
            edges.append({"id": "e6-3", "source": "n6", "target": "n3", "sourceHandle": "top", "targetHandle": "bottom"})

        return {
            "status": "success",
            "geometry": geo,
            "inputs": {
                "material": material, "machine": machine,
                "energy_grid": energy_grid, "infill_percent": infill_percent,
            },
            "results": {
                "part_mass_kg":        round(part_mass_kg, 4),
                "support_mass_kg":     round(support_mass_kg, 4),
                "total_material_kg":   round(total_material_kg, 4),
                "energy_kwh":          round(energy_kwh_total, 3),
                "build_time_hr":       round(build_time_hr, 3),
                "gwp_material_kg_co2": round(gwp_material, 4),
                "gwp_energy_kg_co2":   round(gwp_energy, 4),
                "gwp_transport_kg_co2": round(gwp_transport, 4),
                "gwp_eol_kg_co2":      round(gwp_eol, 4),
                "gwp_total_kg_co2":    round(gwp_total, 4),
                "hotspot": max(
                    [("Material", gwp_material), ("Energy", gwp_energy),
                     ("Transport", gwp_transport), ("EoL", gwp_eol)],
                    key=lambda x: x[1]
                )[0],
            },
            "canvas": {"nodes": nodes, "edges": edges},
            "manufacturability_score": round(
                10.0 - (geo["overhang_ratio"] * 5) - (min(build_time_hr, 10) * 0.3), 2
            ),
        }
    finally:
        os.unlink(tmp_path)


# ============================================================================
# SENSITIVITY ANALYSIS
# ============================================================================

@app.post("/api/sensitivity-analysis")
async def sensitivity_analysis(payload: LCIAComputePayload):
    """
    One-at-a-time (OAT) sensitivity analysis per ISO 14044 §4.4.3.
    Varies each parameter by ±10% and reports the % change in GWP.
    Returns parameters ranked by influence.
    """
    db = SessionLocal()
    try:
        all_procs = db.query(DBProcess).all()
        db_data = [
            {col: getattr(p, col) for col in IMPACT_CATEGORIES}
            | {"name": p.process_name, "location": p.location}
            for p in all_procs
        ]
    finally:
        db.close()

    engine = LCAEngine(db_processes=db_data)
    nodes = [n.dict() for n in payload.nodes]
    edges = [e.dict() for e in payload.edges]

    # Baseline run
    baseline = engine.calculate_supply_chain(nodes, edges, iterations=1)
    baseline_gwp = baseline["impacts"].get("gwp_climate_change", 0.0)
    if baseline_gwp == 0.0:
        raise HTTPException(status_code=400, detail="Baseline GWP is zero; cannot compute sensitivity.")

    sensitivity_results = []
    PERTURBATION = 0.10  # 10%

    for node in nodes:
        node_data = node.get("data", {})
        exchanges = node_data.get("exchanges", [])

        for ex in exchanges:
            flow = ex.get("flow_name", "unknown")
            base_val = float(ex.get("amount", 0))
            if base_val == 0:
                continue

            for direction, multiplier in [("+10%", 1 + PERTURBATION), ("-10%", 1 - PERTURBATION)]:
                test_nodes = copy.deepcopy(nodes)
                for tn in test_nodes:
                    if tn["id"] == node["id"]:
                        for tex in tn["data"].get("exchanges", []):
                            if tex.get("flow_name") == flow:
                                tex["amount"] = base_val * multiplier
                result = engine.calculate_supply_chain(test_nodes, edges, iterations=1)
                result_gwp = result["impacts"].get("gwp_climate_change", 0.0)
                pct_change = ((result_gwp - baseline_gwp) / baseline_gwp) * 100

                sensitivity_results.append({
                    "parameter": f"{node_data.get('processName','?')} → {flow}",
                    "node_id": node["id"],
                    "flow": flow,
                    "perturbation": direction,
                    "base_value": base_val,
                    "perturbed_value": round(base_val * multiplier, 6),
                    "gwp_change_pct": round(pct_change, 3),
                    "abs_gwp_change": round(result_gwp - baseline_gwp, 6),
                })

    # Sort by absolute influence
    flow_influence = {}
    for r in sensitivity_results:
        key = r["parameter"]
        flow_influence.setdefault(key, []).append(abs(r["gwp_change_pct"]))

    ranked = sorted(
        [{"parameter": k, "avg_influence_pct": sum(v)/len(v)} for k, v in flow_influence.items()],
        key=lambda x: x["avg_influence_pct"],
        reverse=True
    )

    return {
        "baseline_gwp": baseline_gwp,
        "perturbation_pct": PERTURBATION * 100,
        "ranked_parameters": ranked,
        "full_results": sensitivity_results,
    }


# ============================================================================
# SCENARIO COMPARISON
# ============================================================================

class ScenarioComparePayload(BaseModel):
    scenarios: List[Dict[str, Any]]  # List of {name, nodes, edges}
    iterations: Optional[int] = 1

@app.post("/api/compare-scenarios")
async def compare_scenarios(payload: ScenarioComparePayload):
    """
    Run multiple named scenarios through the LCIA engine in one call.
    Returns all impact categories for each scenario, plus a delta analysis.
    """
    if len(payload.scenarios) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 scenarios to compare.")
    if len(payload.scenarios) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 scenarios per comparison.")

    db = SessionLocal()
    try:
        all_procs = db.query(DBProcess).all()
        db_data = [
            {col: getattr(p, col) for col in IMPACT_CATEGORIES}
            | {"name": p.process_name, "location": p.location}
            for p in all_procs
        ]
    finally:
        db.close()

    results = []
    for scenario in payload.scenarios:
        engine = LCAEngine(db_processes=db_data)
        s_nodes = scenario.get("nodes", [])
        s_edges = scenario.get("edges", [])
        result = engine.calculate_supply_chain(s_nodes, s_edges, iterations=payload.iterations)
        results.append({
            "name": scenario.get("name", f"Scenario {len(results)+1}"),
            "impacts": result["impacts"],
            "gwp": result["gwp"],
            "uncertainty": result.get("uncertainty"),
            "is_ai_predicted": result.get("is_ai_predicted", False),
        })

    # Delta analysis: compare every scenario against scenario[0] (baseline)
    baseline_impacts = results[0]["impacts"]
    for res in results[1:]:
        delta = {}
        for cat in IMPACT_CATEGORIES:
            base_val = baseline_impacts.get(cat, 0.0) or 0.0
            curr_val = res["impacts"].get(cat, 0.0) or 0.0
            delta[cat] = {
                "absolute": round(curr_val - base_val, 8),
                "relative_pct": round(((curr_val - base_val) / base_val * 100) if base_val != 0 else 0, 2),
            }
        res["delta_vs_baseline"] = delta

    return {
        "baseline_name": results[0]["name"],
        "scenarios": results,
        "impact_categories": IMPACT_CATEGORIES,
    }


# ============================================================================
# CORE LCA MATRIX ENGINE (Legacy)
# ============================================================================

@app.post("/api/calculate-lca")
def run_lca_calculation(payload: LCIAComputePayload):
    """Core LCA Graph Traversal Engine Endpoint."""
    if calculate_lca is None:
        raise HTTPException(status_code=501, detail="Core matrix engine not available")
    try:
        nodes_dict = [n.dict() for n in payload.nodes]
        edges_dict = [e.dict() for e in payload.edges]
        
        results = calculate_lca(nodes_dict, edges_dict, lcia_method_id=payload.lcia_method_id)
        
        if results and "error" in results:
            raise HTTPException(status_code=400, detail=results["error"])
            
        return results
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        logger.error("LCA Calculation Crash Event:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

def _sync_search(q_lower: str):
    matches = []
    for row in ZOLCA_CACHE:
        if q_lower in row["search_key"]:
            matches.append({
                "flow_id": row["flow_id"],
                "process_name": row["process_name"],
                "amount": row["amount"],
                "type": row["type"],
                "geography": row.get("geography", "GLO"),
                "system_model": row.get("system_model", "Cut-off")
            })
            if len(matches) >= 50:
                break
    return matches

@app.post("/api/calculate-monte-carlo")
async def trigger_monte_carlo(payload: LCIAComputePayload, background_tasks: BackgroundTasks):
    """Decoupled Async Monte Carlo Trigger."""
    if perform_monte_carlo is None:
        raise HTTPException(status_code=501, detail="Monte Carlo engine not available")
    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "status": "processing",
        "progress": 0,
        "results": None,
        "error": None,
        "payload": payload
    }
    
    background_tasks.add_task(run_monte_carlo_task, task_id)
    return {"status": "accepted", "task_id": task_id}

@app.get("/api/tasks/{task_id}")
async def get_task_status(task_id: str):
    """Poll for background task completeness."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

def run_monte_carlo_task(task_id: str):
    """Background worker for stochastic ICA resolution."""
    try:
        task_data = tasks[task_id]
        payload = task_data["payload"]
        nodes = [n.dict() for n in payload.nodes]
        edges = [e.dict() for e in payload.edges]
        iterations = max(10, min(payload.iterations, 1000))
        
        mc_results = perform_monte_carlo(
            nodes=nodes, 
            edges=edges, 
            iterations=iterations, 
            lcia_method_id=payload.lcia_method_id
        )

        if "error" in mc_results:
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = mc_results["error"]
        else:
            tasks[task_id].update({
                "status": "completed",
                "progress": 100,
                "results": mc_results
            })
    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)

@app.get("/api/search-db")
async def search_local_database(query: str):
    """Hooks directly into the in-memory Python dictionaries."""
    global ZOLCA_CACHE
    if not ZOLCA_CACHE:
        return {"process_name": query, "exchanges": [], "source": "needs_18.zolca (Empty/Failed)"}

    q_lower = query.lower()
    matches = await asyncio.to_thread(_sync_search, q_lower)
        
    return {"process_name": query, "exchanges": matches, "source": "needs_18.zolca [MEMORY THREADED CACHE]"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
