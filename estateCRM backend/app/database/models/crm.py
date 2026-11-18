from typing import Optional, List
from decimal import Decimal
from sqlalchemy import String, Numeric, Text, JSON, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin

class Contact(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "contacts"

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True, index=True)
    contact_type: Mapped[str] = mapped_column(String(50), default="BUYER", nullable=False) # BUYER, SELLER, LANDLORD, TENANT, INVESTOR
    budget_min: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    budget_max: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    preferred_locations: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    leads: Mapped[List["Lead"]] = relationship("Lead", back_populates="contact")

    __table_args__ = (
        Index("ix_contacts_tenant_email", "tenant_id", "email"),
        Index("ix_contacts_tenant_phone", "tenant_id", "phone"),
    )

class Lead(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "leads"

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="NEW", nullable=False, index=True) # NEW, CONTACTED, QUALIFIED, SITE_VISIT, NEGOTIATION, CONVERTED, LOST
    source: Mapped[str] = mapped_column(String(50), default="WEBSITE", nullable=False) # WEBSITE, REFERRAL, WALK_IN, CAMPAIGN, PORTAL
    budget_min: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    budget_max: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    property_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    assigned_agent_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    assigned_agent_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    contact_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True)
    score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    contact: Mapped[Optional["Contact"]] = relationship("Contact", back_populates="leads")
    activities: Mapped[List["LeadActivity"]] = relationship("LeadActivity", back_populates="lead", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_leads_tenant_status", "tenant_id", "status"),
        Index("ix_leads_tenant_agent", "tenant_id", "assigned_agent_id"),
    )

class LeadActivity(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "lead_activities"

    lead_id: Mapped[str] = mapped_column(String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False) # CALL, EMAIL, MEETING, NOTE, STAGE_CHANGE
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_by_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    created_by_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="activities")

