from typing import Optional, List
from decimal import Decimal
import uuid
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.properties import Property, PropertyMedia, PropertyDocument, Listing
from app.database.repository import BaseTenantRepository
from app.core.response import success_response

router = APIRouter(prefix="/properties", tags=["Property Management"])

class PropertyCreateRequest(BaseModel):
    title: str
    referenceNo: Optional[str] = None
    reference_no: Optional[str] = None
    propertyType: Optional[str] = "APARTMENT"
    property_type: Optional[str] = "APARTMENT"
    category: Optional[str] = "RESIDENTIAL"
    saleOrRent: Optional[str] = "SALE"
    sale_or_rent: Optional[str] = "SALE"
    price: Decimal
    carpetAreaSqft: Optional[Decimal] = None
    carpet_area_sqft: Optional[Decimal] = None
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    locality: str
    city: str
    state: Optional[str] = None
    country: Optional[str] = "India"
    postalCode: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    status: Optional[str] = "AVAILABLE"
    reraRegistrationNo: Optional[str] = None
    rera_registration_no: Optional[str] = None
    ownerName: Optional[str] = None
    owner_name: Optional[str] = None
    ownerPhone: Optional[str] = None
    owner_phone: Optional[str] = None
    assignedAgent: Optional[str] = None
    assigned_agent: Optional[str] = None
    featured: Optional[bool] = False
    description: Optional[str] = None
    amenities: Optional[List[str]] = None

class PropertyUpdateRequest(BaseModel):
    title: Optional[str] = None
    propertyType: Optional[str] = None
    property_type: Optional[str] = None
    category: Optional[str] = None
    saleOrRent: Optional[str] = None
    sale_or_rent: Optional[str] = None
    price: Optional[Decimal] = None
    carpetAreaSqft: Optional[Decimal] = None
    carpet_area_sqft: Optional[Decimal] = None
    bedrooms: Optional[str] = None
    bathrooms: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = None
    status: Optional[str] = None
    reraRegistrationNo: Optional[str] = None
    rera_registration_no: Optional[str] = None
    ownerName: Optional[str] = None
    owner_name: Optional[str] = None
    ownerPhone: Optional[str] = None
    owner_phone: Optional[str] = None
    assignedAgent: Optional[str] = None
    assigned_agent: Optional[str] = None
    featured: Optional[bool] = None
    description: Optional[str] = None
    amenities: Optional[List[str]] = None

def property_to_dict(p: Property) -> dict:
    return {
        "id": p.id,
        "tenant_id": p.tenant_id,
        "title": p.title,
        "referenceNo": p.reference_no,
        "reference_no": p.reference_no,
        "propertyType": p.property_type,
        "property_type": p.property_type,
        "category": p.category,
        "saleOrRent": p.sale_or_rent,
        "sale_or_rent": p.sale_or_rent,
        "price": float(p.price) if p.price else 0.0,
        "carpetAreaSqft": float(p.carpet_area_sqft) if p.carpet_area_sqft else 0.0,
        "carpet_area_sqft": float(p.carpet_area_sqft) if p.carpet_area_sqft else 0.0,
        "bedrooms": p.bedrooms,
        "bathrooms": p.bathrooms,
        "locality": p.locality,
        "city": p.city,
        "state": p.state,
        "country": p.country,
        "postalCode": p.postal_code,
        "status": p.status,
        "reraRegistrationNo": p.rera_registration_no,
        "rera_registration_no": p.rera_registration_no,
        "ownerName": p.owner_name,
        "owner_name": p.owner_name,
        "ownerPhone": p.owner_phone,
        "owner_phone": p.owner_phone,
        "assignedAgent": p.assigned_agent or "Alexander Wright",
        "assigned_agent": p.assigned_agent or "Alexander Wright",
        "featured": p.featured,
        "description": p.description,
        "amenities": p.amenities or [],
        "createdAt": p.created_at.isoformat() if p.created_at else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updatedAt": p.updated_at.isoformat() if p.updated_at else None,
    }

@router.get("")
def list_properties(
    city: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    featured: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Property, db, membership.tenant_id)
    filters = {}
    if city:
        filters["city"] = city
    if property_type:
        filters["property_type"] = property_type
    if status_filter:
        filters["status"] = status_filter
    if featured is not None:
        filters["featured"] = featured

    properties = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [property_to_dict(p) for p in properties],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.get("/search")
