from typing import Optional, List
from decimal import Decimal
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.properties import Listing, Property
from app.database.repository import BaseTenantRepository
from app.core.response import success_response

router = APIRouter(tags=["Listings & Marketplace"])

class ListingCreateRequest(BaseModel):
    propertyId: Optional[str] = None
    property_id: Optional[str] = None
    title: str
    price: Decimal
    slug: Optional[str] = None
    featured: Optional[bool] = False
    is_published: Optional[bool] = True

def listing_to_dict(l: Listing) -> dict:
    return {
        "id": l.id,
        "tenant_id": l.tenant_id,
        "propertyId": l.property_id,
        "property_id": l.property_id,
        "title": l.title,
        "slug": l.slug,
        "price": float(l.price) if l.price else 0.0,
        "isPublished": l.is_published,
        "is_published": l.is_published,
        "publishedAt": l.published_at.isoformat() if l.published_at else None,
        "featured": l.featured,
        "viewCount": l.view_count,
        "enquiryCount": l.enquiry_count,
        "property": {
            "title": l.property.title,
            "propertyType": l.property.property_type,
            "locality": l.property.locality,
            "city": l.property.city,
            "bedrooms": l.property.bedrooms,
            "bathrooms": l.property.bathrooms,
            "carpetAreaSqft": float(l.property.carpet_area_sqft) if l.property else 0.0,
        } if l.property else None,
        "createdAt": l.created_at.isoformat() if l.created_at else None,
    }

# ── Agency Workspace Listings Endpoints ──
@router.get("/listings")
def list_listings(
    published_only: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Listing, db, membership.tenant_id)
    filters = {}
    if published_only is not None:
        filters["is_published"] = published_only

    listings = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [listing_to_dict(l) for l in listings],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.get("/listings/{listing_id}")
def get_listing(
    listing_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Listing, db, membership.tenant_id)
    l = repo.get_by_id(listing_id)
    if not l:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    return success_response(listing_to_dict(l))

@router.post("/listings", status_code=status.HTTP_201_CREATED)
def create_listing(
    req: ListingCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Listing, db, membership.tenant_id)
    prop_id = req.property_id or req.propertyId
    if not prop_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="property_id is required.")

    # Generate unique slug
    base_slug = (req.slug or req.title).lower().replace(" ", "-").replace("/", "-")[:80]
    slug = req.slug if req.slug else f"{base_slug}-{uuid.uuid4().hex[:6]}"

    l = repo.create({
        "property_id": prop_id,
        "title": req.title,
        "slug": slug,
        "price": req.price,
        "is_published": req.is_published if req.is_published is not None else True,
        "published_at": datetime.now(timezone.utc) if req.is_published else None,
        "featured": req.featured or False,
        "view_count": 0,
        "enquiry_count": 0
    })
    return success_response(listing_to_dict(l))

@router.post("/listings/{listing_id}/publish")
def publish_listing(
    listing_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Listing, db, membership.tenant_id)
    l = repo.get_by_id(listing_id)
    if not l:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    
    updated = repo.update(l, {
        "is_published": True,
        "published_at": datetime.now(timezone.utc)
    })
    return success_response(listing_to_dict(updated))

@router.post("/listings/{listing_id}/unpublish")
def unpublish_listing(
    listing_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Listing, db, membership.tenant_id)
    l = repo.get_by_id(listing_id)
    if not l:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    
    updated = repo.update(l, {"is_published": False})
    return success_response(listing_to_dict(updated))

@router.patch("/listings/{listing_id}/status")
def update_listing_status(
    listing_id: str,
    req: dict,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Listing, db, membership.tenant_id)
    l = repo.get_by_id(listing_id)
    if not l:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    st = req.get("status")
    is_pub = (st == "PUBLISHED") if st else l.is_published
    updated = repo.update(l, {
        "is_published": is_pub,
        "published_at": datetime.now(timezone.utc) if is_pub else l.published_at
    })
    return success_response(listing_to_dict(updated))

# ── Public Property Portal Endpoints (Unauthenticated) ──
@router.get("/public/listings")
def list_public_listings(
    city: Optional[str] = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Listing).filter(Listing.is_published == True, Listing.is_archived == False)
    if min_price:
        query = query.filter(Listing.price >= min_price)
    if max_price:
        query = query.filter(Listing.price <= max_price)
    
    listings = query.order_by(Listing.published_at.desc()).offset(skip).limit(limit).all()
    total = query.count()
    return success_response(
        [listing_to_dict(l) for l in listings],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.get("/public/listings/{slug}")
def get_public_listing_by_slug(slug: str, db: Session = Depends(get_db)):
    l = db.query(Listing).filter(Listing.slug == slug, Listing.is_published == True).first()
    if not l:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Public listing not found.")
    
    # Increment view counter
    l.view_count += 1
    db.commit()
    return success_response(listing_to_dict(l))

