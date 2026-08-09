from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID
from decimal import Decimal
from datetime import datetime

class RoutingStepInput(BaseModel):
    machine_profile_id: Optional[UUID] = None
    machine_name: Optional[str] = None
    sequence_order: int = 1
    setup_time_mins: Decimal = Decimal("0")
    cycle_time_mins: Decimal = Decimal("0")
    hourly_rate_inr: Optional[Decimal] = Decimal("0")
    operator_rate_inr: Optional[Decimal] = Decimal("0")

class RoutingStepBreakdown(BaseModel):
    sequence_order: int
    machine_profile_id: Optional[UUID] = None
    machine_name: str
    setup_time_mins: Decimal
    cycle_time_mins: Decimal
    hourly_rate_inr: Decimal
    operator_rate_inr: Decimal
    setup_cost_per_piece: Decimal
    run_cost_per_piece: Decimal
    total_step_cost: Decimal

class DirectCostInput(BaseModel):
    raw_material: Decimal
    tooling: Decimal
    manufacturing: Optional[Decimal] = Decimal("0")
    labour: Decimal
    inspection: Decimal
    logistics: Decimal
    batch_size: Optional[int] = 100
    routing_steps: Optional[List[RoutingStepInput]] = []

class OverheadCostInput(BaseModel):
    factory_rent: Decimal
    machinery_asset: Decimal
    electricity: Decimal
    telecom: Decimal
    admin: Decimal
    fixed_salary: Decimal
    expenses: Decimal

class CommercialsInput(BaseModel):
    tax_rate: Decimal
    profit_margin_rate: Decimal

class CostPayload(BaseModel):
    estimate_id: str
    currency: str = "INR"
    direct_cost: DirectCostInput
    overhead_cost: OverheadCostInput
    commercials: CommercialsInput

class DirectCostBreakdown(BaseModel):
    raw_material: Decimal
    tooling: Decimal
    manufacturing: Decimal
    labour: Decimal
    inspection: Decimal
    logistics: Decimal
    batch_size: int = 100
    routing_steps: List[RoutingStepBreakdown] = []
    total_manufacturing_cost: Decimal = Decimal("0")
    subtotal: Decimal

class OverheadCostBreakdown(OverheadCostInput):
    subtotal: Decimal

class CommercialsBreakdown(BaseModel):
    pre_tax_base: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    profit_margin_rate: Decimal
    margin_amount: Decimal

class CostBreakdown(BaseModel):
    direct_cost: DirectCostBreakdown
    overhead_cost: Optional[OverheadCostBreakdown] = None
    commercials: Optional[CommercialsBreakdown] = None

class CostTotals(BaseModel):
    direct_subtotal: Decimal
    overhead_subtotal: Decimal
    pre_tax_total: Decimal
    tax_amount: Decimal
    margin_amount: Decimal
    grand_total: Decimal

class CostResult(BaseModel):
    estimate_id: str
    currency: str
    currency_symbol: str = "₹"
    breakdown: CostBreakdown
    totals: CostTotals
    tier_applied: str

class EstimateListItem(BaseModel):
    id: UUID
    filename: str
    file_type: str
    grand_total: Optional[Decimal]
    currency: str
    tier_applied: Optional[str]
    created_at: datetime

class EstimatesResponse(BaseModel):
    items: List[EstimateListItem]
    total: int
