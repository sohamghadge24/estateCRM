from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.engagement import Appointment
from app.database.repository import BaseTenantRepository
from app.core.response import success_response

router = APIRouter(prefix="/appointments", tags=["Appointments & Site Visits"])

class AppointmentCreateRequest(BaseModel):
    title: str
    clientName: Optional[str] = None
    client_name: Optional[str] = None
    clientPhone: Optional[str] = None
    client_phone: Optional[str] = None
    propertyId: Optional[str] = None
    property_id: Optional[str] = None
    leadId: Optional[str] = None
    lead_id: Optional[str] = None
    appointmentType: Optional[str] = "SITE_VISIT"
    appointment_type: Optional[str] = "SITE_VISIT"
    scheduledAt: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None
    date: Optional[str] = None
    time: Optional[str] = None
    durationMinutes: Optional[int] = 60
    assignedAgent: Optional[str] = None
    assigned_agent: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class AppointmentUpdateRequest(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    scheduledAt: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None
    feedback: Optional[str] = None
    notes: Optional[str] = None

def appointment_to_dict(a: Appointment) -> dict:
    scheduled_str = a.scheduled_at.isoformat() if a.scheduled_at else None
    return {
        "id": a.id,
        "tenant_id": a.tenant_id,
        "title": a.title,
        "clientName": a.client_name,
        "client_name": a.client_name,
        "clientPhone": a.client_phone,
        "propertyId": a.property_id,
        "property_id": a.property_id,
        "leadId": a.lead_id,
        "lead_id": a.lead_id,
        "appointmentType": a.appointment_type,
        "appointment_type": a.appointment_type,
        "scheduledAt": scheduled_str,
        "scheduled_at": scheduled_str,
        "date": a.scheduled_at.strftime("%Y-%m-%d") if a.scheduled_at else "Today",
        "time": a.scheduled_at.strftime("%H:%M") if a.scheduled_at else "14:30",
        "durationMinutes": a.duration_minutes,
        "status": a.status,
        "assignedAgent": a.assigned_agent or "Alexander Wright",
        "location": a.location,
        "notes": a.notes,
        "feedback": a.feedback,
        "createdAt": a.created_at.isoformat() if a.created_at else None,
    }

@router.get("")
def list_appointments(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Appointment, db, membership.tenant_id)
    filters = {}
    if status_filter:
        filters["status"] = status_filter

    appointments = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [appointment_to_dict(a) for a in appointments],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.get("/{appointment_id}")
def get_appointment(
    appointment_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Appointment, db, membership.tenant_id)
    a = repo.get_by_id(appointment_id)
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
    return success_response(appointment_to_dict(a))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_appointment(
    req: AppointmentCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Appointment, db, membership.tenant_id)
    c_name = req.client_name or req.clientName or "Valued Client"
    c_phone = req.client_phone or req.clientPhone
    prop_id = req.property_id or req.propertyId
    lead_id = req.lead_id or req.leadId
    a_type = req.appointment_type or req.appointmentType or "SITE_VISIT"
    agent = req.assigned_agent or req.assignedAgent or "Alexander Wright"
    
    # Resolve timestamp
    sched = req.scheduled_at or req.scheduledAt
    if not sched:
        sched = datetime.now(timezone.utc)

    a = repo.create({
        "title": req.title,
        "client_name": c_name,
        "client_phone": c_phone,
        "property_id": prop_id,
        "lead_id": lead_id,
        "appointment_type": a_type,
        "scheduled_at": sched,
        "duration_minutes": req.durationMinutes or 60,
        "status": "SCHEDULED",
        "assigned_agent": agent,
        "location": req.location,
        "notes": req.notes
    })
    return success_response(appointment_to_dict(a))

@router.patch("/{appointment_id}")
@router.put("/{appointment_id}")
def update_appointment(
    appointment_id: str,
    req: AppointmentUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Appointment, db, membership.tenant_id)
    a = repo.get_by_id(appointment_id)
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    updates = {}
    if req.title: updates["title"] = req.title
    if req.status: updates["status"] = req.status
    if req.scheduled_at or req.scheduledAt: updates["scheduled_at"] = req.scheduled_at or req.scheduledAt
    if req.feedback is not None: updates["feedback"] = req.feedback
    if req.notes is not None: updates["notes"] = req.notes

    updated = repo.update(a, updates)
    return success_response(appointment_to_dict(updated))

@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Appointment, db, membership.tenant_id)
    success = repo.delete(appointment_id, soft=True)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")
    return success_response({"message": "Appointment cancelled/archived successfully."})

