from typing import Optional
from datetime import datetime
from sqlalchemy import String, DateTime, Text, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin

class Enquiry(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "enquiries"

    property_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True)
    listing_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("listings.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True, index=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(50), default="WEBSITE", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="NEW", nullable=False, index=True) # NEW, IN_PROGRESS, CONVERTED, CLOSED
    assigned_agent: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    converted_lead_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

class Appointment(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "appointments"

    property_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True)
    lead_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True)
    contact_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    client_name: Mapped[str] = mapped_column(String(150), nullable=False)
    client_phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    assigned_agent: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    appointment_type: Mapped[str] = mapped_column(String(50), default="SITE_VISIT", nullable=False) # SITE_VISIT, CONSULTATION, NEGOTIATION, DOCUMENT_SIGNING
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="SCHEDULED", nullable=False, index=True) # SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED
    location: Mapped[Optional[str]] = mapped_column(String(250), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class Task(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "tasks"

    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(30), default="MEDIUM", nullable=False, index=True) # LOW, MEDIUM, HIGH, URGENT
    status: Mapped[str] = mapped_column(String(30), default="TODO", nullable=False, index=True) # TODO, IN_PROGRESS, COMPLETED, CANCELLED
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    assigned_to: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    related_to: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    lead_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    deal_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

