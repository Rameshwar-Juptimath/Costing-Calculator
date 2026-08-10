"""add quote_name to cost_estimates

Revision ID: 0006_quote_name
Revises: 0005_material_machinability
Create Date: 2026-08-11 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0006_quote_name'
down_revision = '0005_material_machinability'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('cost_estimates', sa.Column('quote_name', sa.String(length=255), nullable=True))

def downgrade() -> None:
    op.drop_column('cost_estimates', 'quote_name')
