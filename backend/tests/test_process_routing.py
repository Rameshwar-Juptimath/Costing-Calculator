from decimal import Decimal
from app.services.cost_engine import calculate_cost
from app.schemas.costing import (
    CostPayload,
    DirectCostInput,
    OverheadCostInput,
    CommercialsInput,
    RoutingStepInput,
)

SAMPLE_OVERHEAD = OverheadCostInput(
    factory_rent=Decimal("0"),
    machinery_asset=Decimal("0"),
    electricity=Decimal("0"),
    telecom=Decimal("0"),
    admin=Decimal("0"),
    fixed_salary=Decimal("0"),
    expenses=Decimal("0"),
)

SAMPLE_COMMERCIALS = CommercialsInput(tax_rate=Decimal("0"), profit_margin_rate=Decimal("0"))

def test_process_routing_single_machine_amortization(pro_features):
    # Step: 60 mins setup, 12 mins cycle, rate = 1200 + 300 = 1500 INR/hr
    # Batch size: 100
    # Setup per piece: (1 hr * 1500) / 100 = 15.00
    # Run per piece: (12/60 hr * 1500) = 0.2 * 1500 = 300.00
    # Step total: 315.00
    steps = [
        RoutingStepInput(
            sequence_order=1,
            machine_name="3-Axis CNC VMC",
            setup_time_mins=Decimal("60"),
            cycle_time_mins=Decimal("12"),
            hourly_rate_inr=Decimal("1200"),
            operator_rate_inr=Decimal("300"),
        )
    ]
    direct_input = DirectCostInput(
        raw_material=Decimal("500"),
        tooling=Decimal("100"),
        labour=Decimal("50"),
        inspection=Decimal("20"),
        logistics=Decimal("30"),
        batch_size=100,
        routing_steps=steps,
    )
    payload = CostPayload(
        estimate_id="test-routing",
        currency="INR",
        direct_cost=direct_input,
        overhead_cost=SAMPLE_OVERHEAD,
        commercials=SAMPLE_COMMERCIALS,
    )
    result = calculate_cost(payload, pro_features)
    
    assert result.breakdown.direct_cost.batch_size == 100
    assert len(result.breakdown.direct_cost.routing_steps) == 1
    step_res = result.breakdown.direct_cost.routing_steps[0]
    assert step_res.setup_cost_per_piece == Decimal("15.0000")
    assert step_res.run_cost_per_piece == Decimal("300.0000")
    assert step_res.total_step_cost == Decimal("315.0000")
    assert result.breakdown.direct_cost.total_manufacturing_cost == Decimal("315.00")
    # Subtotal: 500 + 100 + 315 + 50 + 20 + 30 = 1015.00
    assert result.totals.direct_subtotal == Decimal("1015.00")
    assert result.totals.grand_total == Decimal("1015.00")

def test_process_routing_batch_size_scaling(pro_features):
    step = RoutingStepInput(
        sequence_order=1,
        machine_name="CNC Lathe",
        setup_time_mins=Decimal("120"), # 2 hours setup
        cycle_time_mins=Decimal("6"),   # 0.1 hr cycle
        hourly_rate_inr=Decimal("800"),
        operator_rate_inr=Decimal("200"), # combined 1000 INR/hr
    )
    # Total setup cost = 2 * 1000 = 2000 INR
    # Run cost = 0.1 * 1000 = 100 INR

    # Case A: Batch Size = 10 -> Setup/pc = 200 INR -> Step total = 300 INR
    d1 = DirectCostInput(
        raw_material=Decimal("0"), tooling=Decimal("0"), labour=Decimal("0"),
        inspection=Decimal("0"), logistics=Decimal("0"),
        batch_size=10, routing_steps=[step]
    )
    r1 = calculate_cost(CostPayload(estimate_id="b10", currency="INR", direct_cost=d1, overhead_cost=SAMPLE_OVERHEAD, commercials=SAMPLE_COMMERCIALS), pro_features)
    assert r1.breakdown.direct_cost.routing_steps[0].setup_cost_per_piece == Decimal("200.0000")
    assert r1.breakdown.direct_cost.total_manufacturing_cost == Decimal("300.00")

    # Case B: Batch Size = 1000 -> Setup/pc = 2 INR -> Step total = 102 INR
    d2 = DirectCostInput(
        raw_material=Decimal("0"), tooling=Decimal("0"), labour=Decimal("0"),
        inspection=Decimal("0"), logistics=Decimal("0"),
        batch_size=1000, routing_steps=[step]
    )
    r2 = calculate_cost(CostPayload(estimate_id="b1000", currency="INR", direct_cost=d2, overhead_cost=SAMPLE_OVERHEAD, commercials=SAMPLE_COMMERCIALS), pro_features)
    assert r2.breakdown.direct_cost.routing_steps[0].setup_cost_per_piece == Decimal("2.0000")
    assert r2.breakdown.direct_cost.total_manufacturing_cost == Decimal("102.00")

def test_process_routing_multi_machine_sequenced(pro_features):
    steps = [
        RoutingStepInput(
            sequence_order=1,
            machine_name="Laser Cutting",
            setup_time_mins=Decimal("15"),
            cycle_time_mins=Decimal("3"),
            hourly_rate_inr=Decimal("1500"),
            operator_rate_inr=Decimal("300"), # 1800 INR/hr
        ),
        RoutingStepInput(
            sequence_order=2,
            machine_name="CNC VMC Mill",
            setup_time_mins=Decimal("45"),
            cycle_time_mins=Decimal("9"),
            hourly_rate_inr=Decimal("1200"),
            operator_rate_inr=Decimal("300"), # 1500 INR/hr
        ),
    ]
    # Batch size = 50
    # Step 1:
    #   setup = (15/60 * 1800) / 50 = 450 / 50 = 9.00
    #   run = (3/60 * 1800) = 90.00
    #   step 1 total = 99.00
    # Step 2:
    #   setup = (45/60 * 1500) / 50 = 1125 / 50 = 22.50
    #   run = (9/60 * 1500) = 225.00
    #   step 2 total = 247.50
    # Total Mfg = 99.00 + 247.50 = 346.50
    direct_input = DirectCostInput(
        raw_material=Decimal("200"),
        tooling=Decimal("50"),
        labour=Decimal("30"),
        inspection=Decimal("10"),
        logistics=Decimal("15"),
        batch_size=50,
        routing_steps=steps,
    )
    payload = CostPayload(
        estimate_id="multi-machine",
        currency="INR",
        direct_cost=direct_input,
        overhead_cost=SAMPLE_OVERHEAD,
        commercials=SAMPLE_COMMERCIALS,
    )
    result = calculate_cost(payload, pro_features)
    assert len(result.breakdown.direct_cost.routing_steps) == 2
    assert result.breakdown.direct_cost.routing_steps[0].total_step_cost == Decimal("99.0000")
    assert result.breakdown.direct_cost.routing_steps[1].total_step_cost == Decimal("247.5000")
    assert result.breakdown.direct_cost.total_manufacturing_cost == Decimal("346.50")
    # Subtotal = 200 + 50 + 346.50 + 30 + 10 + 15 = 651.50
    assert result.totals.direct_subtotal == Decimal("651.50")
