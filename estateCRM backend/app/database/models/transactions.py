from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from sqlalchemy import String, Numeric, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin

class Deal(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "deals"

    deal_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    property_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True)
    property_title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    contact_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True, index=True)
    client_name: Mapped[str] = mapped_column(String(150), nullable=False)
    lead_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    assigned_agent: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    stage: Mapped[str] = mapped_column(String(50), default="DISCOVERY", nullable=False, index=True) # DISCOVERY, PROPOSAL, NEGOTIATION, UNDER_CONTRACT, CLOSED_WON, CLOSED_LOST
    deal_value: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    commission_rate_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("2.00"), nullable=False)
    commission_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    expected_close_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    payments: Mapped[List["DealPayment"]] = relationship("DealPayment", back_populates="deal", cascade="all, delete-orphan")
    commissions: Mapped[List["Commission"]] = relationship("Commission", back_populates="deal", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_deals_tenant_stage", "tenant_id", "stage"),
    )

class DealPayment(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "deal_payments"

    deal_id: Mapped[str] = mapped_column(String(36), ForeignKey("deals.id", ondelete="CASCADE"), nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    payment_type: Mapped[str] = mapped_column(String(50), default="TOKEN", nullable=False) # TOKEN, ADVANCE, MILESTONE, FINAL_SETTLEMENT
    payment_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="BANK_TRANSFER", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="RECEIVED", nullable=False) # PENDING, RECEIVED, RECONCILED
    reference_no: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    deal: Mapped["Deal"] = relationship("Deal", back_populates="payments")

class Commission(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "commissions"

    deal_id: Mapped[str] = mapped_column(String(36), ForeignKey("deals.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name: Mapped[str] = mapped_column(String(150), nullable=False)
    total_commission: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    agent_split_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("50.00"), nullable=False)
    agent_payout: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    agency_retained: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACCRUED", nullable=False, index=True) # ACCRUED, APPROVED, PAID
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    deal: Mapped["Deal"] = relationship("Deal", back_populates="commissions")

