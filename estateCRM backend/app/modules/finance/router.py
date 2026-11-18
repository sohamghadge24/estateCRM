from typing import Optional
from decimal import Decimal
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership
from app.database.models.business import FinanceTransaction, Expense
from app.database.models.transactions import Commission
from app.database.repository import BaseTenantRepository
from app.core.response import success_response

router = APIRouter(prefix="/finance", tags=["Finance & Commissions"])
commissions_router = APIRouter(prefix="/commissions", tags=["Finance & Commissions"])

class TransactionCreateRequest(BaseModel):
    transactionType: Optional[str] = "REVENUE"
    transaction_type: Optional[str] = "REVENUE"
    category: str
    amount: Decimal
    description: Optional[str] = None
    referenceId: Optional[str] = None
    reference_id: Optional[str] = None

class ExpenseCreateRequest(BaseModel):
    category: str
    amount: Decimal
    description: str
    vendorName: Optional[str] = None
    vendor_name: Optional[str] = None
    approvedBy: Optional[str] = None
    approved_by: Optional[str] = None

@router.get("/transactions")
def list_transactions(
    transaction_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(FinanceTransaction, db, membership.tenant_id)
    filters = {}
    if transaction_type:
        filters["transaction_type"] = transaction_type

    txs = repo.list(skip=skip, limit=limit, **filters)
    total = repo.count(**filters)
    return success_response(
        [
            {
                "id": t.id,
                "type": t.transaction_type,
                "transactionType": t.transaction_type,
                "category": t.category,
                "amount": float(t.amount),
                "currency": t.currency,
                "date": t.transaction_date.strftime("%Y-%m-%d"),
                "description": t.description,
                "status": t.status,
            } for t in txs
        ],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.post("/transactions", status_code=status.HTTP_201_CREATED)
def create_transaction(
    req: TransactionCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(FinanceTransaction, db, membership.tenant_id)
    tx_type = req.transaction_type or req.transactionType or "REVENUE"
    ref = req.reference_id or req.referenceId

    t = repo.create({
        "transaction_type": tx_type,
        "category": req.category,
        "amount": req.amount,
        "currency": "INR",
        "transaction_date": datetime.now(timezone.utc),
        "description": req.description,
        "reference_id": ref,
        "status": "SETTLED"
    })
    return success_response({
        "id": t.id,
        "type": t.transaction_type,
        "amount": float(t.amount),
        "status": t.status
    })

@router.get("/expenses")
def list_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Expense, db, membership.tenant_id)
    expenses = repo.list(skip=skip, limit=limit)
    total = repo.count()
    return success_response(
        [
            {
                "id": e.id,
                "category": e.category,
                "amount": float(e.amount),
                "date": e.expense_date.strftime("%Y-%m-%d"),
                "description": e.description,
                "vendorName": e.vendor_name,
                "approvedBy": e.approved_by,
            } for e in expenses
        ],
        page=skip // limit + 1,
        page_size=limit,
        total=total
    )

@router.post("/expenses", status_code=status.HTTP_201_CREATED)
def create_expense(
    req: ExpenseCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Expense, db, membership.tenant_id)
    vendor = req.vendor_name or req.vendorName
    approver = req.approved_by or req.approvedBy or "Alexander Wright"

    e = repo.create({
        "category": req.category,
        "amount": req.amount,
        "expense_date": datetime.now(timezone.utc),
        "description": req.description,
        "vendor_name": vendor,
        "approved_by": approver,
        "payment_method": "BANK_TRANSFER"
    })

    # Also log as finance transaction
    fin_repo = BaseTenantRepository(FinanceTransaction, db, membership.tenant_id)
    fin_repo.create({
        "transaction_type": "EXPENSE",
        "category": req.category,
        "amount": req.amount,
        "currency": "INR",
        "transaction_date": datetime.now(timezone.utc),
        "description": req.description,
        "reference_id": e.id,
        "status": "SETTLED"
    })

    return success_response({
        "id": e.id,
        "amount": float(e.amount),
        "category": e.category
    })

@router.get("/commissions")
@commissions_router.get("")
def list_commissions(
    status_filter: Optional[str] = Query(None, alias="status"),
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Commission, db, membership.tenant_id)
    filters = {}
    if status_filter:
        filters["status"] = status_filter
    commissions = repo.list(**filters)
    return success_response([
        {
            "id": c.id,
            "dealId": c.deal_id,
            "agentName": c.agent_name,
            "totalCommission": float(c.total_commission),
            "agentPayout": float(c.agent_payout),
            "agencyRetained": float(c.agency_retained),
            "status": c.status,
            "paidAt": c.paid_at.isoformat() if c.paid_at else None
        } for c in commissions
    ])

@router.patch("/commissions/{commission_id}/payout")
def payout_commission(
    commission_id: str,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Commission, db, membership.tenant_id)
    c = repo.get_by_id(commission_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commission not found.")

    updated = repo.update(c, {
        "status": "PAID",
        "paid_at": datetime.now(timezone.utc)
    })
    return success_response({"message": "Commission payout settled.", "id": updated.id, "status": "PAID"})

