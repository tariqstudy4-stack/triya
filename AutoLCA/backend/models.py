from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
import os

# Database Configuration
DB_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'data', 'lca_data.db')}"

# Ensure data directory exists
os.makedirs(os.path.join(DB_DIR, "data"), exist_ok=True)
os.makedirs(os.path.join(DB_DIR, "data", "upload_storage"), exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- METADATA MODELS ---

class LciDatabaseModel(Base):
    """Stores metadata for uploaded LCI databases."""
    __tablename__ = "lci_databases_meta"
    
    id = Column(String, primary_key=True, index=True) # UUID
    name = Column(String, index=True)
    format = Column(String)
    size = Column(String)
    entities_count = Column(Integer)
    storage_path = Column(String) 
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ProjectModel(Base):
    """Stores project canvas state (nodes/edges)."""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Untitled Project")
    nodes_json = Column(Text) # JSON serialized nodes
    edges_json = Column(Text) # JSON serialized edges
    goal_scope_json = Column(Text) 
    last_modified = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# --- CORE SCIENTIFIC MODELS ---

class DBProcess(Base):
    """Aggregated LCI process data for matrix calculations."""
    __tablename__ = "processes"
    id = Column(Integer, primary_key=True, index=True)
    database_id = Column(String, ForeignKey("lci_databases_meta.id"), index=True)
    process_name = Column(String, index=True)
    location = Column(String, default="GLO")
    unit = Column(String, default="kg")
    category = Column(String)
    is_library = Column(Boolean, default=False)
    technology = Column(String)
    
    # Pre-calculated Impacts (for fast engine lookup)
    gwp_climate_change = Column(Float, default=0.0)
    odp_ozone_depletion = Column(Float, default=0.0)
    ap_acidification = Column(Float, default=0.0)
    ep_freshwater = Column(Float, default=0.0)
    ep_marine = Column(Float, default=0.0)
    ep_terrestrial = Column(Float, default=0.0)
    pocp_photochemical_ozone = Column(Float, default=0.0)
    pm_particulate_matter = Column(Float, default=0.0)
    ir_ionising_radiation = Column(Float, default=0.0)
    ht_c_human_toxicity_cancer = Column(Float, default=0.0)
    ht_nc_human_toxicity_non_cancer = Column(Float, default=0.0)
    et_fw_ecotoxicity_freshwater = Column(Float, default=0.0)
    lu_land_use = Column(Float, default=0.0)
    wsf_water_scarcity = Column(Float, default=0.0)
    ru_mm_resource_use_min_met = Column(Float, default=0.0)
    ru_f_resource_use_fossils = Column(Float, default=0.0)
    
    # Deep Parameters & Logic (NEW)
    parameters_json = Column(JSON, default=dict)

    # Relationships
    exchanges = relationship("DBExchange", backref="process", cascade="all, delete-orphan")

class DBExchange(Base):
    """Input/Output flows for a given process."""
    __tablename__ = "exchanges"
    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("processes.id", ondelete="CASCADE"))
    flow_name = Column(String)
    amount = Column(Float)
    unit = Column(String)
    is_input = Column(Boolean, default=True)
    category = Column(String)
    is_parameter = Column(Boolean, default=False)
    uncertainty_type = Column(String)
    uncertainty_params = Column(JSON)
    allocation_factor = Column(Float, default=1.0)
    formula = Column(String, nullable=True) # NEW: Math expression for amount

class NodeParameter(Base):
    """Project-specific parameter overrides."""
    __tablename__ = "node_parameters"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer)
    node_id = Column(String)
    param_key = Column(String)
    param_value = Column(Float)
    unit = Column(String)
    uncertainty_type = Column(String)
    uncertainty_params = Column(JSON)

class DBMethod(Base):
    __tablename__ = "lcia_methods"
    id = Column(Integer, primary_key=True, index=True)
    database_id = Column(String, ForeignKey("lci_databases_meta.id"), index=True)
    method_name = Column(String, index=True)
    category = Column(String)
    description = Column(Text)
    
    # Relationships
    factors = relationship("DBMethodFactor", backref="method", cascade="all, delete-orphan")

class DBMethodFactor(Base):
    __tablename__ = "method_factors"
    id = Column(Integer, primary_key=True, index=True)
    method_id = Column(Integer, ForeignKey("lcia_methods.id", ondelete="CASCADE"))
    flow_name = Column(String)
    factor = Column(Float)
    unit = Column(String)
    location = Column(String, default="GLO")

def init_db():
    Base.metadata.create_all(bind=engine)
