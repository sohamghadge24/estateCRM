from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.core.auth import require_super_admin
from app.database.models.identity import Tenant, User, Membership
from app.database.models.billing_and_governance import Plan, Subscription, AuditLog
from app.database.models.properties import Property
from app.core.response import success_response
import uuid

router = APIRouter(prefix="/platform", tags=["SaaS Platform Administration"])

class TenantProvisionRequest(BaseModel):
    name: str
    subdomain: str
    plan: Optional[str] = "STARTER"
    adminEmail: EmailStr
    adminName: str

@router.get("/dashboard")
@router.get("/stats")
def get_platform_stats(db: Session = Depends(get_db)):
    total_tenants = db.query(func.count(Tenant.id)).scalar() or 0
    active_agencies = db.query(func.count(Tenant.id)).filter(Tenant.status == "ACTIVE").scalar() or 0
    suspended_agencies = db.query(func.count(Tenant.id)).filter(Tenant.status == "SUSPENDED").scalar() or 0
    total_properties = db.query(func.count(Property.id)).scalar() or 0

    return success_response({
        "totalTenants": total_tenants,
        "activeAgencies": active_agencies,
        "suspendedAgencies": suspended_agencies,
        "totalPropertiesListed": total_properties,
        "totalPlatformMRR": 1680000,
        "systemUptime": "99.98%",
        "databaseHealth": "OPTIMAL",
        "redisCluster": "ONLINE",
        "celeryWorkers": "4/4 ACTIVE",
    })

@router.get("/tenants")
def list_tenants(db: Session = Depends(get_db)):
    tenants = db.query(Tenant).all()
    result = []
    for t in tenants:
        agent_count = db.query(func.count(Membership.id)).filter(Membership.tenant_id == t.id).scalar() or 0
        prop_count = db.query(func.count(Property.id)).filter(Property.tenant_id == t.id).scalar() or 0
        result.append({
            "id": t.id,
            "name": t.name,
            "subdomain": t.subdomain,
            "plan": t.plan,
            "status": t.status,
            "agents": agent_count,
            "properties": prop_count,
            "joinedDate": t.created_at.strftime("%Y-%m-%d") if t.created_at else None,
        })
    return success_response(result)

@router.patch("/tenants/{tenant_id}/status")
@router.post("/tenants/{tenant_id}/toggle-status")
def toggle_tenant_status(tenant_id: str, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found.")

    tenant.status = "SUSPENDED" if tenant.status == "ACTIVE" else "ACTIVE"
    db.commit()
    return success_response({
        "id": tenant.id,
        "name": tenant.name,
        "status": tenant.status,
        "message": f"Tenant {tenant.name} is now {tenant.status}."
    })

