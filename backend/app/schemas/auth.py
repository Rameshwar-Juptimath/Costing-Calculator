from pydantic import BaseModel, EmailStr
from uuid import UUID

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    role: str
    tenant_id: UUID
    tenant_name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class UserFeatures(BaseModel):
    can_access_direct_cost: bool
    can_access_overhead_cost: bool
    can_access_tax: bool
    can_access_profit_margin: bool

class MeResponse(BaseModel):
    id: UUID
    email: EmailStr
    role: str
    tenant_id: UUID
    tenant_name: str
    tier: str
    features: UserFeatures
