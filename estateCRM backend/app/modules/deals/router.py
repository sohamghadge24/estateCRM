import uuid
from typing import Optional, List
from decimal import Decimal
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.transactions import Deal, DealPayment, Commission
from app.database.models.business import FinanceTransaction
from app.database.repository import BaseTenantRepository
from app.core.response import success_response

router = APIRouter(prefix="/deals", tags=["Deals & Transactions"])

class DealCreateRequest(BaseModel):
    dealName: Optional[str] = None
    deal_name: Optional[str] = None
    title: Optional[str] = None
    propertyId: Optional[str] = None
    property_id: Optional[str] = None
    propertyTitle: Optional[str] = None
    property_title: Optional[str] = None
    clientName: Optional[str] = None
    client_name: Optional[str] = None
    client: Optional[str] = None
    assignedAgent: Optional[str] = None
    assigned_agent: Optional[str] = None
    stage: Optional[str] = "DISCOVERY"
    dealValue: Optional[Decimal] = None
    deal_value: Optional[Decimal] = None
    value: Optional[Decimal] = None
    commissionRatePct: Optional[Decimal] = Decimal("2.00")
    commission_rate_pct: Optional[Decimal] = Decimal("2.00")
    notes: Optional[str] = None

class DealUpdateRequest(BaseModel):
    dealName: Optional[str] = None
    deal_name: Optional[str] = None
    stage: Optional[str] = None
    dealValue: Optional[Decimal] = None
    deal_value: Optional[Decimal] = None
    notes: Optional[str] = None

class DealPaymentCreateRequest(BaseModel):
    amount: Decimal
    paymentType: Optional[str] = "TOKEN"
    payment_type: Optional[str] = "TOKEN"
    paymentMethod: Optional[str] = "BANK_TRANSFER"
    payment_method: Optional[str] = "BANK_TRANSFER"
    referenceNo: Optional[str] = None
    reference_no: Optional[str] = None

def deal_to_dict(d: Deal) -> dict:
    return {
        "id": d.id,
        "tenant_id": d.tenant_id,
        "dealName": d.deal_name,
        "deal_name": d.deal_name,
        "title": d.deal_name,
        "propertyId": d.property_id,
        "property_id": d.property_id,
        "propertyTitle": d.property_title or "Luxury Real Estate",
        "property_title": d.property_title or "Luxury Real Estate",
        "clientName": d.client_name,
        "client_name": d.client_name,
        "client": d.client_name,
        "assignedAgent": d.assigned_agent or "Alexander Wright",
        "assigned_agent": d.assigned_agent or "Alexander Wright",
        "stage": d.stage,
        "dealValue": float(d.deal_value) if d.deal_value else 0.0,
        "deal_value": float(d.deal_value) if d.deal_value else 0.0,
        "value": float(d.deal_value) if d.deal_value else 0.0,
        "commissionRatePct": float(d.commission_rate_pct) if d.commission_rate_pct else 2.0,
        "commissionAmount": float(d.commission_amount) if d.commission_amount else 0.0,
        "commission_amount": float(d.commission_amount) if d.commission_amount else 0.0,
        "closedAt": d.closed_at.isoformat() if d.closed_at else None,
        "notes": d.notes,
        "createdAt": d.created_at.isoformat() if d.created_at else None,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }

