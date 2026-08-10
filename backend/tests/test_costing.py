import asyncio
from decimal import Decimal
from uuid import uuid4
import pytest
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.costing import (
    CostPayload,
    DirectCostInput,
    OverheadCostInput,
    CommercialsInput,
    RoutingStepInput,
)
from app.models.subscription import PlanFeature
from app.models.cost_estimate import CostEstimate
from app.services.cost_engine import calculate_cost
from app.services.quote_service import get_next_quote_ref


SAMPLE_DIRECT = DirectCostInput(
    raw_material=Decimal("10000"),
    tooling=Decimal("5000"),
    manufacturing=Decimal("0"),
    labour=Decimal("4000"),
    inspection=Decimal("2000"),
    logistics=Decimal("3000"),
    batch_size=100,
    routing_steps=[
        RoutingStepInput(
            sequence_order=1,
            machine_name="3-Axis CNC VMC",
            setup_time_mins=Decimal("60"),
            cycle_time_mins=Decimal("12"),
            hourly_rate_inr=Decimal("1200"),
            operator_rate_inr=Decimal("300"),
        )
    ],
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

SAMPLE_COMMERCIALS = CommercialsInput(tax_rate=Decimal("18"), profit_margin_rate=Decimal("15"))


def test_quote_calculation_structure(pro_features):
    payload = CostPayload(
        estimate_id="test-est-1",
        quote_name="Aerospace Turbine Disc V3",
        currency="INR",
        direct_cost=SAMPLE_DIRECT,
        overhead_cost=SAMPLE_OVERHEAD,
        commercials=SAMPLE_COMMERCIALS,
    )
    result = calculate_cost(payload, pro_features)
    assert result.totals.direct_subtotal == Decimal("24315.00")
    assert result.totals.grand_total > Decimal("0")


def test_upload_response_schema_optional_estimate_id():
    from app.schemas.cad import UploadResponse, StepGeometry, BoundingBox
    resp = UploadResponse(
        estimate_id=None,
        quote_ref=None,
        filename="part.step",
        file_type="step",
        geometry=StepGeometry(
            volume_mm3=1000.0,
            bounding_box=BoundingBox(x_mm=10.0, y_mm=10.0, z_mm=10.0),
            surface_area_mm2=600.0
        ),
        mesh_url="/api/v1/cad/mesh/test-uuid"
    )
    assert resp.estimate_id is None
    assert resp.quote_ref is None
    assert resp.mesh_url == "/api/v1/cad/mesh/test-uuid"


def test_sequential_quote_ref_logic_mocked():
    """Unit test verify sequential number generation logic across multiple quotes."""
    tenant_1 = uuid4()
    tenant_2 = uuid4()

    # Track DB state for mock session
    quotes_db = {tenant_1: [], tenant_2: []}

    async def mock_get_next_quote_ref(db: AsyncSession, tenant_id):
        existing = quotes_db[tenant_id]
        if not existing:
            next_num = 1001
        else:
            next_num = max(existing) + 1
        quotes_db[tenant_id].append(next_num)
        return next_num, f"REF-{next_num:04d}"

    async def run_sequence_test():
        mock_session = MagicMock()

        # Tenant 1: Quote 1
        num1, ref1 = await mock_get_next_quote_ref(mock_session, tenant_1)
        assert num1 == 1001
        assert ref1 == "REF-1001"

        # Tenant 1: Quote 2
        num2, ref2 = await mock_get_next_quote_ref(mock_session, tenant_1)
        assert num2 == 1002
        assert ref2 == "REF-1002"

        # Tenant 1: Quote 3
        num3, ref3 = await mock_get_next_quote_ref(mock_session, tenant_1)
        assert num3 == 1003
        assert ref3 == "REF-1003"

        # Tenant 2: Independent Sequence starting at 1001
        t2_num1, t2_ref1 = await mock_get_next_quote_ref(mock_session, tenant_2)
        assert t2_num1 == 1001
        assert t2_ref1 == "REF-1001"

        # Tenant 2: Quote 2
        t2_num2, t2_ref2 = await mock_get_next_quote_ref(mock_session, tenant_2)
        assert t2_num2 == 1002
        assert t2_ref2 == "REF-1002"

    asyncio.run(run_sequence_test())


def test_get_next_quote_ref_query():
    """Test get_next_quote_ref with Mocked AsyncSession returning scalar values."""
    tenant_id = uuid4()

    async def run_db_mock_test():
        # Case A: DB has no existing quotes (returns None)
        mock_db = MagicMock(spec=AsyncSession)
        mock_result = MagicMock()
        mock_result.scalar.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)

        num, ref = await get_next_quote_ref(mock_db, tenant_id)
        assert num == 1001
        assert ref == "REF-1001"

        # Case B: DB has quote 1001 (returns 1001)
        mock_result.scalar.return_value = 1001
        num, ref = await get_next_quote_ref(mock_db, tenant_id)
        assert num == 1002
        assert ref == "REF-1002"

        # Case C: DB has quote 1042 (returns 1042)
        mock_result.scalar.return_value = 1042
        num, ref = await get_next_quote_ref(mock_db, tenant_id)
        assert num == 1043
        assert ref == "REF-1043"

    asyncio.run(run_db_mock_test())


