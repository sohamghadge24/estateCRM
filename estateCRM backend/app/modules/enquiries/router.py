from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.engagement import Enquiry
from app.database.models.properties import Listing, Property
from app.database.models.crm import Lead
from app.database.repository import BaseTenantRepository
from app.core.response import success_response

router = APIRouter(tags=["Inbound Enquiries"])

class EnquiryCreateRequest(BaseModel):
    propertyId: Optional[str] = None
    property_id: Optional[str] = None
    listingId: Optional[str] = None
    listing_id: Optional[str] = None
    name: Optional[str] = None
    clientName: Optional[str] = None
    client_name: Optional[str] = None
    email: Optional[EmailStr] = None
    clientEmail: Optional[EmailStr] = None
    client_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    clientPhone: Optional[str] = None
    client_phone: Optional[str] = None
    message: Optional[str] = None
    source: Optional[str] = "WEBSITE"

class EnquiryUpdateRequest(BaseModel):
    status: Optional[str] = None
    assignedAgent: Optional[str] = None
    assigned_agent: Optional[str] = None

def enquiry_to_dict(e: Enquiry) -> dict:
    return {
        "id": e.id,
        "tenant_id": e.tenant_id,
        "propertyId": e.property_id,
        "property_id": e.property_id,
        "listingId": e.listing_id,
        "listing_id": e.listing_id,
        "name": e.name,
        "clientName": e.name,
        "client_name": e.name,
        "email": e.email,
        "clientEmail": e.email,
        "client_email": e.email,
        "phone": e.phone,
        "clientPhone": e.phone,
        "client_phone": e.phone,
        "message": e.message,
        "source": e.source,
        "status": e.status,
        "assignedAgent": e.assigned_agent or "Alexander Wright",
        "assigned_agent": e.assigned_agent or "Alexander Wright",
        "convertedLeadId": e.converted_lead_id,
        "converted_lead_id": e.converted_lead_id,
        "createdAt": e.created_at.isoformat() if e.created_at else None,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }

@router.get("/enquiries")
def list_enquiries(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Enquiry, db, membership.tenant_id)
    filters = {}
    if status_filter:
        filters["status"] = status_filter

    enquiries = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [enquiry_to_dict(e) for e in enquiries],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.post("/enquiries", status_code=status.HTTP_201_CREATED)
def create_enquiry(
    req: EnquiryCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Enquiry, db, membership.tenant_id)
    prop_id = req.property_id or req.propertyId
    list_id = req.listing_id or req.listingId
    e = repo.create({
        "property_id": prop_id,
        "listing_id": list_id,
        "name": req.name,
        "email": req.email,
        "phone": req.phone,
        "message": req.message,
        "source": req.source or "WEBSITE",
        "status": "NEW",
        "assigned_agent": "Alexander Wright"
    })
    return success_response(enquiry_to_dict(e))

@router.get("/enquiries/{enquiry_id}")
def get_enquiry(
    enquiry_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Enquiry, db, membership.tenant_id)
    e = repo.get_by_id(enquiry_id)
    if not e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found.")
    return success_response(enquiry_to_dict(e))

@router.patch("/enquiries/{enquiry_id}")
def update_enquiry(
    enquiry_id: str,
    req: EnquiryUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Enquiry, db, membership.tenant_id)
    e = repo.get_by_id(enquiry_id)
    if not e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found.")
    
    updates = {}
    if req.status: updates["status"] = req.status
    if req.assigned_agent or req.assignedAgent:
        updates["assigned_agent"] = req.assigned_agent or req.assignedAgent
    
    updated = repo.update(e, updates)
    return success_response(enquiry_to_dict(updated))

@router.post("/enquiries/{enquiry_id}/convert")
def convert_enquiry_to_lead(
    enquiry_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Enquiry, db, membership.tenant_id)
    e = repo.get_by_id(enquiry_id)
    if not e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found.")

    lead_repo = BaseTenantRepository(Lead, db, membership.tenant_id)
    parts = e.name.split(" ", 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else "Client"

    new_lead = lead_repo.create({
        "first_name": first_name,
        "last_name": last_name,
        "email": e.email,
        "phone": e.phone,
        "status": "QUALIFIED",
        "source": "INBOUND_ENQUIRY",
        "assigned_agent_name": e.assigned_agent or "Alexander Wright",
        "notes": f"Converted from Inbound Enquiry: {e.message or 'N/A'}"
    })

    repo.update(e, {
        "status": "CONVERTED",
        "converted_lead_id": new_lead.id
    })

    return success_response({
        "message": "Enquiry converted to Lead successfully.",
        "lead_id": new_lead.id,
        "enquiry_id": e.id,
        "lead": {
            "id": new_lead.id,
            "firstName": new_lead.first_name,
            "lastName": new_lead.last_name,
            "email": new_lead.email,
            "phone": new_lead.phone,
            "status": new_lead.status,
            "source": new_lead.source
        }
    })

# ── Public Listing Enquiry Capture ──
@router.post("/public/listings/{slug}/enquiries", status_code=status.HTTP_201_CREATED)
def submit_public_enquiry(
    slug: str,
    req: EnquiryCreateRequest,
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.slug == slug, Listing.is_published == True).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")

    c_name = req.client_name or req.clientName or req.name or "Prospective Client"
    c_email = req.client_email or req.clientEmail or req.email
    c_phone = req.client_phone or req.clientPhone or req.phone

    e = Enquiry(
        tenant_id=listing.tenant_id,
        listing_id=listing.id,
        property_id=listing.property_id,
        name=c_name,
        email=c_email,
        phone=c_phone,
        message=req.message,
        source="PUBLIC_PORTAL",
        status="NEW",
        assigned_agent="Alexander Wright"
    )
    db.add(e)
    # Increment listing enquiry count
    listing.enquiry_count += 1
    db.commit()
    db.refresh(e)
    return success_response({
        "id": e.id,
        "enquiry_id": e.id,
        "message": "Thank you! Your enquiry has been received by the listing agent.",
    })

