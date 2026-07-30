from decimal import Decimal
from app.services.cost_engine import calculate_cost
from app.schemas.costing import CostPayload, DirectCostInput, OverheadCostInput, CommercialsInput

SAMPLE_DIRECT = DirectCostInput(
    raw_material=Decimal("12500"),
    tooling=Decimal("3200"),
    manufacturing=Decimal("8000"),
    labour=Decimal("4500"),
    inspection=Decimal("1200"),
    logistics=Decimal("800")
)
# direct subtotal = 30200

SAMPLE_OVERHEAD = OverheadCostInput(
    factory_rent=Decimal("5000"),
    machinery_asset=Decimal("2000"),
    electricity=Decimal("800"),
    telecom=Decimal("200"),
    admin=Decimal("500"),
    fixed_salary=Decimal("3000"),
    expenses=Decimal("300")
)
# overhead subtotal = 11800

SAMPLE_COMMERCIALS = CommercialsInput(tax_rate=Decimal("18"), profit_margin_rate=Decimal("15"))
# pre_tax = 42000, tax = 7560, margin = 6300, grand_total = 55860

def test_basic_tier_total_excludes_overhead_tax_margin(basic_features):
    payload = CostPayload(estimate_id="test", currency="INR", direct_cost=SAMPLE_DIRECT, overhead_cost=SAMPLE_OVERHEAD, commercials=SAMPLE_COMMERCIALS)
    result = calculate_cost(payload, basic_features)
    assert result.totals.direct_subtotal == Decimal("30200")
    assert result.totals.overhead_subtotal == Decimal("0")
    assert result.totals.tax_amount == Decimal("0")
    assert result.totals.margin_amount == Decimal("0")
    assert result.totals.grand_total == Decimal("30200")
    assert result.breakdown.overhead_cost is None
    assert result.breakdown.commercials is None

def test_pro_tier_full_calculation(pro_features):
    payload = CostPayload(estimate_id="test", currency="INR", direct_cost=SAMPLE_DIRECT, overhead_cost=SAMPLE_OVERHEAD, commercials=SAMPLE_COMMERCIALS)
    result = calculate_cost(payload, pro_features)
    assert result.totals.direct_subtotal == Decimal("30200")
    assert result.totals.overhead_subtotal == Decimal("11800")
    assert result.totals.pre_tax_total == Decimal("42000")
    assert result.totals.tax_amount == Decimal("7560")
    assert result.totals.margin_amount == Decimal("6300")
    assert result.totals.grand_total == Decimal("55860")

def test_pro_zero_tax_rate(pro_features):
    commercials = CommercialsInput(tax_rate=Decimal("0"), profit_margin_rate=Decimal("0"))
    payload = CostPayload(estimate_id="test", currency="INR", direct_cost=SAMPLE_DIRECT, overhead_cost=SAMPLE_OVERHEAD, commercials=commercials)
    result = calculate_cost(payload, pro_features)
    assert result.totals.grand_total == Decimal("42000")
