from typing import Optional
from decimal import Decimal
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.business import Campaign
from app.database.repository import BaseTenantRepository
from app.core.response import success_response

router = APIRouter(prefix="/campaigns", tags=["Marketing & Campaigns"])

class CampaignCreateRequest(BaseModel):
    name: str
    channel: Optional[str] = "DIGITAL_ADS"
    budget: Decimal
    actualSpend: Optional[Decimal] = Decimal("0.00")
    actual_spend: Optional[Decimal] = Decimal("0.00")
    startDate: Optional[datetime] = None
    start_date: Optional[datetime] = None
    endDate: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = "ACTIVE"

@router.get("")
def list_campaigns(
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Campaign, db, membership.tenant_id)
    campaigns = repo.list()
    return success_response([
        {
            "id": c.id,
            "name": c.name,
            "channel": c.channel,
            "budget": float(c.budget),
            "actualSpend": float(c.actual_spend),
            "status": c.status,
            "leadsGenerated": c.leads_generated,
            "dealsClosed": c.deals_closed,
            "startDate": c.start_date.strftime("%Y-%m-%d") if c.start_date else None,
            "endDate": c.end_date.strftime("%Y-%m-%d") if c.end_date else None,
        } for c in campaigns
    ])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_campaign(
    req: CampaignCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Campaign, db, membership.tenant_id)
    spend = req.actual_spend or req.actualSpend or Decimal("0.00")
    s_date = req.start_date or req.startDate or datetime.now(timezone.utc)
    e_date = req.end_date or req.endDate

    c = repo.create({
        "name": req.name,
        "channel": req.channel or "DIGITAL_ADS",
        "budget": req.budget,
        "actual_spend": spend,
        "start_date": s_date,
        "end_date": e_date,
        "status": req.status or "ACTIVE",
        "leads_generated": 0,
        "deals_closed": 0
    })
    return success_response({
        "id": c.id,
        "name": c.name,
        "budget": float(c.budget),
        "status": c.status
    })

