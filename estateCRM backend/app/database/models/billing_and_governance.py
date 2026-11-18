from typing import Optional
from decimal import Decimal
from datetime import datetime
from sqlalchemy import String, Numeric, Boolean, DateTime, Text, JSON, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin

class Plan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "plans"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False) # STARTER, PRO, ENTERPRISE
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    price_monthly: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    price_annual: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    max_agents: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    max_properties: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    features: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

class Subscription(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "subscriptions"

    plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("plans.id"), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(100), default="PRO", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False, index=True) # TRIAL, ACTIVE, PAST_DUE, CANCELLED
    current_period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    current_period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

class Invoice(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "invoices"

    subscription_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    invoice_number: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PAID", nullable=False) # PAID, UNPAID, VOID
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

class AuditLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "audit_logs"

    tenant_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    actor_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    actor_name: Mapped[str] = mapped_column(String(150), default="System", nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    entity: Mapped[str] = mapped_column(String(200), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), default="GENERAL", nullable=False, index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="SUCCESS", nullable=False)

