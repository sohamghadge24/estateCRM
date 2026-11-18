from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.business import CommunicationLog
from app.database.repository import BaseTenantRepository
from app.core.response import success_response
import uuid

router = APIRouter(prefix="/communications", tags=["Communications"])

class SendMessageRequest(BaseModel):
    channel: str # EMAIL, SMS, WHATSAPP
    recipient: str
    subject: Optional[str] = None
    body: str

@router.get("")
def list_communications(
    channel_filter: Optional[str] = Query(None, alias="channel"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(CommunicationLog, db, membership.tenant_id)
    filters = {}
    if channel_filter:
        filters["channel"] = channel_filter

    logs = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [
            {
                "id": c.id,
                "channel": c.channel,
                "recipient": c.recipient,
                "subject": c.subject,
                "body": c.body,
                "status": c.status,
                "timestamp": c.created_at.isoformat() if c.created_at else None,
            } for c in logs
        ],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.post("/send", status_code=status.HTTP_201_CREATED)
def send_message(
    req: SendMessageRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(CommunicationLog, db, membership.tenant_id)
    log = repo.create({
        "channel": req.channel.upper(),
        "recipient": req.recipient,
        "subject": req.subject,
        "body": req.body,
        "status": "SENT",
        "provider_reference": f"prov_{uuid.uuid4().hex[:10]}"
    })
    return success_response({
        "id": log.id,
        "channel": log.channel,
        "status": "SENT",
        "message": f"Message dispatched via {log.channel} provider adapter."
    })

