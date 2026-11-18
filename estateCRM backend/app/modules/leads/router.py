from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership, require_permission
from app.database.models.identity import Membership
from app.database.models.crm import Lead, LeadActivity, Contact
from app.database.repository import BaseTenantRepository
from app.modules.leads.schemas import LeadCreateRequest, LeadUpdateRequest, LeadActivityCreateRequest
from app.core.response import success_response

router = APIRouter(prefix="/leads", tags=["CRM & Leads"])

def lead_to_dict(lead: Lead) -> dict:
    return {
        "id": lead.id,
        "tenant_id": lead.tenant_id,
        "firstName": lead.first_name,
        "lastName": lead.last_name or "",
        "first_name": lead.first_name,
        "last_name": lead.last_name or "",
        "email": lead.email,
        "phone": lead.phone,
        "phoneE164": lead.phone,
        "status": lead.status,
        "source": lead.source,
        "budgetMin": float(lead.budget_min) if lead.budget_min else None,
        "budgetMax": float(lead.budget_max) if lead.budget_max else None,
        "budget_min": float(lead.budget_min) if lead.budget_min else None,
        "budget_max": float(lead.budget_max) if lead.budget_max else None,
        "propertyType": lead.property_type,
        "property_type": lead.property_type,
        "assignedAgent": lead.assigned_agent_name or "Alexander Wright",
        "assigned_agent_name": lead.assigned_agent_name or "Alexander Wright",
        "score": lead.score,
        "notes": lead.notes,
        "createdAt": lead.created_at.isoformat() if lead.created_at else None,
        "created_at": lead.created_at.isoformat() if lead.created_at else None,
        "updatedAt": lead.updated_at.isoformat() if lead.updated_at else None,
    }

@router.get("")
def list_leads(
    status_filter: Optional[str] = Query(None, alias="status"),
    source_filter: Optional[str] = Query(None, alias="source"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Lead, db, membership.tenant_id)
    filters = {}
    if status_filter:
        filters["status"] = status_filter
    if source_filter:
        filters["source"] = source_filter

    leads = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [lead_to_dict(l) for l in leads],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.get("/{lead_id}")
def get_lead(
    lead_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Lead, db, membership.tenant_id)
    lead = repo.get_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")
    
    data = lead_to_dict(lead)
    data["activities"] = [
        {
            "id": a.id,
            "activity_type": a.activity_type,
            "description": a.description,
            "created_by": a.created_by_name,
            "timestamp": a.created_at.isoformat()
        } for a in lead.activities
    ]
    return success_response(data)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_lead(
    req: LeadCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Lead, db, membership.tenant_id)
    first_name = req.first_name or req.firstName or "Prospective"
    last_name = req.last_name or req.lastName or "Client"
    budget_min = req.budget_min or req.budgetMin
    budget_max = req.budget_max or req.budgetMax
    prop_type = req.property_type or req.propertyType
    agent = req.assigned_agent_name or req.assignedAgent

    lead = repo.create({
        "first_name": first_name,
        "last_name": last_name,
        "email": req.email,
        "phone": req.phone,
        "status": req.status or "NEW",
        "source": req.source or "WEBSITE",
        "budget_min": budget_min,
        "budget_max": budget_max,
        "property_type": prop_type,
        "assigned_agent_name": agent,
        "score": req.score or 50,
        "notes": req.notes
    })
    return success_response(lead_to_dict(lead))

@router.patch("/{lead_id}")
@router.put("/{lead_id}")
def update_lead(
    lead_id: str,
    req: LeadUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Lead, db, membership.tenant_id)
    lead = repo.get_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")

    updates = {}
    if req.first_name or req.firstName:
        updates["first_name"] = req.first_name or req.firstName
    if req.last_name or req.lastName:
        updates["last_name"] = req.last_name or req.lastName
    if req.email:
        updates["email"] = req.email
    if req.phone:
        updates["phone"] = req.phone
    if req.status:
        updates["status"] = req.status
    if req.source:
        updates["source"] = req.source
    if req.budget_min or req.budgetMin:
        updates["budget_min"] = req.budget_min or req.budgetMin
    if req.budget_max or req.budgetMax:
        updates["budget_max"] = req.budget_max or req.budgetMax
    if req.property_type or req.propertyType:
        updates["property_type"] = req.property_type or req.propertyType
    if req.assigned_agent_name or req.assignedAgent:
        updates["assigned_agent_name"] = req.assigned_agent_name or req.assignedAgent
    if req.score is not None:
        updates["score"] = req.score
    if req.notes is not None:
        updates["notes"] = req.notes

    updated = repo.update(lead, updates)
    return success_response(lead_to_dict(updated))

@router.post("/{lead_id}/assign")
def assign_lead(
    lead_id: str,
    req: dict,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Lead, db, membership.tenant_id)
    lead = repo.get_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")
    agent = req.get("assigned_agent") or req.get("assignedAgent") or req.get("assigned_agent_name") or "Alexander Wright"
    updated = repo.update(lead, {"assigned_agent_name": agent})
    return success_response(lead_to_dict(updated))

@router.delete("/{lead_id}")
def delete_lead(
    lead_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Lead, db, membership.tenant_id)
    success = repo.delete(lead_id, soft=True)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")
    return success_response({"message": "Lead archived successfully."})

@router.post("/{lead_id}/activities", status_code=status.HTTP_201_CREATED)
def add_lead_activity(
    lead_id: str,
    req: LeadActivityCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Lead, db, membership.tenant_id)
    lead = repo.get_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")

    a_type = req.activity_type or req.activityType or "NOTE"
    desc = req.description or req.details or "Lead interaction logged."
    created_by = req.performed_by or req.performedBy or "Alexander Wright"
    act = LeadActivity(
        tenant_id=membership.tenant_id,
        lead_id=lead_id,
        activity_type=a_type,
        description=desc,
        created_by_name=created_by
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return success_response({
        "id": act.id,
        "activity_type": act.activity_type,
        "description": act.description,
        "timestamp": act.created_at.isoformat()
    })

