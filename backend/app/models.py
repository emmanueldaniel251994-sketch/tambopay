import uuid
from datetime import datetime, timezone
from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base


class Customer(Base):
    __tablename__ = "v2_customers"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)


class CustomerSession(Base):
    __tablename__ = "v2_customer_sessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("v2_customers.id"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Order(Base):
    __tablename__ = 'v2_orders'
    __table_args__ = (CheckConstraint('amount_kobo > 0', name='v2_order_amount_positive'), UniqueConstraint('reference', name='uq_v2_order_reference'))
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id: Mapped[str | None] = mapped_column(ForeignKey('v2_customers.id'), nullable=True, index=True)
    reference: Mapped[str] = mapped_column(String(80), nullable=False)
    service: Mapped[str] = mapped_column(String(30), nullable=False)
    customer_reference: Mapped[str] = mapped_column(String(60), nullable=False)
    amount_kobo: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str] = mapped_column(String(24), default='pending_payment', nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    attempts: Mapped[list['PaymentAttempt']] = relationship(back_populates='order')


class PaymentAttempt(Base):
    __tablename__ = 'v2_payment_attempts'
    __table_args__ = (UniqueConstraint('gateway_reference', name='uq_v2_gateway_reference'),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(ForeignKey('v2_orders.id'), nullable=False)
    gateway_reference: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(24), default='initialized', nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    order: Mapped[Order] = relationship(back_populates='attempts')
