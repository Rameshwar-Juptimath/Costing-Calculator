"""material machinability

Revision ID: 0005_material_machinability
Revises: 0004_backfill_quote_refs
Create Date: 2026-08-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0005_material_machinability'
down_revision = '0004_backfill_quote_refs'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('material_machinability',
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('material_name', sa.String(length=255), nullable=False),
        sa.Column('cutting_speed_m_min', sa.Float(), nullable=False),
        sa.Column('feed_rate_mm_rev', sa.Float(), nullable=False),
        sa.Column('density_g_cm3', sa.Float(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.execute("ALTER TABLE material_machinability ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE material_machinability FORCE ROW LEVEL SECURITY")
    op.execute("CREATE POLICY tenant_isolation ON material_machinability USING (tenant_id = current_setting('app.tenant_id', true)::UUID)")

def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation ON material_machinability")
    op.execute("ALTER TABLE material_machinability DISABLE ROW LEVEL SECURITY")
    op.drop_table('material_machinability')
