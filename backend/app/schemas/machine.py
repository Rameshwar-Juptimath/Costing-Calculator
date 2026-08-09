from uuid import UUID
from decimal import Decimal
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class MachineProfileBase(BaseModel):
    machine_name: str = Field(..., min_length=1, max_length=255)
    hourly_rate_inr: Decimal = Field(default=Decimal("0.00"), ge=0)
    operator_rate_inr: Decimal = Field(default=Decimal("0.00"), ge=0)
    is_active: bool = True

class MachineProfileCreate(MachineProfileBase):
    pass

class MachineProfileUpdate(BaseModel):
    machine_name: Optional[str] = Field(None, min_length=1, max_length=255)
    hourly_rate_inr: Optional[Decimal] = Field(None, ge=0)
    operator_rate_inr: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None

class MachineProfileResponse(MachineProfileBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MachineProfileListResponse(BaseModel):
    items: List[MachineProfileResponse]
    total: int