def search_properties(
    q: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    query = db.query(Property).filter(Property.tenant_id == membership.tenant_id, Property.is_archived == False)
    if q:
        query = query.filter((Property.title.ilike(f"%{q}%")) | (Property.locality.ilike(f"%{q}%")) | (Property.reference_no.ilike(f"%{q}%")))
    if city:
        query = query.filter(Property.city == city)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if status_filter:
        query = query.filter(Property.status == status_filter)
    
    total = query.count()
    properties = query.offset(skip).limit(limit).all()
    return success_response(
        [property_to_dict(p) for p in properties],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.get("/{property_id}")
def get_property(
    property_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Property, db, membership.tenant_id)
    p = repo.get_by_id(property_id)
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")

    data = property_to_dict(p)
    data["media"] = [
        {"id": m.id, "media_type": m.media_type, "url": m.url, "caption": m.caption}
        for m in p.media
    ]
    data["documents"] = [
        {"id": d.id, "document_type": d.document_type, "title": d.title, "file_url": d.file_url}
        for d in p.documents
    ]
    return success_response(data)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_property(
    req: PropertyCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Property, db, membership.tenant_id)
    ref = req.reference_no or req.referenceNo or f"PROP-{uuid.uuid4().hex[:6].upper()}"
    p_type = req.property_type or req.propertyType or "APARTMENT"
    category = req.category or "RESIDENTIAL"
    sale_rent = req.sale_or_rent or req.saleOrRent or "SALE"
    area = req.carpet_area_sqft or req.carpetAreaSqft or Decimal("1000.00")
    rera = req.rera_registration_no or req.reraRegistrationNo
    owner_name = req.owner_name or req.ownerName
    owner_phone = req.owner_phone or req.ownerPhone
    agent = req.assigned_agent or req.assignedAgent

    p = repo.create({
        "title": req.title,
        "reference_no": ref,
        "property_type": p_type,
        "category": category,
        "sale_or_rent": sale_rent,
        "price": req.price,
        "carpet_area_sqft": area,
        "bedrooms": req.bedrooms,
        "bathrooms": req.bathrooms,
        "locality": req.locality,
        "city": req.city,
        "state": req.state,
        "country": req.country or "India",
        "postal_code": req.postal_code or req.postalCode,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "status": req.status or "AVAILABLE",
        "rera_registration_no": rera,
        "owner_name": owner_name,
        "owner_phone": owner_phone,
        "assigned_agent": agent,
        "featured": req.featured or False,
        "description": req.description,
        "amenities": req.amenities or []
    })
    return success_response(property_to_dict(p))

@router.patch("/{property_id}")
@router.put("/{property_id}")
def update_property(
    property_id: str,
    req: PropertyUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Property, db, membership.tenant_id)
    p = repo.get_by_id(property_id)
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")

    updates = {}
    if req.title: updates["title"] = req.title
    if req.property_type or req.propertyType: updates["property_type"] = req.property_type or req.propertyType
    if req.category: updates["category"] = req.category
    if req.sale_or_rent or req.saleOrRent: updates["sale_or_rent"] = req.sale_or_rent or req.saleOrRent
    if req.price is not None: updates["price"] = req.price
    if req.carpet_area_sqft or req.carpetAreaSqft: updates["carpet_area_sqft"] = req.carpet_area_sqft or req.carpetAreaSqft
    if req.bedrooms: updates["bedrooms"] = req.bedrooms
    if req.bathrooms: updates["bathrooms"] = req.bathrooms
    if req.locality: updates["locality"] = req.locality
    if req.city: updates["city"] = req.city
    if req.status: updates["status"] = req.status
    if req.rera_registration_no or req.reraRegistrationNo: updates["rera_registration_no"] = req.rera_registration_no or req.reraRegistrationNo
    if req.owner_name or req.ownerName: updates["owner_name"] = req.owner_name or req.ownerName
    if req.owner_phone or req.ownerPhone: updates["owner_phone"] = req.owner_phone or req.ownerPhone
    if req.assigned_agent or req.assignedAgent: updates["assigned_agent"] = req.assigned_agent or req.assignedAgent
    if req.featured is not None: updates["featured"] = req.featured
    if req.description is not None: updates["description"] = req.description
    if req.amenities is not None: updates["amenities"] = req.amenities

    updated = repo.update(p, updates)
    return success_response(property_to_dict(updated))

@router.delete("/{property_id}")
def delete_property(
    property_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Property, db, membership.tenant_id)
    success = repo.delete(property_id, soft=True)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")
    return success_response({"message": "Property archived successfully."})
