import json
import csv
import os
import uuid
import zipfile
import tempfile
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from data_models.internal_lca import UnifiedProcess, UnifiedExchange, UnifiedMetadata

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
#  Semantic Mapper (Nomenclature Translator)
# ---------------------------------------------------------------------------

class SemanticMapper:
    """
    Harmonizes units and flow names across different database conventions.
    """
    UNIT_MAPPING = {
        "kg": "kg",
        "kilogram": "kg",
        "kilograms": "kg",
        "kg(s)": "kg",
        "g": "g",
        "gram": "g",
        "mj": "MJ",
        "megajoule": "MJ",
        "kwh": "kWh",
        "kilowatt hour": "kWh",
        "m3": "m3",
        "cubic meter": "m3",
        "item(s)": "unit",
        "unit": "unit",
        "p": "unit",
        "piece": "unit"
    }

    @classmethod
    def normalize_unit(cls, unit: str) -> str:
        if not unit:
            return "unit"
        lowered = unit.lower().strip()
        return cls.UNIT_MAPPING.get(lowered, lowered)

# ---------------------------------------------------------------------------
#  Abstract Base Class
# ---------------------------------------------------------------------------

class BaseParser(ABC):
    def __init__(self, source_db: str):
        self.source_db = source_db
        self.metadata = UnifiedMetadata(source_db=source_db)

    @abstractmethod
    def extract_processes(self, file_path: str) -> List[Dict[str, Any]]:
        """Extract raw data from file."""
        ...

    @abstractmethod
    def map_to_unified(self, raw_data: List[Dict[str, Any]]) -> List[UnifiedProcess]:
        """Convert raw data to Triya Schema."""
        ...

    def parse(self, file_path: str) -> List[UnifiedProcess]:
        raw_data = self.extract_processes(file_path)
        unified_procs = self.map_to_unified(raw_data)
        self.metadata.total_processes = len(unified_procs)
        return unified_procs

# ---------------------------------------------------------------------------
#  JSON-LD Parser
# ---------------------------------------------------------------------------

class JsonLdParser(BaseParser):
    def extract_processes(self, file_path: str) -> List[Dict[str, Any]]:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Handle different JSON shapes
        if isinstance(data, dict):
            if data.get("@type") == "Process":
                return [data]
            if "processes" in data and isinstance(data["processes"], list):
                return data["processes"]
            # Try to find a list of dicts
            for val in data.values():
                if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
                    return val
        if isinstance(data, list):
            return data
        return []

    def map_to_unified(self, raw_data: List[Dict[str, Any]]) -> List[UnifiedProcess]:
        unified = []
        for obj in raw_data:
            try:
                proc_id = obj.get("@id") or obj.get("id") or str(uuid.uuid4())
                
                exchanges = []
                for ex in obj.get("exchanges", []):
                    # Flow normalization
                    flow_obj = ex.get("flow", {})
                    flow_name = flow_obj.get("name") if isinstance(flow_obj, dict) else str(flow_obj)
                    if not flow_name:
                        flow_name = ex.get("flow_name", "Unknown Flow")
                    
                    # Unit normalization
                    unit_obj = ex.get("unit", {})
                    unit_name = unit_obj.get("name") if isinstance(unit_obj, dict) else str(unit_obj)
                    normalized_unit = SemanticMapper.normalize_unit(unit_name or ex.get("unit"))

                    # Direction
                    is_input = ex.get("isInput")
                    flow_type_str = ex.get("flow_type") or ex.get("flowType") or ""
                    if is_input is True or flow_type_str.lower() in ("input", "elementary_flow"):
                        flow_type = "Input"
                    else:
                        flow_type = "Output"

                    exchanges.append(UnifiedExchange(
                        flow_id=ex.get("flow", {}).get("@id", str(uuid.uuid4())),
                        name=flow_name,
                        amount=float(ex.get("amount") or 0),
                        unit=normalized_unit,
                        flow_type=flow_type,
                        is_elementary=ex.get("is_elementary", False) or "elementary" in flow_type_str.lower()
                    ))

                location_obj = obj.get("location", {})
                location = location_obj.get("name") if isinstance(location_obj, dict) else str(location_obj)

                unified.append(UnifiedProcess(
                    id=str(proc_id),
                    name=obj.get("name", "Unnamed Process"),
                    version=obj.get("version"),
                    location_code=location if location and location != "{}" else "GLO",
                    category=obj.get("category"),
                    exchanges=exchanges
                ))
            except Exception as e:
                logger.error(f"Semantic Conflict in JSON-LD mapping: {e}")
                continue
        return unified

# ---------------------------------------------------------------------------
#  CSV Parser
# ---------------------------------------------------------------------------

