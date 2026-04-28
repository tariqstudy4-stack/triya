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

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Response, BackgroundTasks, Header
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
try:
    from fpdf import FPDF
except ImportError:
    FPDF = None  # type: ignore
from datetime import datetime
from scipy import stats
from sqlalchemy.orm import Session
from fastapi import Depends
import re

# Local imports
from core.reporter import JRCReporter
from models import SessionLocal, LciDatabaseModel, ProjectModel, DBProcess, DBMethod, DBMethodFactor, DBExchange, init_db
from core.engine import calculate_lca, perform_monte_carlo, SCOPE3_CATEGORIES
from core.spatial_engine import spatial_engine
from utils.lca_engine import LCAEngine, IMPACT_CATEGORIES
from utils.lca_parser import parse_uploaded_file
from utils.am_engine import AdditiveManufacturingEngine
from utils.ai_audit import ExecutiveCSOConsultant
from utils.db_manager import scan_local_databases, get_ingested_nodes, search_ingested_nodes, get_node_by_id
from utils.canvas_sanitize import prepare_lcia_payload
from services.golden_templates import get_golden_templates, add_custom_template

# Initialize Local Persistence
init_db()  # Standard SQLAlchemy initialization


from schemas import (
    CalculationRequestSchema, SensitivityRequestSchema, ModelSavePayload, ParameterSchema, 
    GoalAndScopeSchema, ProjectSchema, UncertaintySchema, NodeSchema, EdgeSchema
)

def _goal_scope_dump(gs: Optional[Any]) -> Optional[Dict[str, Any]]:
    if gs is None:
        return None
    if hasattr(gs, "model_dump"):
        return gs.model_dump()
    return gs.dict()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

# Global in-memory caches
uploaded_processes_cache = []
UPLOADED_DATABASE_METADATA = []

# Background Task Storage (for production, use Redis/Celery)
tasks = {}

# High-Performance Search Cache Placeholder
# (Legacy ZOLCA_CACHE removed for v1.0)

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

app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        proc_count = db.query(DBProcess).count()
        meth_count = db.query(DBMethod).count()
        logger.info("Persistence ready: processes=%s methods=%s", proc_count, meth_count)
    finally:
        db.close()

reporter = JRCReporter()

@app.get("/")
async def root():
    return {"status": "Triya.io Industrial Matrix Engine is Online", "version": "1.0-OSS"}

@app.get("/api/health")
async def health_check():
    """Diagnostic endpoint for UI connection verification."""
    return {"status": "OK", "timestamp": datetime.now().isoformat()}

# --- Open Source Project Management ---

@app.get("/api/projects")
async def list_projects(db: Session = Depends(get_db)):
    """Lists all projects from local SQLite persistence."""
    return db.query(ProjectModel).all()

