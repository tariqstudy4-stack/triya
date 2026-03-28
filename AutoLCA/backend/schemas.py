from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import datetime

class UncertaintySchema(BaseModel):
    type: str  # lognormal, normal, uniform, triangle
    params: Dict[str, float]

class ParameterSchema(BaseModel):
    name: str
    value: float
    unit: Optional[str] = "unit"
    min: Optional[float] = 0.0
    max: Optional[float] = 1000.0
    step: Optional[float] = 0.1
    description: Optional[str] = ""
    isEditable: Optional[bool] = True
    uncertainty: Optional[UncertaintySchema] = None

class LocationSchema(BaseModel):
    type: str  # 'coordinate' or 'region_tag'
    value: Any # [lat, lng] or "GLO"

class NodeDataSchema(BaseModel):
    processName: str
    processId: Optional[int] = None
    parameters: Optional[Dict[str, ParameterSchema]] = {}
    exchanges: Optional[List[Dict[str, Any]]] = []
    elementary_flows: Optional[List[Dict[str, Any]]] = []
    module: Optional[str] = "A1-A3"
    location: Optional[LocationSchema] = None

class NodeSchema(BaseModel):
    id: str
    type: str
    data: NodeDataSchema

class EdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class LCIAComputePayload(BaseModel):
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]
    lcia_method_id: Optional[str] = "IPCC 2021 GWP100"
    iterations: Optional[int] = 1  # For Monte Carlo
    systemBoundary: Optional[str] = "gate-to-gate"
    complianceFramework: Optional[str] = "iso-14044"

class UserBase(BaseModel):
    email: str
    organization_id: int
    role: str

class UserCreate(UserBase):
    password: str

