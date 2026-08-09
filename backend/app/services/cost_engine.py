from decimal import Decimal
from typing import List
from app.schemas.costing import (
    CostPayload,
    CostResult,
    CostBreakdown,
    CostTotals,
    DirectCostBreakdown,
    OverheadCostBreakdown,
    CommercialsBreakdown,
    RoutingStepBreakdown,
)
from app.models.subscription import PlanFeature

def calculate_cost(payload: CostPayload, features: PlanFeature) -> CostResult:
    d_input = payload.direct_cost
    batch_size = max(1, d_input.batch_size if d_input.batch_size is not None and d_input.batch_size > 0 else 100)

    step_breakdowns: List[RoutingStepBreakdown] = []
    total_mfg_cost = Decimal("0")

    if d_input.routing_steps and len(d_input.routing_steps) > 0:
        for idx, step in enumerate(d_input.routing_steps, start=1):
            machine_name = step.machine_name or f"Machine {step.sequence_order or idx}"
            setup_mins = Decimal(str(step.setup_time_mins or 0))
            cycle_mins = Decimal(str(step.cycle_time_mins or 0))
            h_rate = Decimal(str(step.hourly_rate_inr or 0))
            op_rate = Decimal(str(step.operator_rate_inr or 0))
            combined_rate = h_rate + op_rate

            # Formula: ((Setup_Time / 60) * (Machine_Rate + Operator_Rate) / Batch_Size) + ((Cycle_Time / 60) * (Machine_Rate + Operator_Rate))
            setup_cost_per_piece = ((setup_mins / Decimal("60")) * combined_rate) / Decimal(str(batch_size))
            run_cost_per_piece = (cycle_mins / Decimal("60")) * combined_rate
            total_step_cost = setup_cost_per_piece + run_cost_per_piece

            step_breakdown = RoutingStepBreakdown(
                sequence_order=step.sequence_order or idx,
                machine_profile_id=step.machine_profile_id,
                machine_name=machine_name,
                setup_time_mins=setup_mins,
                cycle_time_mins=cycle_mins,
                hourly_rate_inr=h_rate,
                operator_rate_inr=op_rate,
                setup_cost_per_piece=round(setup_cost_per_piece, 4),
                run_cost_per_piece=round(run_cost_per_piece, 4),
                total_step_cost=round(total_step_cost, 4),
            )
            step_breakdowns.append(step_breakdown)
            total_mfg_cost += total_step_cost
        
        mfg_cost_value = round(total_mfg_cost, 2)
    else:
        # Fallback to static manufacturing cost if no routing steps provided
        mfg_cost_value = d_input.manufacturing or Decimal("0")
        total_mfg_cost = mfg_cost_value

    # Direct costs subtotal
    d_subtotal = (
        d_input.raw_material
        + d_input.tooling
        + mfg_cost_value
        + d_input.labour
        + d_input.inspection
        + d_input.logistics
    )

    d_breakdown = DirectCostBreakdown(
        raw_material=d_input.raw_material,
        tooling=d_input.tooling,
        manufacturing=mfg_cost_value,
        labour=d_input.labour,
        inspection=d_input.inspection,
        logistics=d_input.logistics,
        batch_size=batch_size,
        routing_steps=step_breakdowns,
        total_manufacturing_cost=round(total_mfg_cost, 2),
        subtotal=d_subtotal,
    )

    # Overhead costs
    o_breakdown = None
    o_subtotal = Decimal("0")
    if features.can_access_overhead_cost:
        o_input = payload.overhead_cost
        o_subtotal = (
            o_input.factory_rent
            + o_input.machinery_asset
            + o_input.electricity
            + o_input.telecom
            + o_input.admin
            + o_input.fixed_salary
            + o_input.expenses
        )
        o_breakdown = OverheadCostBreakdown(
            **o_input.model_dump(),
            subtotal=o_subtotal,
        )

    pre_tax_total = d_subtotal + o_subtotal

    # Commercials (Tax & Margin)
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
            tax_amount=round(tax_amount, 2),
            profit_margin_rate=c_input.profit_margin_rate if features.can_access_profit_margin else Decimal("0"),
            margin_amount=round(margin_amount, 2),
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
            commercials=c_breakdown,
        ),
        totals=CostTotals(
            direct_subtotal=round(d_subtotal, 2),
            overhead_subtotal=round(o_subtotal, 2),
            pre_tax_total=round(pre_tax_total, 2),
            tax_amount=round(tax_amount, 2),
            margin_amount=round(margin_amount, 2),
            grand_total=round(grand_total, 2),
        ),
        tier_applied=tier_applied,
    )
