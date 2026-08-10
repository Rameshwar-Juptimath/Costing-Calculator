"""sequential quote ref

Revision ID: 0003_sequential_quote_ref
Revises: 0002_process_routing
Create Date: 2026-08-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_sequential_quote_ref'
down_revision = '0002_process_routing'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('cost_estimates', sa.Column('quote_number', sa.Integer(), nullable=True))
    op.add_column('cost_estimates', sa.Column('quote_ref', sa.String(length=50), nullable=True))
    op.create_index('ix_cost_estimates_quote_number', 'cost_estimates', ['quote_number'], unique=False)
    op.create_index('ix_cost_estimates_quote_ref', 'cost_estimates', ['quote_ref'], unique=False)

def downgrade() -> None:
    op.drop_index('ix_cost_estimates_quote_ref', table_name='cost_estimates')
    op.drop_index('ix_cost_estimates_quote_number', table_name='cost_estimates')
    op.drop_column('cost_estimates', 'quote_ref')
    op.drop_column('cost_estimates', 'quote_number')
