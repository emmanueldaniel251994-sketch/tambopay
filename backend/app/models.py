import uuid
from datetime import datetime, timezone
from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base


class Order(Base):
    __tablename__ = 'v2_orders'
    __table_args__ = (CheckConstraint('amount_kobo > 0', name='v2_order_amount_positive'), UniqueConstraint('reference', name='uq_v2_order_reference'))
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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
