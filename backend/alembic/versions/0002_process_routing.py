"""process routing

Revision ID: 0002_process_routing
Revises: 0001_initial
Create Date: 2026-08-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_process_routing'
down_revision = '0001_initial'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('machine_profiles',
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('machine_name', sa.String(length=255), nullable=False),
        sa.Column('hourly_rate_inr', sa.Numeric(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.Column('operator_rate_inr', sa.Numeric(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('process_routing_steps',
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('estimate_id', sa.UUID(), nullable=False),
        sa.Column('machine_profile_id', sa.UUID(), nullable=True),
        sa.Column('sequence_order', sa.Integer(), server_default='1', nullable=False),
        sa.Column('setup_time_mins', sa.Numeric(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.Column('cycle_time_mins', sa.Numeric(precision=10, scale=2), server_default='0.00', nullable=False),
        sa.ForeignKeyConstraint(['estimate_id'], ['cost_estimates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['machine_profile_id'], ['machine_profiles.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    op.execute("ALTER TABLE machine_profiles ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE machine_profiles FORCE ROW LEVEL SECURITY")
    op.execute("CREATE POLICY tenant_isolation ON machine_profiles USING (tenant_id = current_setting('app.tenant_id', true)::UUID)")

def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation ON machine_profiles")
    op.execute("ALTER TABLE machine_profiles DISABLE ROW LEVEL SECURITY")
    op.drop_table('process_routing_steps')
    op.drop_table('machine_profiles')
