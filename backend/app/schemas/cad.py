from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel
from uuid import UUID

class BoundingBox(BaseModel):
    x_mm: float
    y_mm: float
    z_mm: float

class BarStockDimensions(BaseModel):
    radius_mm: float
    diameter_mm: float
    height_mm: float
    cross_section_area_mm2: float

class SheetMetalDimensions(BaseModel):
    thickness_mm: float
    width_mm: float
    length_mm: float
    sheet_area_mm2: float

class PartForms(BaseModel):
    bar_stock: BarStockDimensions
    sheet: SheetMetalDimensions
    recommended_form: str

class StepGeometry(BaseModel):
    volume_mm3: float
    estimated_mass_kg: Optional[float] = None
    estimated_mass_g: Optional[float] = None
    material_name: Optional[str] = None
    bounding_box: BoundingBox
    surface_area_mm2: float
    part_forms: Optional[PartForms] = None

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
