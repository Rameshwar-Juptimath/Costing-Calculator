"""backfill quote refs

Revision ID: 0004_backfill_quote_refs
Revises: 0003_sequential_quote_ref
Create Date: 2026-08-10 13:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column

revision = '0004_backfill_quote_refs'
down_revision = '0003_sequential_quote_ref'
branch_labels = None
depends_on = None

cost_estimates = table(
    'cost_estimates',
    column('id', sa.dialects.postgresql.UUID),
    column('tenant_id', sa.dialects.postgresql.UUID),
    column('created_at', sa.DateTime),
    column('quote_number', sa.Integer),
    column('quote_ref', sa.String),
)

def upgrade() -> None:
    conn = op.get_bind()
    tenants = conn.execute(sa.select(cost_estimates.c.tenant_id).distinct()).scalars().all()
    for tenant_id in tenants:
        rows = conn.execute(
            sa.select(cost_estimates.c.id)
            .where(cost_estimates.c.tenant_id == tenant_id)
            .order_by(cost_estimates.c.created_at.asc())
        ).scalars().all()
        
        current_num = 1001
        for est_id in rows:
            ref_str = f"REF-{current_num:04d}"
            conn.execute(
                sa.update(cost_estimates)
                .where(cost_estimates.c.id == est_id)
                .values(quote_number=current_num, quote_ref=ref_str)
            )
            current_num += 1

def downgrade() -> None:
    pass
