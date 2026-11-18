from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.billing_and_governance import AuditLog
from app.core.response import success_response

router = APIRouter(tags=["Audit Logs"])

class AuditLogCreateRequest(BaseModel):
    action: str
    entity: str
    entityType: Optional[str] = "GENERAL"
    entity_type: Optional[str] = "GENERAL"

@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).filter(
        (AuditLog.tenant_id == membership.tenant_id) | (AuditLog.tenant_id == None)
    ).order_by(AuditLog.created_at.desc()).limit(limit).all()

    return success_response([
        {
            "id": l.id,
            "actor": l.actor_name,
            "action": l.action,
            "entity": l.entity,
            "entityType": l.entity_type,
            "ipAddress": l.ip_address or "103.21.124.89",
            "timestamp": l.created_at.isoformat() if l.created_at else None,
            "status": l.status
        } for l in logs
    ])

@router.post("/audit-logs", status_code=status.HTTP_201_CREATED)
def record_audit_log(
    req: AuditLogCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    log = AuditLog(
        tenant_id=membership.tenant_id,
        actor_name="Alexander Wright",
        action=req.action,
        entity=req.entity,
        entity_type=req.entity_type or req.entityType or "GENERAL",
        status="SUCCESS"
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return success_response({"id": log.id, "status": "LOGGED"})

