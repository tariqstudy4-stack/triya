from pydantic import BaseModel, Field, ConfigDict
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
    exchanges: Optional[List[Dict[str, Any]]] = [] # Each dict can now have 'formula': str
    elementary_flows: Optional[List[Dict[str, Any]]] = []
    module: Optional[str] = "A1-A3"
    location: Optional[LocationSchema] = None

class NodeSchema(BaseModel):
    id: str
    type: str
    data: NodeDataSchema

# -------------------------------------------------------------------
# 1. DEEP INDUSTRIAL SCHEMAS (Moved up to fix NameError)
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

class DeepNodeDataSchema(BaseModel):
    processName: str
    label: str
    inputs: List[Dict[str, Any]] = [] # Dicts now include 'formula'
    outputs: List[Dict[str, Any]] = [] # Dicts now include 'formula'
    controls: List[Any] = []
    mechanisms: List[Any] = []
    mfa_parameters: Optional[MFA_NodeParameters] = MFA_NodeParameters()
    lci_parameters: Optional[LCI_NodeParameters] = LCI_NodeParameters()
    lcia_impacts: Optional[LCIA_NodeImpacts] = LCIA_NodeImpacts()
    metadata: Optional[Metadata_NodeParameters] = Metadata_NodeParameters()

class DeepNodeSchema(BaseModel):
    id: str
    type: str = "process"
    position: Dict[str, float]
    data: DeepNodeDataSchema

class EdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class FunctionalUnitSchema(BaseModel):
    description: str = "1 kg of finished industrial product delivered to the factory gate"
    magnitude: float = 1.0
    unit: str = "kg"
    referenceFlow: str = "1.05 kg of raw material input"

class SystemBoundarySchema(BaseModel):
    scope: str = "CRADLE_TO_GATE"
    capitalGoods: bool = False
    humanLabor: bool = False
    packaging: bool = True
    cutoffThreshold: float = 0.01
    excludedFlows: List[str] = ["Ancillary materials < 0.1% mass"]

class AllocationSchema(BaseModel):
    principle: str = "ALLOCATION"
    method: str = "MASS"
    recyclingMethod: str = "CUTOFF"

class LCIASchema(BaseModel):
    methodology: str = "EF_3_1"
    categories: List[str] = ["GWP100", "Land Use", "Water Scarcity"]

class DataQualitySchema(BaseModel):
    timeframe: str = "2023-2025"
    geography: str = "RER (Europe)"
    technology: str = "Current industrial average"

class ReviewSchema(BaseModel):
    type: str = "INTERNAL"

class GoalAndScopeSchema(BaseModel):
    projectTitle: str = "Industrial Strategic LCA Model"
    intendedApplication: str = "PEF"
    regulatoryFramework: str = "EU_CSRD"
    reasons: str = "Internal R&D optimization and hotspot identification for 2030 decarbonization."
    intendedAudience: str = "Internal Management & B2B Customers"
    isComparativePublic: bool = False
    functionalUnit: FunctionalUnitSchema = FunctionalUnitSchema()
    systemBoundary: SystemBoundarySchema = SystemBoundarySchema()
    allocation: AllocationSchema = AllocationSchema()
    lcia: LCIASchema = LCIASchema()
    dataQuality: DataQualitySchema = DataQualitySchema()
    review: ReviewSchema = ReviewSchema()

class CalculationRequestSchema(BaseModel):
    """Canvas payloads from React Flow use flexible node.data shapes (label, inputs, …)."""
    model_config = ConfigDict(extra="ignore")

    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    lcia_method_id: Optional[str] = "IPCC 2021 GWP100"
    iterations: Optional[int] = 1
    systemBoundary: Optional[str] = "gate-to-gate"
    complianceFramework: Optional[str] = "iso-14044"
    goalAndScope: Optional[GoalAndScopeSchema] = None

class SensitivityRequestSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    target_node_id: str
    variance: Optional[float] = 0.10

class ProjectSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        orm_mode = True

class ModelSavePayload(BaseModel):
    name: str
    description: Optional[str] = ""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    parameters: Optional[List[Dict[str, Any]]] = []

class LCI_Core(BaseModel):
    functional_unit: str = "Provide footwear/services for 1 end-user/year"
    reference_flow: float = 1.0
    process_type: str = "Unit Process"
    cut_off_rules: str = "1% mass/energy threshold"

class GlobalSystemParameters(BaseModel):
    mfa_definition: MFA_SystemDefinition = MFA_SystemDefinition()
    ew_mfa: EWMFA_Indicators = EWMFA_Indicators()
    lci_core: LCI_Core = LCI_Core()
    goalAndScope: GoalAndScopeSchema = GoalAndScopeSchema()

class DeepLCAModelSchema(BaseModel):
    project_id: int
    global_system_parameters: GlobalSystemParameters = GlobalSystemParameters()
    nodes: List[DeepNodeSchema] = []
    edges: List[EdgeSchema] = []
