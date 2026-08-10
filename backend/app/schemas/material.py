from uuid import UUID
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MaterialMachinabilityBase(BaseModel):
    material_name: str = Field(..., description="Name or grade of material, e.g. Aluminum 6061")
    cutting_speed_m_min: float = Field(..., gt=0, description="Cutting speed V_c in meters per minute")
    feed_rate_mm_rev: float = Field(..., gt=0, description="Feed rate f in millimeters per revolution")
    density_g_cm3: float = Field(..., gt=0, description="Material density in g/cm^3")
    is_active: bool = True


class MaterialMachinabilityCreate(MaterialMachinabilityBase):
    pass


class MaterialMachinabilityUpdate(BaseModel):
    material_name: Optional[str] = None
    cutting_speed_m_min: Optional[float] = Field(None, gt=0)
    feed_rate_mm_rev: Optional[float] = Field(None, gt=0)
    density_g_cm3: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None


class MaterialMachinabilityResponse(MaterialMachinabilityBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    tenant_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MaterialMachinabilityListResponse(BaseModel):
    items: List[MaterialMachinabilityResponse]
    total: int


class CycleTimeCalculationRequest(BaseModel):
    cutting_speed_m_min: float = Field(..., description="Cutting speed V_c in m/min")
    feed_rate_mm_rev: float = Field(..., description="Feed rate f in mm/rev")
    part_diameter_mm: float = Field(..., description="Part turning diameter in mm")
    cut_length_mm: float = Field(..., description="Length of cut in mm")


class CycleTimeCalculationResponse(BaseModel):
    rpm: float
    cycle_time_mins: float
    cutting_speed_m_min: float
    feed_rate_mm_rev: float
    part_diameter_mm: float
    cut_length_mm: float
