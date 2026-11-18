from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_membership
from app.database.models.identity import Membership, User, Invitation
from app.database.models.organization import Branch, Team
from app.database.repository import BaseTenantRepository
from app.core.response import success_response
import uuid
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/organization", tags=["Organization & Teams"])

class BranchCreateRequest(BaseModel):
    name: str
    city: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    manager: Optional[str] = None

class TeamCreateRequest(BaseModel):
    name: str
    branchId: Optional[str] = None
    branch_id: Optional[str] = None
    leader: Optional[str] = None

class MemberInviteRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: Optional[str] = "SALES_AGENT"
    branch: Optional[str] = None
    team: Optional[str] = None

@router.get("/branches")
def list_branches(
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Branch, db, membership.tenant_id)
    branches = repo.list()
    return success_response([
        {
            "id": b.id,
            "name": b.name,
            "city": b.city,
            "address": b.address,
            "phone": b.phone,
            "email": b.email,
            "active": b.is_active,
        } for b in branches
    ])

@router.post("/branches", status_code=status.HTTP_201_CREATED)
def create_branch(
    req: BranchCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Branch, db, membership.tenant_id)
    b = repo.create({
        "name": req.name,
        "city": req.city,
        "address": req.address,
        "phone": req.phone,
        "email": req.email,
        "is_active": True
    })
    return success_response({"id": b.id, "name": b.name, "city": b.city})

@router.get("/teams")
def list_teams(
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Team, db, membership.tenant_id)
    teams = repo.list()
    return success_response([
        {
            "id": t.id,
            "name": t.name,
            "branchId": t.branch_id,
            "active": t.is_active
        } for t in teams
    ])

@router.post("/teams", status_code=status.HTTP_201_CREATED)
def create_team(
    req: TeamCreateRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    repo = BaseTenantRepository(Team, db, membership.tenant_id)
    branch_id = req.branch_id or req.branchId
    t = repo.create({
        "name": req.name,
        "branch_id": branch_id,
        "is_active": True
    })
    return success_response({"id": t.id, "name": t.name})

@router.get("/members")
def list_members(
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    memberships = db.query(Membership).filter(
        Membership.tenant_id == membership.tenant_id,
        Membership.is_active == True
    ).all()

    result = []
    for m in memberships:
        u = m.user
        result.append({
            "id": m.id,
            "userId": u.id if u else None,
            "name": u.full_name if u else "Agent",
            "email": u.email if u else "agent@estateos.com",
            "phone": u.phone if u else None,
            "role": m.role,
            "active": m.is_active,
            "joinedAt": m.created_at.strftime("%Y-%m-%d") if m.created_at else None,
        })
    return success_response(result)

@router.post("/members/invite", status_code=status.HTTP_201_CREATED)
def invite_member(
    req: MemberInviteRequest,
    membership: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db)
):
    token = str(uuid.uuid4())
    invitation = Invitation(
        tenant_id=membership.tenant_id,
        email=req.email.lower(),
        role=req.role or "SALES_AGENT",
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        invited_by_id=membership.user_id
    )
    db.add(invitation)
    db.commit()
    return success_response({
        "message": f"Invitation created and dispatched to {req.email}.",
        "invitation_token": token
    })