class CsvParser(BaseParser):
    def extract_processes(self, file_path: str) -> List[Dict[str, Any]]:
        processes = []
        try:
            with open(file_path, "r", encoding="utf-8-sig") as f:
                reader = csv.DictReader(f)
                for row_idx, row in enumerate(reader):
                    processes.append(row)
        except Exception as e:
            logger.error(f"Error reading CSV: {e}")
        return processes

    def map_to_unified(self, raw_data: List[Dict[str, Any]]) -> List[UnifiedProcess]:
        unified = []
        for idx, row in enumerate(raw_data):
            try:
                proc_name = row.get("process_name") or row.get("name") or f"Process {idx + 1}"
                unit = SemanticMapper.normalize_unit(row.get("unit") or "kg")
                
                exchanges = []
                # Simple heuristic for CSV: any numeric column except known labels
                skip = {"process_name", "name", "unit", "id", "description", "location", "category"}
                for col, val in row.items():
                    if col.lower() in skip: continue
                    try:
                        amount = float(val)
                        if amount != 0:
                            exchanges.append(UnifiedExchange(
                                flow_id=str(uuid.uuid4()),
                                name=col,
                                amount=amount,
                                unit=unit,
                                flow_type="Input",
                                is_elementary=False
                            ))
                    except (ValueError, TypeError):
                        continue

                unified.append(UnifiedProcess(
                    id=row.get("id") or str(idx + 1),
                    name=proc_name,
                    location_code=row.get("location") or "GLO",
                    category=row.get("category"),
                    exchanges=exchanges
                ))
            except Exception as e:
                logger.error(f"Semantic Conflict in CSV mapping: {idx}: {e}")
                continue
        return unified

# ---------------------------------------------------------------------------
#  Zolca Parser (Placeholder for Derby logic)
# ---------------------------------------------------------------------------

class ZolcaParser(BaseParser):
    def extract_processes(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Handles unzipping and structure detection for .zolca.
        Note: .zolca is usually a zipped folder containing JSON and Derby data.
        """
        logger.info(f"Unzipping .zolca file: {file_path}")
        results = []
        try:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                # Basic strategy: find all .json files inside
                for file_name in zip_ref.namelist():
                    if file_name.endswith('.json'):
                        with zip_ref.open(file_name) as f:
                            content = json.load(f)
                            if isinstance(content, dict) and content.get("@type") == "Process":
                                results.append(content)
        except Exception as e:
            logger.error(f"Failed to unzip/parse .zolca: {e}")
        return results

    def map_to_unified(self, raw_data: List[Dict[str, Any]]) -> List[UnifiedProcess]:
        # Zolca internal processes often follow OpenLCA JSON-LD
        return JsonLdParser("Zolca-Internal").map_to_unified(raw_data)

# ---------------------------------------------------------------------------
#  ZIP Parser (ecoinvent JSON-LD exports)
# ---------------------------------------------------------------------------

class ZipJsonLdParser(BaseParser):
    """Handles zipped folders of JSON-LD files (standard ecoinvent export format)."""
    def extract_processes(self, file_path: str) -> List[Dict[str, Any]]:
        results = []
        try:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                for file_name in zip_ref.namelist():
                    if file_name.endswith('.json') and not file_name.startswith('__'):
                        try:
                            with zip_ref.open(file_name) as f:
                                content = json.load(f)
                                if isinstance(content, dict):
                                    if content.get("@type") == "Process":
                                        results.append(content)
                                    elif "processes" in content:
                                        results.extend(content["processes"])
                                elif isinstance(content, list):
                                    for item in content:
                                        if isinstance(item, dict) and item.get("@type") == "Process":
                                            results.append(item)
                        except (json.JSONDecodeError, KeyError) as e:
                            logger.warning(f"Skipped {file_name} in ZIP: {e}")
                            continue
        except Exception as e:
            logger.error(f"Failed to parse ZIP: {e}")
        logger.info(f"Extracted {len(results)} processes from ZIP")
        return results

    def map_to_unified(self, raw_data: List[Dict[str, Any]]) -> List[UnifiedProcess]:
        return JsonLdParser("ZIP-JSON-LD").map_to_unified(raw_data)


# ---------------------------------------------------------------------------
#  Factory / Router
# ---------------------------------------------------------------------------

def get_parser(file_path: str) -> BaseParser:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".json":
        return JsonLdParser("OpenLCA-JSON")
    elif ext == ".csv":
        return CsvParser("Standard-CSV")
    elif ext == ".zolca":
        return ZolcaParser("OpenLCA-Zolca")
    elif ext == ".zip":
        return ZipJsonLdParser("ZIP-JSON-LD")
    else:
        raise ValueError(f"Unsupported database format: {ext}")

def parse_uploaded_file(file_path: str) -> Dict[str, Any]:
    """
    Unified entry point for the API.
    """
    try:
        parser = get_parser(file_path)
        unified_procs = parser.parse(file_path)
        
        return {
            "metadata": parser.metadata.dict(),
            "processes": [p.dict() for p in unified_procs]
        }
    except Exception as e:
        logger.error(f"Parse failed: {e}")
        return {"processes": [], "error": str(e)}
