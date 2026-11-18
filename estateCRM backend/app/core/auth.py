from typing import Optional, List, Callable
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.core.tenant import get_current_tenant_id, set_current_tenant_id
from app.core.permissions import has_permission, RoleEnum
from app.database.session import get_db
from app.database.models.identity import User, Membership, Tenant
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )
    
    token = credentials.credentials
    try:
        payload = decode_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject."
        )

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated."
        )
    return user

async def get_current_membership(
    user: User = Depends(get_current_user),
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
    db: Session = Depends(get_db)
) -> Membership:
    """
    Enforces multi-tenant resolution and isolation.
    Resolves active agency membership for the user.
    """
    # Look for requested tenant or default to user's first active membership
    query = db.query(Membership).filter(
        Membership.user_id == user.id,
        Membership.is_active == True
    )

    if x_tenant_id:
        membership = query.filter(Membership.tenant_id == x_tenant_id).first()
    else:
        membership = query.first()

    # If the user has SUPER_ADMIN membership anywhere, allow cross-tenant inspection
    if not membership:
        super_admin_membership = db.query(Membership).filter(
            Membership.user_id == user.id,
            Membership.role == RoleEnum.SUPER_ADMIN.value
        ).first()

        if super_admin_membership and x_tenant_id:
            # Platform Super Admin impersonating/viewing tenant
            target_tenant = db.query(Tenant).filter(Tenant.id == x_tenant_id).first()
            if target_tenant:
                set_current_tenant_id(x_tenant_id)
                return super_admin_membership

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not hold an active membership in this agency tenant."
        )

    # Set thread-local tenant context
    set_current_tenant_id(membership.tenant_id)
    return membership

def require_permission(permission: str) -> Callable:
    """Dependency factory checking granular RBAC permissions."""
    async def permission_checker(
        membership: Membership = Depends(get_current_membership)
    ) -> Membership:
        if membership.role == RoleEnum.SUPER_ADMIN.value:
            return membership
            
        if not has_permission(membership.role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: Missing required permission '{permission}'."
            )
        return membership
    return permission_checker

def require_role(allowed_roles: List[RoleEnum]) -> Callable:
    """Dependency factory enforcing specific roles."""
    allowed_values = [r.value for r in allowed_roles]
    async def role_checker(
        membership: Membership = Depends(get_current_membership)
    ) -> Membership:
        if membership.role == RoleEnum.SUPER_ADMIN.value or membership.role in allowed_values:
            return membership
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role unauthorized. Requires one of: {allowed_values}"
        )
    return role_checker

async def require_super_admin(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Enforces Platform Super Admin privileges."""
    is_super = db.query(Membership).filter(
        Membership.user_id == user.id,
        Membership.role == RoleEnum.SUPER_ADMIN.value,
        Membership.is_active == True
    ).first()
    if not is_super:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform Super Admin privileges required."
        )
    return user

