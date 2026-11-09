"""Create isolated FastAPI foundation tables; leave Node legacy schema untouched."""
from alembic import op
import sqlalchemy as sa
revision = '0001_v2_foundation'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('v2_orders',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('reference', sa.String(80), nullable=False),
        sa.Column('service', sa.String(30), nullable=False),
        sa.Column('customer_reference', sa.String(60), nullable=False),
        sa.Column('amount_kobo', sa.BigInteger(), nullable=False),
        sa.Column('status', sa.String(24), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('amount_kobo > 0', name='v2_order_amount_positive'),
        sa.UniqueConstraint('reference', name='uq_v2_order_reference'))
    op.create_table('v2_payment_attempts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('order_id', sa.String(36), sa.ForeignKey('v2_orders.id'), nullable=False),
        sa.Column('gateway_reference', sa.String(100), nullable=False),
        sa.Column('status', sa.String(24), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('gateway_reference', name='uq_v2_gateway_reference'))


def downgrade():
    op.drop_table('v2_payment_attempts')
    op.drop_table('v2_orders')
