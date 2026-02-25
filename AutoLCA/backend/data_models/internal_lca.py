from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class UnifiedExchange(BaseModel):
    flow_id: str = Field(..., description="Unique identifier for the flow")
    name: str = Field(..., description="Human-readable name of the flow")
    amount: float = Field(..., description="Quantity of the flow")
    unit: str = Field(..., description="Standardized unit (e.g., kg, MJ)")
    flow_type: str = Field(..., description="Input or Output")
    is_elementary: bool = Field(default=False, description="True if it's an environmental exchange")

class UnifiedProcess(BaseModel):
    id: str = Field(..., description="Original database ID")
    name: str = Field(..., description="Process name")
    version: Optional[str] = Field(None, description="Database version info")
    location_code: str = Field(default="GLO", description="ISO location code")
    category: Optional[str] = Field(None, description="Process classification")
    exchanges: List[UnifiedExchange] = Field(default_factory=list)

class UnifiedMetadata(BaseModel):
    source_db: str = Field(..., description="Name of the source database (e.g., ecoinvent, NEEDS)")
    schema_version: str = Field(default="1.0", description="Triya Schema version")
    extraction_date: datetime = Field(default_factory=datetime.now)
    total_processes: int = 0

class UnifiedDatabase(BaseModel):
    metadata: UnifiedMetadata
    processes: List[UnifiedProcess]
