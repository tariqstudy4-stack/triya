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
    iterations: Optional[int] = 1  # For Monte Carlo
    systemBoundary: Optional[str] = "gate-to-gate"
    complianceFramework: Optional[str] = "iso-14044"

class ModelSavePayload(BaseModel):
    name: str
    description: Optional[str] = ""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    parameters: Optional[List[Dict[str, Any]]] = []
