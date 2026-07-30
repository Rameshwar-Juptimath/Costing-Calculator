import pytest
from decimal import Decimal
from app.models.subscription import PlanFeature

@pytest.fixture
def basic_features():
    return PlanFeature(
        can_access_direct_cost=True,
        can_access_overhead_cost=False,
        can_access_tax=False,
        can_access_profit_margin=False
    )

@pytest.fixture
def pro_features():
    return PlanFeature(
        can_access_direct_cost=True,
        can_access_overhead_cost=True,
        can_access_tax=True,
        can_access_profit_margin=True
    )