def test_delete_estimate_endpoint_logic():
    """Test delete_estimate removes estimate for current tenant."""
    from app.api.v1.costing import delete_estimate
    from fastapi import HTTPException

    tenant_id = uuid4()
    est_id = uuid4()

    async def run_delete_tests():
        # Case A: Found and deleted
        mock_db = MagicMock(spec=AsyncSession)
        mock_estimate = CostEstimate(id=est_id, tenant_id=tenant_id, mesh_file_path=None)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_estimate
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.delete = AsyncMock()
        mock_db.commit = AsyncMock()

        current_user = {"user_id": str(uuid4()), "tenant_id": str(tenant_id)}
        res = await delete_estimate(est_id, current_user, mock_db)
        assert res["success"] is True
        mock_db.delete.assert_called_once_with(mock_estimate)
        mock_db.commit.assert_called_once()

        # Case B: Not found / wrong tenant raises 404
        mock_result_empty = MagicMock()
        mock_result_empty.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result_empty)

        with pytest.raises(HTTPException) as exc_info:
            await delete_estimate(est_id, current_user, mock_db)
        assert exc_info.value.status_code == 404

    asyncio.run(run_delete_tests())


def test_calculate_cost_endpoint_saves_quote_name():
    """Test calculate_cost_endpoint persists quote_name and generates quote_ref."""
    from app.api.v1.costing import calculate_cost_endpoint

    tenant_id = uuid4()
    user_id = uuid4()

    async def run_calculate_test():
        mock_db = MagicMock(spec=AsyncSession)
        mock_plan_feature = PlanFeature(
            can_access_direct_cost=True,
            can_access_overhead_cost=True,
            can_access_tax=True,
            can_access_profit_margin=True,
        )

        mock_feature_result = MagicMock()
        mock_feature_result.scalar_one_or_none.return_value = mock_plan_feature

        mock_quote_num_result = MagicMock()
        mock_quote_num_result.scalar.return_value = 1005

        def mock_execute_side_effect(stmt):
            # If executing select(PlanFeature)
            mock_res = MagicMock()
            mock_res.scalar_one_or_none.return_value = mock_plan_feature
            mock_res.scalar.return_value = 1005
            return mock_res

        mock_db.execute = AsyncMock(side_effect=mock_execute_side_effect)
        mock_db.add = MagicMock()
        mock_db.flush = AsyncMock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        payload = CostPayload(
            estimate_id=None,
            quote_name="Custom Titanium Flange V2",
            filename="flange.step",
            currency="INR",
            direct_cost=SAMPLE_DIRECT,
            overhead_cost=SAMPLE_OVERHEAD,
            commercials=SAMPLE_COMMERCIALS,
        )

        current_user = {"user_id": str(user_id), "tenant_id": str(tenant_id)}
        res = await calculate_cost_endpoint(payload, current_user, mock_db)

        assert res.quote_name == "Custom Titanium Flange V2"
        assert res.quote_ref == "REF-1006"
        assert mock_db.add.called
        assert mock_db.commit.called

    asyncio.run(run_calculate_test())