@app.get("/api/projects/{project_id}")
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Fetches a specific project by ID."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.post("/api/projects")
async def create_project(project: Dict[str, Any], db: Session = Depends(get_db)):
    """Creates a new project record in the local database."""
    new_project = ProjectModel(
        name=project.get("name", "Untitled Project"),
        nodes_json=json.dumps(project.get("nodes", [])),
        edges_json=json.dumps(project.get("edges", [])),
        goal_scope_json=json.dumps(project.get("goalAndScope", {}))
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@app.post("/api/save-state")
async def save_project_state(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Full snapshot of the current canvas state."""
    project_id = payload.get("id")
    if project_id:
        project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if project:
            project.nodes_json = json.dumps(payload.get("nodes", []))
            project.edges_json = json.dumps(payload.get("edges", []))
            project.goal_scope_json = json.dumps(payload.get("goalAndScope", {}))
            db.commit()
            return {"status": "updated", "id": project_id}
    
    # Create new if no ID or ID not found
    new_project = ProjectModel(
        name=payload.get("name", f"Snapshot {datetime.now().strftime('%H:%M')}"),
        nodes_json=json.dumps(payload.get("nodes", [])),
        edges_json=json.dumps(payload.get("edges", [])),
        goal_scope_json=json.dumps(payload.get("goalAndScope", {}))
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return {"status": "created", "id": new_project.id}

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

# --- Calculation Engine ---

@app.post("/api/calculate-lcia")
async def calculate_lcia_endpoint(payload: CalculationRequestSchema):
    """Upgraded LCIA Engine: Handles Pydantic validation, unlimited nodes, and Monte Carlo."""
    if not payload.nodes:
        # Zero-Node Canvas Guard: Return zeroed mock payload to prevent solver crash
        return {
            "gwp": 0.0,
            "impacts": {cat: 0.0 for cat in IMPACT_CATEGORIES},
            "uncertainty": None,
            "node_breakdown": {},
            "is_ai_predicted": False,
            "iterations": payload.iterations,
            "has_uncharacterized_flows": False,
            "deep_interpretation": {
                "narrative": "No processes on the canvas.",
                "advice": "Add at least one process node and technosphere exchanges.",
                "benchmarks": {},
                "hotspots": [],
            },
        }

    db = SessionLocal()
    try:
        nodes, edges = prepare_lcia_payload(payload.nodes, payload.edges)
        engine = LCAEngine(db_session=db)

        results = engine.calculate_supply_chain(
            nodes,
            edges,
            iterations=payload.iterations or 1,
            global_params=_goal_scope_dump(payload.goalAndScope),
        )

        interpretation = engine.generate_interpretation(results)
        results["deep_interpretation"] = interpretation

        return results
    except Exception as e:
        logger.exception("calculate-lcia failed")
        raise HTTPException(
            status_code=422,
            detail=str(e) or "LCIA calculation failed; check node data, formulas, and edges.",
        )
    finally:
        db.close()


@app.post("/api/sensitivity")
async def calculate_sensitivity_endpoint(payload: SensitivityRequestSchema):
    """
    Strategic Sensitivity Gateway:
    Triggers triple-solve logic (Baseline, Low, High) on a target supply chain node.
    """
    db = SessionLocal()
    try:
        engine = LCAEngine(db_session=db)
        
        # We convert DeepNodeSchema to dict to bridge to the calculation engine
        n_norm, e_norm = prepare_lcia_payload(payload.nodes, payload.edges)
        results = engine.calculate_sensitivity(
            n_norm,
            e_norm,
            payload.target_node_id,
            variance=payload.variance or 0.10,
        )
        
        return results
    finally:
        db.close()

@app.post("/api/ai-audit")
async def ai_audit_endpoint(
    payload: dict, 
    x_ai_engine: Optional[str] = Header(None, alias="X-AI-Engine"),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
):
    """
    Executive AI Interpretation Gateway:
    Supports Local (Ollama) and Cloud (BYOK Gemini) interpreted audits.
    """
    engine_type = x_ai_engine or "gemini"
    api_key = x_api_key or os.environ.get("GOOGLE_GEMINI_API_KEY", "YOUR_API_KEY")

    try:
        engine = ExecutiveCSOConsultant(engine=engine_type, api_key=api_key)
        verdict = engine.generate_executive_verdict(payload)
        return {"verdict": verdict}
    except ConnectionRefusedError:
        raise HTTPException(status_code=503, detail="Ollama is not running locally on port 11434.")
    except Exception as e:
        logger.error(f"AI Audit Gateway Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-3d")
async def analyze_3d_geometry(
    file: UploadFile = File(...),
    material: str = Form("PLA"),
    infill_percentage: float = Form(20.0),
    machine_type: str = Form("FDM_desktop"),
    region: str = Form("Global_Avg")
):
    """
    3D API Gateway:
    Analyzes an STL file using the AdditiveManufacturingEngine to generate LCI exchanges.
    """
    am_engine = AdditiveManufacturingEngine()
    
    # Trace log for audit
    logger.info(f"[E2E TRACER] AM_Pri Engine processing STL: {file.filename} (Mat: {material}, Machine: {machine_type})")
    
    # Save the file temporarily
    temp_dir = os.path.join(backend_dir, "data", "upload_storage", "temp")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{file.filename}")
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyze using engine
        analysis_result = am_engine.calculate_lci(
            temp_path, 
            material, 
            infill_percentage, 
            machine_type
        )
        
        if analysis_result.get("status") == "error":
            raise HTTPException(status_code=422, detail=analysis_result.get("message"))
            
        return analysis_result
        
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/sync-local-library")
async def sync_local_library(db: Session = Depends(get_db)):
    """
    Industrial Repository Sync:
    Scans the local filesystem and populates the SQLite cache for the canvas.
    """
    _repo_root = os.path.abspath(os.path.join(backend_dir, "..", ".."))
    local_dir = os.environ.get(
        "LOCAL_DATABASE_DIR",
        os.path.join(_repo_root, "Database_Triya", "data_bases"),
    )
    
    if not os.path.exists(local_dir):
        logger.error(f"Sync failed: {local_dir} NOT FOUND.")
        return {"status": "error", "message": f"Local repository {local_dir} not found."}

    files_to_sync = [f for f in os.listdir(local_dir) if f.endswith(('.json', '.zolca', '.zip'))]
    logger.info(f"Syncing {len(files_to_sync)} files from {local_dir}...")

    total_ingested = 0

    for filename in files_to_sync:
        file_path = os.path.join(local_dir, filename)
        db_id = str(uuid.uuid4())
        
        try:
            result = parse_uploaded_file(file_path)
            processes = result.get("processes", [])
            
            if not processes:
                logger.warning(f"Skipped {filename}: No valid processes found.")
                continue

            # Register Metadata
            new_meta = LciDatabaseModel(
                id=db_id,
                name=filename,
                format=result.get("metadata", {}).get("source_db", "Industrial"),
                size=f"{os.path.getsize(file_path) / 1024 / 1024:.1f} MB",
                entities_count=len(processes),
                storage_path=file_path,
            )
            db.add(new_meta)
            
            p_count = 0
            for p in processes:
                exists = db.query(DBProcess).filter(
                    DBProcess.process_name == p.get("name"),
                    DBProcess.location == p.get("location_code", "GLO")
                ).first()
                
                if not exists:
                    new_proc = DBProcess(
                        database_id=db_id,
                        process_name=p.get("name"),
                        unit=(p.get("exchanges") or [{}])[0].get("unit", "unit"),
                        location=p.get("location_code", "GLO"),
                        category=p.get("category"),
                        is_library=True,
                        parameters_json=p.get("parameters", {}) # NEW
                    )
                    db.add(new_proc)
                    db.flush()
                    
                    for ex in p.get("exchanges", []):
                        db.add(DBExchange(
                            process_id=new_proc.id,
                            flow_name=ex.get("name") or ex.get("flow_name"),
                            amount=ex.get("amount", 0.0),
                            unit=ex.get("unit", "unit"),
                            is_input=ex.get("flow_type") == "Input" or ex.get("is_input", True),
                            category=ex.get("category"),
                            formula=ex.get("formula") # NEW
                        ))
                    p_count += 1
            
            db.commit()
            total_ingested += p_count
            logger.info(f"Successfully ingested {p_count} processes from {filename}")
            
        except Exception as e:
            logger.error(f"Sync failed for {filename}: {e}")
            db.rollback()

    return {
        "status": "success",
        "ingested_count": total_ingested,
        "files_processed": len(files_to_sync)
    }

@app.get("/api/databases")
async def list_databases(db: Session = Depends(get_db)):
    """Return all ingested databases."""
    dbs = db.query(LciDatabaseModel).all()
    return [{
        "id": d.id,
        "name": d.name,
        "format": d.format,
        "size": d.size,
        "entities": d.entities_count,
        "created_at": d.created_at.strftime("%Y-%m-%d %H:%M:%S")
    } for d in dbs]

@app.get("/api/search-processes")
async def search_processes(q: str = "", db: Session = Depends(get_db)):
    """Unified search through SQLite Library with provider join."""
    query = f"%{q}%"
    
    # Efficient join to get provider name in one query
    results = db.query(DBProcess, LciDatabaseModel.name).outerjoin(
        LciDatabaseModel, DBProcess.database_id == LciDatabaseModel.id
    ).filter(
        (DBProcess.process_name.ilike(query)) | 
        (DBProcess.category.ilike(query))
    ).limit(100).all()
    
    return [
        {
            "id": str(p.id),
            "name": p.process_name,
            "category": p.category or "General",
            "location": p.location,
            "provider": provider_name or "Industrial LCI"
        } for p, provider_name in results
    ]

@app.delete("/api/databases/{db_id}")
async def delete_database(db_id: str, db: Session = Depends(get_db)):
    """Remove a database and all cascaded child records."""
    db_meta = db.query(LciDatabaseModel).filter(LciDatabaseModel.id == db_id).first()
    if not db_meta:
        raise HTTPException(status_code=404, detail="Database metadata not found")
    
    # Remove physical file if it exists
    if db_meta.storage_path and os.path.exists(db_meta.storage_path):
        try:
            os.remove(db_meta.storage_path)
        except Exception as e:
            logger.error(f"Failed to delete file {db_meta.storage_path}: {e}")

    # SQLAlchemy cascades (delete-orphan) will handle processes and exchanges
    db.delete(db_meta)
    db.commit()
    return {"status": "success", "message": f"Database {db_id} and all associated records removed."}

@app.post("/api/databases/{db_id}/sync")
async def sync_database_record(db_id: str, db: Session = Depends(get_db)):
    """Re-parse an existing database file to refresh parameters/formulas."""
    db_meta = db.query(LciDatabaseModel).filter(LciDatabaseModel.id == db_id).first()
    if not db_meta or not db_meta.storage_path or not os.path.exists(db_meta.storage_path):
        raise HTTPException(status_code=404, detail="Database file not found for sync")

    # Clear existing processes for this DB to re-ingest
    db.query(DBProcess).filter(DBProcess.database_id == db_id).delete()
    
    from utils.lca_parser import parse_uploaded_file
    result = parse_uploaded_file(db_meta.storage_path)
    processes = result.get("processes", [])
    
    for p in processes:
        new_proc = DBProcess(
            database_id=db_id,
            process_name=p.get("name", "Unnamed Process"),
            location=p.get("location_code") or "GLO",
            unit=p.get("unit") or "kg",
            category=p.get("category") or "General",
            parameters_json=p.get("parameters") or {}
        )
        db.add(new_proc)
        db.flush()
        
        for ex in p.get("exchanges", []):
            new_ex = DBExchange(
                process_id=new_proc.id,
                flow_name=ex.get("name") or ex.get("flow_name"),
                amount=float(ex.get("amount") or 0.0),
                unit=ex.get("unit") or "kg",
                is_input=(ex.get("flow_type") == "Input"),
                category=ex.get("category"),
                formula=ex.get("formula")
            )
            db.add(new_ex)
    
    db_meta.entities_count = len(processes)
    db.commit()
    return {"status": "success", "entities": len(processes)}

@app.post("/api/databases/purge-reset")
async def purge_reset_industrial_inventory(db: Session = Depends(get_db)):
    """Wipes all industrial LCI databases and performs a fresh sync from local storage."""
    try:
        # Step 1: Clean Slate
        db.query(DBExchange).delete()
        db.query(DBProcess).delete()
        db.query(DBMethodFactor).delete()
        db.query(DBMethod).delete()
        db.query(LciDatabaseModel).delete()
        db.commit()
        
        logger.info("Industrial LCI memory purged: Cold Restart initialized.")
        
        # Step 2: Fresh Deep Synchronous Ingestion
        return await sync_local_library(db)
        
    except Exception as e:
        db.rollback()
        logger.error(f"Strategic reset terminal failure: {e}")
        raise HTTPException(status_code=500, detail=f"Reset aborted: {str(e)}")

@app.get("/api/databases/ingest")
async def ingest_v1_gateway(db: Session = Depends(get_db)):
    """Legacy alias for local sync."""
    return await sync_local_library(db)

@app.get("/api/processes/{process_id}/full")
async def get_process_full_unified(process_id: str, db: Session = Depends(get_db)):
    """Unified Deep Fetch for Processes."""
    try:
        proc_id_int = int(process_id)
        process = db.query(DBProcess).filter(DBProcess.id == proc_id_int).first()
    except ValueError:
        process = db.query(DBProcess).filter(DBProcess.database_id == process_id).first()
    
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    exchanges = db.query(DBExchange).filter(DBExchange.process_id == process.id).all()
    inputs = []
    outputs = []
    emissions = []
    
    for ex in exchanges:
        f_data = {
            "id": str(ex.id), "name": ex.flow_name, "amount": ex.amount, "unit": ex.unit, 
            "category": ex.category,
            "formula": ex.formula # NEW: Pass formula to frontend
        }
        if ex.is_input: inputs.append(f_data)
        elif ex.category and "emission" in ex.category.lower(): emissions.append(f_data)
        else: outputs.append(f_data)

    return {
        "id": str(process.id),
        "label": process.process_name,
        "location": process.location,
        "category": process.category,
        "inputs": inputs,
        "outputs": outputs,
        "elementary_flows": emissions,
        "parameters": process.parameters_json or {}
    }

@app.post("/api/upload-database")
async def upload_database(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """User-triggered upload & ingestion."""
    try:
        db_id = str(uuid.uuid4())
        suffix = os.path.splitext(file.filename)[1]
        storage_path = os.path.join(backend_dir, "data", "upload_storage", f"{db_id}{suffix}")
        
        with open(storage_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = parse_uploaded_file(storage_path)
        processes = result.get("processes", [])
        
        if not processes:
            os.remove(storage_path)
            raise HTTPException(status_code=422, detail="No valid LCA processes found.")
        
        new_meta = LciDatabaseModel(
            id=db_id, name=file.filename, format=result.get("format", suffix.upper()),
            size=f"{os.path.getsize(storage_path) / 1024:.1f} KB",
            entities_count=len(processes), storage_path=storage_path
        )
        db.add(new_meta)

        for p in processes:
            new_proc = DBProcess(
                database_id=db_id, process_name=p.get("name"), location=p.get("location_code", "GLO"),
                category=p.get("category"), is_library=True,
                parameters_json=p.get("parameters", {}) # NEW
            )
            db.add(new_proc)
            db.flush() 
            for ex in p.get("exchanges", []):
                db.add(DBExchange(
                    process_id=new_proc.id, flow_name=ex.get("name") or ex.get("flow_name"),
                    amount=ex.get("amount", 0.0), unit=ex.get("unit", "kg"),
                    is_input=ex.get("is_input", True), category=ex.get("category"),
                    formula=ex.get("formula") # NEW
                ))
        db.commit()
        return {"id": db_id, "name": file.filename, "processes": len(processes), "status": "ACTIVE"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search-methods")
async def search_methods(q: str = "", db: Session = Depends(get_db)):
    methods = db.query(DBMethod).filter(DBMethod.method_name.ilike(f"%{q}%")).limit(50).all()
    return [
        {
            "id": str(m.id),
            "name": m.method_name,
            "category": m.category or "LCIA",
            "description": m.description,
            "provider": "Method Provider",
        }
        for m in methods
    ]


@app.get("/api/templates/golden")
async def fetch_golden_templates_endpoint():
    try:
        templates = get_golden_templates()
        return {"status": "success", "count": len(templates), "templates": templates}
    except Exception as e:
        logger.error("Golden template fetch failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/templates/promote")
async def promote_to_template_endpoint(payload: Dict[str, Any]):
    try:
        name = payload.get("name", f"Custom Use Case - {uuid.uuid4().hex[:4]}")
        data = {
            "nodes": payload.get("nodes", []),
            "edges": payload.get("edges", []),
            "goalAndScope": payload.get("goalAndScope", {}),
        }
        add_custom_template(name, data)
        return {"status": "success", "template_name": name}
    except Exception as e:
        logger.error("Promotion failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-pdf")
async def generate_pdf_report(payload: Dict[str, Any]):
    """Minimal compliance PDF (FPDF); extend with full PEF/ISO sections as needed."""
    if FPDF is None:
        raise HTTPException(
            status_code=501,
            detail="PDF engine not installed. Run: pip install fpdf2",
        )
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    fw = payload.get("complianceFramework") or "iso-14044"
    lcia = payload.get("lciaResults") or {}
    imp = lcia.get("impacts") or {}
    gwp = lcia.get("gwp")
    if gwp is None:
        gwp = imp.get("gwp_climate_change")
    lines = [
        "Triya.io - LCA report",
        f"Compliance framework: {fw}",
        "",
    ]
    if gwp is not None:
        lines.append(f"Climate change (GWP): {gwp} kg CO2-eq (indicator basis per model)")
    lines.append("")
    lines.append("Attach full inventory tables and verification in regulated submissions.")
    for line in lines:
        pdf.multi_cell(0, 8, str(line))
    raw = pdf.output(dest="S")
    body = raw if isinstance(raw, (bytes, bytearray)) else raw.encode("latin-1")
    return Response(
        content=body,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="triya-lca-report.pdf"'},
    )


@app.post("/api/analysis-summary")
async def get_analysis_summary(payload: CalculationRequestSchema):
    """Returns a strategic financial and environmental rollup for the project."""
    if calculate_lca is None:
        raise HTTPException(status_code=501, detail="LCA Engine not available")
        
    reg = "EU_CSRD"
    if payload.goalAndScope and getattr(payload.goalAndScope, "regulatoryFramework", None):
        reg = payload.goalAndScope.regulatoryFramework
    res = calculate_lca(
        nodes=list(payload.nodes),
        edges=list(payload.edges),
        regulation_id=reg,
    )
    
    metrics = res.get("metrics", {})
    return {
        "total_cost": metrics.get("total_cost", 0.0),
        "total_gwp": metrics.get("gwp_total", 0.0),
        "carbon_liability": metrics.get("carbon_liability", 0.0),
        "margin_projection": 22.4, # Mock for now until full ERP model is linked
        "risk_profile": "MODERATE",
        "regulation": metrics.get("regulation")
    }

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
async def sensitivity_analysis(payload: CalculationRequestSchema):
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
    nodes, edges = prepare_lcia_payload(payload.nodes, payload.edges)

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
        s_nodes, s_edges = prepare_lcia_payload(
            scenario.get("nodes", []), scenario.get("edges", [])
        )
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


@app.post("/api/calculate-monte-carlo")
async def trigger_monte_carlo(payload: CalculationRequestSchema, background_tasks: BackgroundTasks):
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
        nodes = list(payload.nodes)
        edges = list(payload.edges)
        iterations = max(10, min(payload.iterations or 100, 1000))
        
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
            # NEW: Generate Interpretation for Monte Carlo mean results
            db = SessionLocal()
            try:
                # Mock result structure for generator using MC mean
                engine = LCAEngine(db_session=db)
                mock_result = {
                    "impacts": {cat: mc_results["mean"] * 1.0 for cat in IMPACT_CATEGORIES}, # Simplification
                    "gwp": mc_results["mean"],
                    "node_breakdown": {} # Breakdown is currently deterministic-only in main API
                }
                interpretation = engine.generate_interpretation(mock_result)
                mc_results["deep_interpretation"] = interpretation
            finally:
                db.close()

            tasks[task_id].update({
                "status": "completed",
                "progress": 100,
                "results": mc_results
            })
    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)


# ============================================================================
# STUDY PACKAGE GENERATOR & VALIDATOR (Phase 4 / Phase 5)
# ============================================================================

from core.study_generator import StudyPackageGenerator
from utils.study_validator import StudyValidator

study_generator = StudyPackageGenerator()
study_validator = StudyValidator()


@app.post("/api/validate-study")
async def validate_study_endpoint(payload: Dict[str, Any]):
    """
    Runs the ISO 14044 compliance validator on the current study state.
    Returns a structured report with pass/fail checks and recommendations.
    """
    try:
        gs = payload.get("goalAndScope", {})
        nodes = payload.get("nodes", [])
        edges = payload.get("edges", [])
        lcia_results = payload.get("lciaResults")
        sensitivity = payload.get("sensitivityResults")
        framework = payload.get("complianceFramework", "iso-14044")

        report = study_validator.validate(
            goal_and_scope=gs,
            nodes=nodes,
            edges=edges,
            lcia_results=lcia_results,
            sensitivity_results=sensitivity,
            framework=framework
        )

        return report.to_dict()
    except Exception as e:
        logger.exception("Study validation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-study-package")
async def generate_study_package_endpoint(payload: Dict[str, Any]):
    """
    Generates a complete ISO 14044 LCA Study Package as a downloadable ZIP.
    Contains: Goal & Scope PDF, LCI Excel, LCIA Excel, LCIA Report PDF,
    Interpretation PDF, Data Quality PDF, Critical Review Checklist PDF, metadata.json.
    """
    try:
        gs = payload.get("goalAndScope", {})
        nodes = payload.get("nodes", [])
        edges = payload.get("edges", [])
        lcia_results = payload.get("lciaResults", {})
        sensitivity = payload.get("sensitivityResults")
        framework = payload.get("complianceFramework", "iso-14044")

        # Run validation first
        val_report = study_validator.validate(
            goal_and_scope=gs,
            nodes=nodes,
            edges=edges,
            lcia_results=lcia_results,
            sensitivity_results=sensitivity,
            framework=framework
        )

        # Generate the ZIP package
        zip_buffer = study_generator.generate_package(
            goal_and_scope=gs,
            nodes=nodes,
            edges=edges,
            lcia_results=lcia_results,
            validation_report=val_report.to_dict(),
            sensitivity_results=sensitivity,
            framework=framework
        )

        project_name = gs.get("projectTitle", "LCA_Study").replace(" ", "_")
        filename = f"Triya_{project_name}_Study_Package.zip"

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        logger.exception("Study package generation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/resolve-node")
async def resolve_node_endpoint(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Layered Node Resolution: Merges DB baseline (Layer 0) with user customizations (Layer 1)
    to produce computed output (Layer 2).
    
    Payload:
      processId: int — DB process ID (Layer 0 source)
      overrides: dict — User parameter/amount overrides (Layer 1)
      goalAndScope: dict — Global parameters for formula resolution
    
    Returns:
      Layer 2: Fully resolved exchanges with computed amounts, unit normalization,
      and characterized LCIA impacts per exchange.
    """
    try:
        process_id = payload.get("processId")
        overrides = payload.get("overrides", {})
        global_params = payload.get("goalAndScope", {})

        if not process_id:
            raise HTTPException(status_code=400, detail="processId is required")

        # ── Layer 0: Database Baseline ──
        process = db.query(DBProcess).filter(DBProcess.id == int(process_id)).first()
        if not process:
            raise HTTPException(status_code=404, detail=f"Process {process_id} not found")

        exchanges = db.query(DBExchange).filter(DBExchange.process_id == process.id).all()

        # Build parameter context from DB + overrides
        db_params = process.parameters_json or {}
        param_context = {**db_params, **overrides.get("parameters", {})}

        # Safe math evaluator for formula resolution
        from utils.lca_engine import SafeMathEvaluator
        evaluator = SafeMathEvaluator(param_context)

        resolved_exchanges = []
        for ex in exchanges:
            # ── Layer 1: User Customization ──
            override_key = str(ex.id)
            amount_override = overrides.get("amounts", {}).get(override_key)
            formula_override = overrides.get("formulas", {}).get(override_key)

            # Resolve amount: override > formula > database amount
            base_amount = float(ex.amount or 0)
            formula = formula_override or ex.formula

            if amount_override is not None:
                resolved_amount = float(amount_override)
                resolution_source = "user_override"
            elif formula:
                resolved_amount = evaluator.evaluate(formula, base_amount)
                resolution_source = "formula"
            else:
                resolved_amount = base_amount
                resolution_source = "database"

            # Uncertainty from override or database
            unc_override = overrides.get("uncertainty", {}).get(override_key)
            uncertainty = unc_override or (
                {"type": ex.uncertainty_type, "params": ex.uncertainty_params}
                if ex.uncertainty_type else None
            )

            resolved_exchanges.append({
                "id": str(ex.id),
                "name": ex.flow_name,
                "amount": resolved_amount,
                "base_amount": base_amount,
                "unit": ex.unit,
                "is_input": ex.is_input,
                "category": ex.category,
                "formula": formula,
                "allocation_factor": float(ex.allocation_factor or 1.0),
                "uncertainty": uncertainty,
                "resolution_source": resolution_source,
            })

        # ── Layer 2: Computed Output ──
        return {
            "id": str(process.id),
            "processName": process.process_name,
            "location": process.location,
            "category": process.category,
            "module": overrides.get("module", "A1-A3"),
            "parameters": param_context,
            "exchanges": resolved_exchanges,
            "layers": {
                "layer0_source": "database",
                "layer1_overrides": len([e for e in resolved_exchanges if e["resolution_source"] != "database"]),
                "layer2_total_exchanges": len(resolved_exchanges),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Node resolution failed")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    logger.info("Triya v1.0 Production Server Starting...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
