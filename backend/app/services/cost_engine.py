from decimal import Decimal
from app.schemas.costing import CostPayload, CostResult, CostBreakdown, CostTotals, DirectCostBreakdown, OverheadCostBreakdown, CommercialsBreakdown
from app.models.subscription import PlanFeature

def calculate_cost(payload: CostPayload, features: PlanFeature) -> CostResult:
    # Direct costs
    d_input = payload.direct_cost
    d_subtotal = d_input.raw_material + d_input.tooling + d_input.manufacturing + \
                 d_input.labour + d_input.inspection + d_input.logistics
                 
    d_breakdown = DirectCostBreakdown(
        **d_input.model_dump(),
        subtotal=d_subtotal
    )
    
    o_breakdown = None
    o_subtotal = Decimal("0")
    if features.can_access_overhead_cost:
        o_input = payload.overhead_cost
        o_subtotal = o_input.factory_rent + o_input.machinery_asset + o_input.electricity + \
                     o_input.telecom + o_input.admin + o_input.fixed_salary + o_input.expenses
        o_breakdown = OverheadCostBreakdown(
            **o_input.model_dump(),
            subtotal=o_subtotal
        )
        
    pre_tax_total = d_subtotal + o_subtotal
    
    c_breakdown = None
    tax_amount = Decimal("0")
    margin_amount = Decimal("0")
    
    if features.can_access_tax or features.can_access_profit_margin:
        c_input = payload.commercials
        if features.can_access_tax:
            tax_amount = pre_tax_total * c_input.tax_rate / Decimal("100")
        if features.can_access_profit_margin:
            margin_amount = pre_tax_total * c_input.profit_margin_rate / Decimal("100")
            
        c_breakdown = CommercialsBreakdown(
            pre_tax_base=pre_tax_total,
            tax_rate=c_input.tax_rate if features.can_access_tax else Decimal("0"),
            tax_amount=tax_amount,
            profit_margin_rate=c_input.profit_margin_rate if features.can_access_profit_margin else Decimal("0"),
            margin_amount=margin_amount
        )
        
    grand_total = pre_tax_total + tax_amount + margin_amount
    
    tier_applied = "Pro" if features.can_access_overhead_cost else "Basic"
    
    return CostResult(
        estimate_id=payload.estimate_id,
        currency=payload.currency,
        currency_symbol="₹",
        breakdown=CostBreakdown(
            direct_cost=d_breakdown,
            overhead_cost=o_breakdown,
            commercials=c_breakdown
        ),
        totals=CostTotals(
            direct_subtotal=d_subtotal,
            overhead_subtotal=o_subtotal,
            pre_tax_total=pre_tax_total,
            tax_amount=tax_amount,
            margin_amount=margin_amount,
            grand_total=grand_total
        ),
        tier_applied=tier_applied
    )
