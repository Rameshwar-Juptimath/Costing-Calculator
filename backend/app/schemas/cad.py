from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel
from uuid import UUID

class BoundingBox(BaseModel):
    x_mm: float
    y_mm: float
    z_mm: float

class StepGeometry(BaseModel):
    volume_mm3: float
    bounding_box: BoundingBox
    surface_area_mm2: float

class DXFEntity(BaseModel):
    type: str
    layer: str
    area_mm2: float
    perimeter_mm: float

class DXFGeometry(BaseModel):
    entities: List[DXFEntity]
    total_area_mm2: float
    total_perimeter_mm: float
    drawing_units: str

class UploadResponse(BaseModel):
    estimate_id: UUID
    filename: str
    file_type: str
    geometry: Union[StepGeometry, DXFGeometry]
    mesh_url: Optional[str] = None