class UserSchema(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class OrganizationSchema(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        orm_mode = True

class ProjectSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]
    workspace_id: int

    class Config:
        orm_mode = True

class ModelSavePayload(BaseModel):
    name: str
    description: Optional[str] = ""
    project_id: int # Required for multi-tenancy
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    parameters: Optional[List[Dict[str, Any]]] = []
# -------------------------------------------------------------------
# 1. GLOBAL SCENARIO & SYSTEM MODELS
# -------------------------------------------------------------------

class MFA_SystemDefinition(BaseModel):
    spatial_boundary: str = Field(default="Global")
    temporal_boundary: str = Field(default="Annual")
    material_level: str = "Goods" # "Goods", "Materials", "Substances/SFA"

class EWMFA_Indicators(BaseModel):
    dmi_kg: float = Field(0.0, description="Direct Material Input")
    dmc_kg: float = Field(0.0, description="Domestic Material Consumption")
    nas_kg: float = Field(0.0, description="Net Addition to Stock")
    ptb_kg: float = Field(0.0, description="Physical Trade Balance")

class LCI_Core(BaseModel):
    functional_unit: str = "Provide footwear/services for 1 end-user/year"
    reference_flow: float = 1.0
    process_type: str = "Unit Process"
    cut_off_rules: str = "1% mass/energy threshold"

class GlobalSystemParameters(BaseModel):
    mfa_definition: MFA_SystemDefinition = MFA_SystemDefinition()
    ew_mfa: EWMFA_Indicators = EWMFA_Indicators()
    lci_core: LCI_Core = LCI_Core()

# -------------------------------------------------------------------
# 2. NODE-LEVEL PARAMETERS (IDEF0 PROPERTY INSPECTOR)
# -------------------------------------------------------------------

class TransferCoefficient(BaseModel):
    target_node_id: str = ""
    rate: float = Field(1.0, ge=0, le=1.0, description="e.g. 0.95 mapping to 95% yield")

class MFA_NodeParameters(BaseModel):
    import_flows_kg: float = 0.0
    export_flows_kg: float = 0.0
    internal_flows_kg: float = 0.0
    stocks_reserves_kg: float = 0.0
    transfer_coefficients: List[TransferCoefficient] = []

class LCI_PhysicalFlows(BaseModel):
    energy_inputs: Dict[str, float] = Field(default_factory=dict, description="Fuels, electricity, heat (MJ or kWh)")
    material_inputs: Dict[str, float] = Field(default_factory=dict, description="Raw materials, plastics, metals (kg)")
    transport_services: Dict[str, float] = Field(default_factory=dict, description="Road, rail, sea, air (tkm)")
    resources_consumption: Dict[str, float] = Field(default_factory=dict, description="Water withdrawal, land occ")
    waste_treatment: Dict[str, float] = Field(default_factory=dict, description="Incineration, recycling, landfilling")
    emissions_air: Dict[str, float] = Field(default_factory=dict, description="CO2 fossil, CH4, N2O, SO2, PM2.5 (kg)")
    emissions_water: Dict[str, float] = Field(default_factory=dict, description="COD, BOD, DOC, Nitrogen (kg)")
    emissions_soil: Dict[str, float] = Field(default_factory=dict, description="Pesticides, heavy metals (kg)")

class LCI_NodeParameters(BaseModel):
    physical_flows: LCI_PhysicalFlows = LCI_PhysicalFlows()
    flow_classification: str = "Technosphere Flows"
    allocation_method: str = "Physical"

class LCIA_NodeImpacts(BaseModel):
    climate_change_gwp: float = Field(0.0, alias="Climate Change (kg CO2-eq)")
    acidification: float = Field(0.0, alias="Acidification (kg SO2-eq)")
    eutrophication: float = Field(0.0, alias="Eutrophication (kg PO4-eq)")
    toxicity_human: float = Field(0.0, alias="Toxicity (Human CTUh)")
    toxicity_eco: float = Field(0.0, alias="Toxicity (Ecotoxicity CTUe)")
    ozone_depletion: float = Field(0.0, alias="Ozone Depletion (kg CFC-11-eq)")
    resource_depletion: float = Field(0.0, alias="Resource Depletion (ADP kg Sb-eq)")
    land_use: float = Field(0.0, alias="Land Use (Pt)")
    water_scarcity: float = Field(0.0, alias="Water Scarcity (m3 eq)")
    particulate_matter: float = Field(0.0, alias="Particulate Matter (Disease incidence)")
    photochemical_ozone: float = Field(0.0, alias="Photochemical Ozone (kg NMVOC-eq)")

class DQI_PedigreeMatrix(BaseModel):
    reliability: int = Field(1, ge=1, le=5)
    completeness: int = Field(1, ge=1, le=5)
    temporal_correlation: int = Field(1, ge=1, le=5)
    geographical_correlation: int = Field(1, ge=1, le=5)
    technological_correlation: int = Field(1, ge=1, le=5)

class Metadata_NodeParameters(BaseModel):
    geography: str = "GLO"
    geography_code: Optional[str] = "GLO" # Deterministic code (ISO 3166)
    pedigree_matrix: DQI_PedigreeMatrix = DQI_PedigreeMatrix()
    system_model: str = "Allocation cut-off"
    uncertainty_distribution: str = "Lognormal"
    uncertainty_variance: float = 0.0

# -------------------------------------------------------------------
# 3. ROOT NODE EXTENSION
# -------------------------------------------------------------------

class DeepNodeDataSchema(BaseModel):
    processName: str
    label: str
    inputs: List[str] = []
    outputs: List[str] = []
    controls: List[str] = []
    mechanisms: List[str] = []
    mfa_parameters: MFA_NodeParameters = MFA_NodeParameters()
    lci_parameters: LCI_NodeParameters = LCI_NodeParameters()
    lcia_impacts: LCIA_NodeImpacts = LCIA_NodeImpacts()
    metadata: Metadata_NodeParameters = Metadata_NodeParameters()

class DeepNodeSchema(BaseModel):
    id: str
    type: str = "process"
    position: Dict[str, float]
    data: DeepNodeDataSchema

class DeepLCAModelSchema(BaseModel):
    project_id: int
    global_system_parameters: GlobalSystemParameters = GlobalSystemParameters()
    nodes: List[DeepNodeSchema] = []
    edges: List[EdgeSchema] = []