@router.get("")
def list_deals(
    stage_filter: Optional[str] = Query(None, alias="stage"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Deal, db, membership.tenant_id)
    filters = {}
    if stage_filter:
        filters["stage"] = stage_filter

    deals = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [deal_to_dict(d) for d in deals],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.get("/{deal_id}")
def get_deal(
    deal_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Deal, db, membership.tenant_id)
    d = repo.get_by_id(deal_id)
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")
    
    data = deal_to_dict(d)
    data["payments"] = [
        {
            "id": p.id,
            "amount": float(p.amount),
            "payment_type": p.payment_type,
            "payment_method": p.payment_method,
            "status": p.status,
            "date": p.payment_date.isoformat()
        } for p in d.payments
    ]
    data["commissions"] = [
        {
            "id": c.id,
            "agent_name": c.agent_name,
            "total_commission": float(c.total_commission),
            "agent_payout": float(c.agent_payout),
            "status": c.status
        } for c in d.commissions
    ]
    return success_response(data)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_deal(
    req: DealCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Deal, db, membership.tenant_id)
    name = req.deal_name or req.dealName or req.title or "New Transaction Mandate"
    prop_id = req.property_id or req.propertyId
    prop_title = req.property_title or req.propertyTitle or "Property Mandate"
    client = req.client_name or req.clientName or req.client or "Buyer Mandate"
    agent = req.assigned_agent or req.assignedAgent or "Alexander Wright"
    val = req.deal_value or req.dealValue or req.value or Decimal("10000000.00")
    rate = req.commission_rate_pct or req.commissionRatePct or Decimal("2.00")
    comm_amt = (val * rate) / Decimal("100.00")

    d = repo.create({
        "deal_name": name,
        "property_id": prop_id,
        "property_title": prop_title,
        "client_name": client,
        "assigned_agent": agent,
        "stage": req.stage or "DISCOVERY",
        "deal_value": val,
        "commission_rate_pct": rate,
        "commission_amount": comm_amt,
        "notes": req.notes
    })

    # Automatically create Commission record for agent
    comm_repo = BaseTenantRepository(Commission, db, membership.tenant_id)
    agent_payout = comm_amt * Decimal("0.50")
    agency_retained = comm_amt - agent_payout
    comm_repo.create({
        "deal_id": d.id,
        "agent_name": agent,
        "total_commission": comm_amt,
        "agent_split_pct": Decimal("50.00"),
        "agent_payout": agent_payout,
        "agency_retained": agency_retained,
        "status": "ACCRUED"
    })

    return success_response(deal_to_dict(d))

@router.patch("/{deal_id}")
@router.put("/{deal_id}")
def update_deal(
    deal_id: str,
    req: DealUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Deal, db, membership.tenant_id)
    d = repo.get_by_id(deal_id)
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")

    updates = {}
    if req.deal_name or req.dealName: updates["deal_name"] = req.deal_name or req.dealName
    if req.stage:
        updates["stage"] = req.stage
        if req.stage == "CLOSED_WON":
            updates["closed_at"] = datetime.now(timezone.utc)
            # Record revenue in finance transactions
            fin_repo = BaseTenantRepository(FinanceTransaction, db, membership.tenant_id)
            fin_repo.create({
                "transaction_type": "REVENUE",
                "category": "Brokerage Commission",
                "amount": d.commission_amount,
                "currency": "INR",
                "transaction_date": datetime.now(timezone.utc),
                "description": f"Closed Deal Brokerage: {d.deal_name}",
                "reference_id": d.id,
                "status": "SETTLED"
            })
    if req.deal_value or req.dealValue:
        new_val = req.deal_value or req.dealValue
        updates["deal_value"] = new_val
        updates["commission_amount"] = (new_val * d.commission_rate_pct) / Decimal("100.00")
    if req.notes is not None: updates["notes"] = req.notes

    updated = repo.update(d, updates)
    return success_response(deal_to_dict(updated))

@router.patch("/{deal_id}/stage")
def update_deal_stage(
    deal_id: str,
    req: DealUpdateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    return update_deal(deal_id, req, membership, db)

@router.post("/{deal_id}/offers", status_code=status.HTTP_201_CREATED)
def create_deal_offer(
    deal_id: str,
    req: dict,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Deal, db, membership.tenant_id)
    d = repo.get_by_id(deal_id)
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")
    offer_amount = Decimal(str(req.get("amount") or req.get("offer_amount") or req.get("offerAmount") or d.deal_value))
    return success_response({
        "id": f"off_{uuid.uuid4().hex[:8]}",
        "deal_id": deal_id,
        "amount": float(offer_amount),
        "status": req.get("status", "SUBMITTED"),
        "offered_by": req.get("offered_by") or req.get("offeredBy") or d.client_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

@router.post("/{deal_id}/payments", status_code=status.HTTP_201_CREATED)
def record_deal_payment(
    deal_id: str,
    req: DealPaymentCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Deal, db, membership.tenant_id)
    d = repo.get_by_id(deal_id)
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")

    payment_repo = BaseTenantRepository(DealPayment, db, membership.tenant_id)
    p_type = req.payment_type or req.paymentType or "TOKEN"
    p_method = req.payment_method or req.paymentMethod or "BANK_TRANSFER"
    ref = req.reference_no or req.referenceNo

    p = payment_repo.create({
        "deal_id": deal_id,
        "amount": req.amount,
        "payment_type": p_type,
        "payment_date": datetime.now(timezone.utc),
        "payment_method": p_method,
        "status": "RECEIVED",
        "reference_no": ref
    })

    return success_response({
        "id": p.id,
        "deal_id": p.deal_id,
        "amount": float(p.amount),
        "status": p.status,
        "payment_date": p.payment_date.isoformat()
    })

@router.delete("/{deal_id}")
def delete_deal(
    deal_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Deal, db, membership.tenant_id)
    success = repo.delete(deal_id, soft=True)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found.")
    return success_response({"message": "Deal archived successfully."})

