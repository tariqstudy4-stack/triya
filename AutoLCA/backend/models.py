from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Boolean, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os
import datetime

# Pathway B Link (Persistent Database)
DEFAULT_DB_PATH = r"C:\Users\Asus\Documents\Database_Triya\triya_poc.db"

class DatabaseManager:
    def __init__(self, db_path=DEFAULT_DB_PATH):
        self.db_path = db_path
        self.engine = create_engine(
            f"sqlite:///{self.db_path}", connect_args={"check_same_thread": False}
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def switch_db(self, new_path):
        self.db_path = new_path
        self.engine = create_engine(
            f"sqlite:///{self.db_path}", connect_args={"check_same_thread": False}
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        return self.SessionLocal

db_manager = DatabaseManager()
SessionLocal = db_manager.SessionLocal
Base = declarative_base()

class LCAProcess(Base):
    __tablename__ = "lca_processes"

    id = Column(Integer, primary_key=True, index=True)
    process_name = Column(String)
    unit = Column(String)
    category = Column(String, nullable=True)
    location = Column(String, nullable=True)
    technology = Column(String, nullable=True)
    
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

    exchanges = relationship("LCAExchange", back_populates="process")

class LCAExchange(Base):
    __tablename__ = "lca_exchanges"

    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("lca_processes.id"))
    flow_name = Column(String)
    amount = Column(Float)
    unit = Column(String)
    flow_type = Column(String)  # 'input' or 'output'
    
    # New Scientific Metadata
    uncertainty_type = Column(String, nullable=True) # lognormal, normal, uniform
    uncertainty_params = Column(JSON, nullable=True) # {"sd_g": 1.2} etc.
    allocation_factor = Column(Float, default=1.0)
    is_parameter = Column(Boolean, default=False)
    description = Column(String, nullable=True)

    process = relationship("LCAProcess", back_populates="exchanges")

class LCAModel(Base):
    """
    Stores user-created supply chain graphs for persistence.
    """
    __tablename__ = "lca_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Blob of the whole graph structure
    nodes_data = Column(JSON) 
    edges_data = Column(JSON)
    
    parameters = relationship("NodeParameter", back_populates="model", cascade="all, delete-orphan")

class NodeParameter(Base):
    """
    Stores per-node parameter overrides for a specific saved model.
    """
    __tablename__ = "node_parameters"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("lca_models.id"))
    node_id = Column(String) # The frontend UUID for the node
    
    param_key = Column(String) # e.g. "transport_distance"
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
    if not os.path.exists(os.path.dirname(db_manager.db_path)):
        os.makedirs(os.path.dirname(db_manager.db_path))
    Base.metadata.create_all(bind=db_manager.engine)
