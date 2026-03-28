from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Boolean, DateTime, JSON, Text, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os
import datetime
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Resolve DB path from environment variable, falling back to a local data/ directory.
# This makes the app work identically on Windows dev, Linux, and Docker.
_DEFAULT_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "lca_data.db")
DEFAULT_DB_PATH = os.environ.get("DATABASE_URL", f"sqlite:///{_DEFAULT_DB}").replace("sqlite:///", "")

# SaaS Shared Database (Postgres recommended for prod, SQLite for POC)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB}")
logger.info(f"Using DATABASE_URL={DATABASE_URL}")

# Ensure data directory exists
os.makedirs(os.path.dirname(os.path.abspath(_DEFAULT_DB)), exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SaaS Core Models ---

class Organization(Base):
    """
    Representing a Tenant/Workspace.
    """
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    slug = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="organization")
    projects = relationship("Project", back_populates="workspace")
    custom_processes = relationship("LCAProcess", back_populates="workspace")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="member") # admin, member, viewer
    
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    organization = relationship("Organization", back_populates="users")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    workspace_id = Column(Integer, ForeignKey("organizations.id"))
    workspace = relationship("Organization", back_populates="projects")
    
    models = relationship("LCAModel", back_populates="project", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="project", cascade="all, delete-orphan")

class Scenario(Base):
    """
    Scenario Variants (Phase 4 requirement: store deltas/variants).
    """
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    # Store parameter deltas as JSON
    parameter_deltas = Column(JSON, nullable=True) 
    base_model_id = Column(Integer, ForeignKey("lca_models.id"), nullable=True)
    
    project = relationship("Project", back_populates="scenarios")

# --- LCA Data Domain Models ---

class LCAProcess(Base):
    __tablename__ = "lca_processes"

    id = Column(Integer, primary_key=True, index=True)
    process_name = Column(String, index=True)
    unit = Column(String)
    category = Column(String, nullable=True)
    location = Column(String, nullable=True)
    technology = Column(String, nullable=True)
    
    # Multi-tenancy: if null, it's a "Library Node" (Phase 3)
    workspace_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    is_library = Column(Boolean, default=False)

    # 16 JRC EF 3.1 Impact Categories
    gwp_climate_change = Column(Float, nullable=True)
    odp_ozone_depletion = Column(Float, nullable=True)
    ap_acidification = Column(Float, nullable=True)
    ep_freshwater = Column(Float, nullable=True)
    ep_marine = Column(Float, nullable=True)
    ep_terrestrial = Column(Float, nullable=True)
    pocp_photochemical_ozone = Column(Float, nullable=True)
    pm_particulate_matter = Column(Float, nullable=True)
    ir_ionising_radiation = Column(Float, nullable=True)
    ht_c_human_toxicity_cancer = Column(Float, nullable=True)
    ht_nc_human_toxicity_non_cancer = Column(Float, nullable=True)
    et_fw_ecotoxicity_freshwater = Column(Float, nullable=True)
    lu_land_use = Column(Float, nullable=True)
    wsf_water_scarcity = Column(Float, nullable=True)
    ru_mm_resource_use_min_met = Column(Float, nullable=True)
    ru_f_resource_use_fossils = Column(Float, nullable=True)

    workspace = relationship("Organization", back_populates="custom_processes")
    exchanges = relationship("LCAExchange", back_populates="process", cascade="all, delete-orphan")

class LCAExchange(Base):
    __tablename__ = "lca_exchanges"

    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("lca_processes.id"))
    flow_name = Column(String)
    amount = Column(Float)
    unit = Column(String)
    flow_type = Column(String)  # 'input', 'output', 'control', 'mechanism'
    
    uncertainty_type = Column(String, nullable=True)
    uncertainty_params = Column(JSON, nullable=True)
    allocation_factor = Column(Float, default=1.0)
    is_parameter = Column(Boolean, default=False)
    description = Column(String, nullable=True)

    process = relationship("LCAProcess", back_populates="exchanges")

class LCAModel(Base):
    __tablename__ = "lca_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project_id = Column(Integer, ForeignKey("projects.id"))
    global_parameters = Column(JSON, nullable=True)
    nodes_data = Column(JSON) 
    edges_data = Column(JSON)
    
    project = relationship("Project", back_populates="models")
    parameters = relationship("NodeParameter", back_populates="model", cascade="all, delete-orphan")
    versions = relationship("LCAModelVersion", back_populates="model", cascade="all, delete-orphan")

class LCAModelVersion(Base):
    __tablename__ = "lca_model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("lca_models.id"))
    version_number = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    change_description = Column(String, nullable=True)
    nodes_snapshot = Column(JSON)
    edges_snapshot = Column(JSON)
    gwp_snapshot = Column(Float, nullable=True)

    model = relationship("LCAModel", back_populates="versions")

class NodeParameter(Base):
    __tablename__ = "node_parameters"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("lca_models.id"))
    node_id = Column(String)
    
    param_key = Column(String) 
    param_value = Column(Float)
    unit = Column(String, nullable=True)
    min_val = Column(Float, nullable=True)
    max_val = Column(Float, nullable=True)
    step = Column(Float, nullable=True)
    is_editable = Column(Boolean, default=True)
    
    uncertainty_type = Column(String, nullable=True)
    uncertainty_params = Column(JSON, nullable=True)

    model = relationship("LCAModel", back_populates="parameters")

def init_db():
    # PostgreSQL tables creation
    Base.metadata.create_all(bind=engine)
