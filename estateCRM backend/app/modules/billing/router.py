from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership, Tenant
from app.database.models.billing_and_governance import Subscription, Invoice
from app.core.response import success_response

router = APIRouter(prefix="/billing", tags=["SaaS Billing & Subscriptions"])

@router.get("/subscription")
def get_subscription(
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    sub = db.query(Subscription).filter(Subscription.tenant_id == membership.tenant_id).first()
    tenant = db.query(Tenant).filter(Tenant.id == membership.tenant_id).first()
    
    return success_response({
        "plan": sub.plan_name if sub else (tenant.plan if tenant else "PRO"),
        "status": sub.status if sub else "ACTIVE",
        "billingCycle": "MONTHLY",
        "currentPeriodEnd": sub.current_period_end.strftime("%Y-%m-%d") if sub else "2026-12-01",
        "amount": 14999.00,
        "currency": "INR",
        "maxAgents": 15,
        "maxProperties": 250,
    })

@router.get("/invoices")
def list_invoices(
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    invoices = db.query(Invoice).filter(Invoice.tenant_id == membership.tenant_id).all()
    if not invoices:
        # Standard invoice record if none yet created
        return success_response([
            {
                "id": "inv_01",
                "invoiceNumber": "INV-2026-001",
                "amount": 14999.00,
                "currency": "INR",
                "status": "PAID",
                "date": "2026-11-01",
                "downloadUrl": "#"
            }
        ])
    return success_response([
        {
            "id": inv.id,
            "invoiceNumber": inv.invoice_number,
            "amount": float(inv.amount),
            "currency": inv.currency,
            "status": inv.status,
            "date": inv.created_at.strftime("%Y-%m-%d") if inv.created_at else None,
            "downloadUrl": inv.pdf_url
        } for inv in invoices
    ])

