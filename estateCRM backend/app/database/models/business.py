from typing import Optional
from decimal import Decimal
from datetime import datetime
from sqlalchemy import String, Numeric, DateTime, Text, Integer, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin

class FinanceTransaction(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "finance_transactions"

    transaction_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # REVENUE, EXPENSE, COMMISSION_PAYOUT
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    transaction_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(250), nullable=True)
    reference_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="SETTLED", nullable=False)

class Expense(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "expenses"

    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    expense_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    description: Mapped[str] = mapped_column(String(250), nullable=False)
    vendor_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    approved_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(50), default="BANK_TRANSFER", nullable=False)

class Campaign(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "campaigns"

    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    channel: Mapped[str] = mapped_column(String(50), default="DIGITAL_ADS", nullable=False) # DIGITAL_ADS, PRINT, PORTAL, SOCIAL_MEDIA, EMAIL
    budget: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    actual_spend: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=Decimal("0.00"), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False, index=True) # PLANNING, ACTIVE, COMPLETED, PAUSED
    leads_generated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    deals_closed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

class CommunicationLog(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "communication_logs"

    channel: Mapped[str] = mapped_column(String(30), nullable=False, index=True) # EMAIL, SMS, WHATSAPP, CALL
    recipient: Mapped[str] = mapped_column(String(150), nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(250), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SENT", nullable=False, index=True) # QUEUED, SENT, DELIVERED, FAILED
    provider_reference: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)

class DocumentVault(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "documents"

    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), default="AGREEMENT", nullable=False) # AGREEMENT, KYC, DEED, BROCHURE, AUDIT
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    access_level: Mapped[str] = mapped_column(String(50), default="CONFIDENTIAL", nullable=False) # PUBLIC, INTERNAL, CONFIDENTIAL
    uploaded_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)

