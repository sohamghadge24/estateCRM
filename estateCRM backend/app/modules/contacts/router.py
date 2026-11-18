from typing import Optional, List
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.crm import Contact
from app.database.repository import BaseTenantRepository
from app.core.response import success_response

router = APIRouter(prefix="/contacts", tags=["Contacts & Clients"])

class ContactCreateRequest(BaseModel):
    fullName: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    type: Optional[str] = None
    contactType: Optional[str] = "BUYER"
    contact_type: Optional[str] = "BUYER"
    budget: Optional[str] = None
    locality: Optional[str] = None
    budgetMin: Optional[Decimal] = None
    budgetMax: Optional[Decimal] = None
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None
    preferredLocations: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    notes: Optional[str] = None

class ContactUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    type: Optional[str] = None
    contactType: Optional[str] = None
    contact_type: Optional[str] = None
    budgetMin: Optional[Decimal] = None
    budgetMax: Optional[Decimal] = None
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None
    preferredLocations: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    notes: Optional[str] = None

def contact_to_dict(c: Contact) -> dict:
    full_name = f"{c.first_name} {c.last_name or ''}".strip()
    return {
        "id": c.id,
        "tenant_id": c.tenant_id,
        "fullName": full_name,
        "full_name": full_name,
        "firstName": c.first_name,
        "lastName": c.last_name or "",
        "first_name": c.first_name,
        "last_name": c.last_name or "",
        "email": c.email,
        "phone": c.phone,
        "type": c.contact_type,
        "contactType": c.contact_type,
        "contact_type": c.contact_type,
        "budget": f"₹ {float(c.budget_min):,.0f}" if c.budget_min else None,
        "budgetMin": float(c.budget_min) if c.budget_min else None,
        "budgetMax": float(c.budget_max) if c.budget_max else None,
        "locality": c.preferred_locations[0] if (c.preferred_locations and len(c.preferred_locations) > 0) else None,
        "preferredLocations": c.preferred_locations or [],
        "notes": c.notes,
        "createdAt": c.created_at.isoformat() if c.created_at else None,
        "updatedAt": c.updated_at.isoformat() if c.updated_at else None,
    }

@router.get("")
def list_contacts(
    contact_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Contact, db, membership.tenant_id)
    filters = {}
    if contact_type:
        filters["contact_type"] = contact_type

    contacts = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [contact_to_dict(c) for c in contacts],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.get("/{contact_id}")
def get_contact(
    contact_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Contact, db, membership.tenant_id)
    c = repo.get_by_id(contact_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")
    return success_response(contact_to_dict(c))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_contact(
    req: ContactCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Contact, db, membership.tenant_id)
    first_name = req.first_name or req.firstName
    last_name = req.last_name or req.lastName
    if req.fullName and not first_name:
        parts = req.fullName.strip().split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""
    first_name = first_name or "New"
    last_name = last_name or "Contact"
    c_type = req.contact_type or req.contactType or req.type or "BUYER"
    b_min = req.budget_min or req.budgetMin
    b_max = req.budget_max or req.budgetMax
    locs = req.preferred_locations or req.preferredLocations or ([req.locality] if req.locality else [])

    c = repo.create({
        "first_name": first_name,
        "last_name": last_name,
        "email": req.email,
        "phone": req.phone,
        "contact_type": c_type,
        "budget_min": b_min,
        "budget_max": b_max,
        "preferred_locations": locs,
        "notes": req.notes
    })
    return success_response(contact_to_dict(c))

@router.patch("/{contact_id}")
@router.put("/{contact_id}")
def update_contact(
    contact_id: str,
    req: ContactUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Contact, db, membership.tenant_id)
    c = repo.get_by_id(contact_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")

    updates = {}
    if req.first_name or req.firstName:
        updates["first_name"] = req.first_name or req.firstName
    if req.last_name or req.lastName:
        updates["last_name"] = req.last_name or req.lastName
    if req.email:
        updates["email"] = req.email
    if req.phone:
        updates["phone"] = req.phone
    if req.contact_type or req.contactType:
        updates["contact_type"] = req.contact_type or req.contactType
    if req.budget_min or req.budgetMin:
        updates["budget_min"] = req.budget_min or req.budgetMin
    if req.budget_max or req.budgetMax:
        updates["budget_max"] = req.budget_max or req.budgetMax
    if req.preferred_locations or req.preferredLocations:
        updates["preferred_locations"] = req.preferred_locations or req.preferredLocations
    if req.notes is not None:
        updates["notes"] = req.notes

    updated = repo.update(c, updates)
    return success_response(contact_to_dict(updated))

@router.delete("/{contact_id}")
def delete_contact(
    contact_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Contact, db, membership.tenant_id)
    success = repo.delete(contact_id, soft=True)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found.")
    return success_response({"message": "Contact archived successfully."})

