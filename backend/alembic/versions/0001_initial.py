"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-07-30 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('subscription_tiers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_table('plan_features',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tier_id', sa.Integer(), nullable=False),
        sa.Column('can_access_direct_cost', sa.Boolean(), nullable=False),
        sa.Column('can_access_overhead_cost', sa.Boolean(), nullable=False),
        sa.Column('can_access_tax', sa.Boolean(), nullable=False),
        sa.Column('can_access_profit_margin', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['tier_id'], ['subscription_tiers.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tier_id')
    )
    op.create_table('tenants',
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_table('tenant_subscriptions',
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('tier_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('valid_until', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.ForeignKeyConstraint(['tier_id'], ['subscription_tiers.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id')
    )
    op.create_table('users',
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_table('cost_estimates',
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=10), nullable=False),
        sa.Column('geometry_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('direct_cost', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('overhead_cost', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('commercials', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('grand_total', sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('tier_applied', sa.String(length=20), nullable=True),
        sa.Column('mesh_file_path', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.execute("ALTER TABLE cost_estimates ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE cost_estimates FORCE ROW LEVEL SECURITY")
    op.execute("CREATE POLICY tenant_isolation ON cost_estimates USING (tenant_id = current_setting('app.tenant_id', true)::UUID)")
    
    op.execute("ALTER TABLE users ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE users FORCE ROW LEVEL SECURITY")
    op.execute("CREATE POLICY tenant_isolation ON users USING (tenant_id = current_setting('app.tenant_id', true)::UUID)")

def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS tenant_isolation ON users")
    op.execute("ALTER TABLE users DISABLE ROW LEVEL SECURITY")
    op.execute("DROP POLICY IF EXISTS tenant_isolation ON cost_estimates")
    op.execute("ALTER TABLE cost_estimates DISABLE ROW LEVEL SECURITY")
    op.drop_table('cost_estimates')
    op.drop_table('users')
    op.drop_table('tenant_subscriptions')
    op.drop_table('tenants')
    op.drop_table('plan_features')
    op.drop_table('subscription_tiers')
