from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from sqlalchemy import String, Numeric, Boolean, DateTime, Text, JSON, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin

class Property(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "properties"

    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    reference_no: Mapped[str] = mapped_column(String(60), nullable=False)
    property_type: Mapped[str] = mapped_column(String(50), default="APARTMENT", nullable=False) # APARTMENT, VILLA, COMMERCIAL, LAND, OFFICE, SHOP, INDUSTRIAL
    category: Mapped[str] = mapped_column(String(50), default="RESIDENTIAL", nullable=False) # RESIDENTIAL, COMMERCIAL, INDUSTRIAL
    sale_or_rent: Mapped[str] = mapped_column(String(20), default="SALE", nullable=False) # SALE, RENT
    price: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    carpet_area_sqft: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    bedrooms: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    bathrooms: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    locality: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 8), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(11, 8), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="AVAILABLE", nullable=False, index=True) # AVAILABLE, UNDER_OFFER, SOLD, RENTED
    rera_registration_no: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    owner_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    owner_phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    assigned_agent: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    amenities: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    media: Mapped[List["PropertyMedia"]] = relationship("PropertyMedia", back_populates="property", cascade="all, delete-orphan")
    documents: Mapped[List["PropertyDocument"]] = relationship("PropertyDocument", back_populates="property", cascade="all, delete-orphan")
    listing: Mapped[Optional["Listing"]] = relationship("Listing", back_populates="property", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_properties_tenant_ref", "tenant_id", "reference_no", unique=True),
        Index("ix_properties_tenant_status", "tenant_id", "status"),
        Index("ix_properties_tenant_city", "tenant_id", "city"),
    )

class PropertyMedia(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "property_media"

    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    media_type: Mapped[str] = mapped_column(String(30), default="IMAGE", nullable=False) # IMAGE, VIDEO, FLOOR_PLAN
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    caption: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="media")

class PropertyDocument(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin):
    __tablename__ = "property_documents"

    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type: Mapped[str] = mapped_column(String(50), default="TITLE_DEED", nullable=False) # TITLE_DEED, TAX_RECEIPT, RERA_APPROVAL, FLOOR_PLAN
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    property: Mapped["Property"] = relationship("Property", back_populates="documents")

class Listing(Base, UUIDPrimaryKeyMixin, TimestampMixin, TenantScopedMixin, SoftDeleteMixin):
    __tablename__ = "listings"

    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    enquiry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="listing")

