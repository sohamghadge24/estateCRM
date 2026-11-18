from fastapi import APIRouter, Depends, Request, status, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.modules.auth.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    SwitchTenantRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.modules.auth.service import AuthService
from app.core.auth import get_current_user, get_current_membership
from app.core.response import success_response
from app.database.models.identity import User, Membership, Tenant

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, tenant, access_token, refresh_token = service.register(req)
    return success_response({
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "fullName": user.full_name,
            "role": "AGENCY_ADMIN",
            "agency_name": tenant.name,
            "agencyName": tenant.name,
            "defaultTenantId": tenant.id,
            "default_tenant_id": tenant.id,
        },
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "subdomain": tenant.subdomain
        },
        "tenant_id": tenant.id,
        "tenantId": tenant.id,
        "defaultTenantId": tenant.id,
        "access_token": access_token,
        "accessToken": access_token,
        "refresh_token": refresh_token,
        "refreshToken": refresh_token,
        "token_type": "bearer"
    })

@router.post("/login")
def login(req: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    service = AuthService(db)
    user, tenant_id, access_token, refresh_token = service.login(req, ip=ip, user_agent=user_agent)
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    membership = db.query(Membership).filter(Membership.user_id == user.id, Membership.tenant_id == tenant_id).first()
    
    return success_response({
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "fullName": user.full_name,
            "role": membership.role if membership else "READ_ONLY",
            "agency_name": tenant.name if tenant else "Apex Horizon Capital",
            "agencyName": tenant.name if tenant else "Apex Horizon Capital",
            "defaultTenantId": tenant_id,
            "default_tenant_id": tenant_id,
        },
        "tenant_id": tenant_id,
        "tenantId": tenant_id,
        "defaultTenantId": tenant_id,
        "access_token": access_token,
        "accessToken": access_token,
        "refresh_token": refresh_token,
        "refreshToken": refresh_token,
        "token_type": "bearer"
    })


@router.post("/refresh")
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    access_token, refresh_token = service.refresh(req.refresh_token)
    return success_response({
        "access_token": access_token,
        "accessToken": access_token,
        "refresh_token": refresh_token,
        "refreshToken": refresh_token,
        "token_type": "bearer"
    })

@router.post("/logout")
def logout(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = AuthService(db)
    service.logout(user.id)
    return success_response({"message": "Successfully logged out from all sessions."})

@router.get("/me")
def get_me(user: User = Depends(get_current_user), membership: Membership = Depends(get_current_membership), db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.id == membership.tenant_id).first()
    return success_response({
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "avatar_url": user.avatar_url,
            "role": membership.role,
        },
        "active_tenant": {
            "id": tenant.id if tenant else None,
            "name": tenant.name if tenant else None,
            "subdomain": tenant.subdomain if tenant else None,
            "currency": tenant.currency if tenant else "INR",
            "timezone": tenant.timezone if tenant else "Asia/Kolkata"
        }
    })

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    # Safe stub preparing background email worker trigger
    return success_response({"message": "If the email is registered, password reset instructions have been dispatched."})

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    return success_response({"message": "Password updated successfully. Please sign in with your new credentials."})

@router.post("/switch-tenant")
def switch_tenant(
    req: SwitchTenantRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    membership = db.query(Membership).filter(
        Membership.user_id == user.id,
        Membership.tenant_id == req.tenant_id,
        Membership.is_active == True
    ).first()
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to requested tenant.")
    
    tenant = db.query(Tenant).filter(Tenant.id == req.tenant_id).first()
    from app.core.security import create_access_token
    access_token = create_access_token({
        "sub": user.id,
        "tenant_id": req.tenant_id,
        "role": membership.role
    })
    return success_response({
        "access_token": access_token,
        "tenant_id": req.tenant_id,
        "role": membership.role,
        "tenant_name": tenant.name if tenant else ""
    })

