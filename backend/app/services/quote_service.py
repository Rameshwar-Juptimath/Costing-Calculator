from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.cost_estimate import CostEstimate

async def get_next_quote_ref(db: AsyncSession, tenant_id: UUID) -> tuple[int, str]:
    """
    Computes the next sequential quote number and formatted reference for a tenant.
    Sequential scheme: REF-1001, REF-1002, REF-1003, ...
    """
    stmt = select(func.max(CostEstimate.quote_number)).where(CostEstimate.tenant_id == tenant_id)
    result = await db.execute(stmt)
    max_number = result.scalar()

    if max_number is None or max_number < 1000:
        next_number = 1001
    else:
        next_number = max_number + 1

    quote_ref = f"REF-{next_number:04d}"
    return next_number, quote_ref
