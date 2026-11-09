"""Customer accounts and revocable sessions; legacy orders remain unassigned."""
from alembic import op
import sqlalchemy as sa

revision = "0002_customer_accounts"
down_revision = "0001_v2_foundation"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("v2_customers",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False))
    op.create_table("v2_customer_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("customer_id", sa.String(36), sa.ForeignKey("v2_customers.id"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_v2_customer_sessions_customer_id", "v2_customer_sessions", ["customer_id"])
    op.add_column("v2_orders", sa.Column("customer_id", sa.String(36), nullable=True))
    op.create_foreign_key("fk_v2_orders_customer", "v2_orders", "v2_customers", ["customer_id"], ["id"])
    op.create_index("ix_v2_orders_customer_id", "v2_orders", ["customer_id"])


def downgrade():
    op.drop_index("ix_v2_orders_customer_id", "v2_orders")
    op.drop_constraint("fk_v2_orders_customer", "v2_orders", type_="foreignkey")
    op.drop_column("v2_orders", "customer_id")
    op.drop_index("ix_v2_customer_sessions_customer_id", "v2_customer_sessions")
    op.drop_table("v2_customer_sessions")
    op.drop_table("v2_customers")
