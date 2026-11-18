import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.core.permissions import RoleEnum
from app.database.models.identity import User, Tenant, Membership, RefreshToken, UserSession
from app.database.models.billing_and_governance import AuditLog
from app.modules.auth.schemas import UserRegisterRequest, UserLoginRequest

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, req: UserRegisterRequest) -> Tuple[User, Tenant, str, str]:
        """Self-registration of a new agency administrator and workspace."""
        existing = self.db.query(User).filter(User.email == req.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists."
            )

        # 1. Create Tenant
        agency_name = req.agency_name or f"{req.full_name}'s Agency"
        subdomain = agency_name.lower().replace(" ", "").replace("&", "and")[:20]
        # Check uniqueness of subdomain
        base_sub = subdomain
        counter = 1
        while self.db.query(Tenant).filter(Tenant.subdomain == subdomain).first():
            subdomain = f"{base_sub}{counter}"
            counter += 1

        tenant = Tenant(
            name=agency_name,
            subdomain=subdomain,
            plan="STARTER",
            status="ACTIVE",
            email=req.email.lower(),
            phone=req.phone
        )
        self.db.add(tenant)
        self.db.flush()

        # 2. Create User
        user = User(
            email=req.email.lower(),
            full_name=req.full_name,
            phone=req.phone,
            hashed_password=hash_password(req.password),
            is_active=True,
            is_verified=True
        )
        self.db.add(user)
        self.db.flush()

        # 3. Create Membership as AGENCY_ADMIN
        membership = Membership(
            user_id=user.id,
            tenant_id=tenant.id,
            role=RoleEnum.AGENCY_ADMIN.value,
            is_active=True
        )
        self.db.add(membership)

        # 4. Audit Log
        audit = AuditLog(
            tenant_id=tenant.id,
            actor_id=user.id,
            actor_name=user.full_name,
            action="TENANT_REGISTERED",
            entity=f"Tenant: {tenant.name}",
            entity_type="AUTH",
            status="SUCCESS"
        )
        self.db.add(audit)
        self.db.commit()

        # 5. Tokens
        access_token, refresh_token = self._issue_tokens(user, tenant.id, RoleEnum.AGENCY_ADMIN.value)
        return user, tenant, access_token, refresh_token

    def login(self, req: UserLoginRequest, ip: Optional[str] = None, user_agent: Optional[str] = None) -> Tuple[User, str, str, str]:
        """Authenticates user and returns JWT token pair."""
        user = self.db.query(User).filter(User.email == req.email.lower()).first()
        if not user or not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Contact agency admin."
            )

        # Find primary active membership
        membership = self.db.query(Membership).filter(
            Membership.user_id == user.id,
            Membership.is_active == True
        ).first()

        tenant_id = membership.tenant_id if membership else "platform"
        role = membership.role if membership else RoleEnum.READ_ONLY.value

        # Session
        session = UserSession(
            user_id=user.id,
            session_token=str(uuid.uuid4()),
            ip_address=ip,
            user_agent=user_agent,
            is_active=True
        )
        self.db.add(session)

        # Audit
        audit = AuditLog(
            tenant_id=tenant_id if tenant_id != "platform" else None,
            actor_id=user.id,
            actor_name=user.full_name,
            action="USER_LOGIN",
            entity=user.email,
            entity_type="AUTH",
            ip_address=ip,
            status="SUCCESS"
        )
        self.db.add(audit)
        self.db.commit()

        access_token, refresh_token = self._issue_tokens(user, tenant_id, role)
        return user, tenant_id, access_token, refresh_token

    def refresh(self, refresh_token_str: str) -> Tuple[str, str]:
        """Rotates refresh token and issues new access token."""
        try:
            payload = decode_token(refresh_token_str)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type.")

        jti = payload.get("jti")
        user_id = payload.get("sub")
        tenant_id = payload.get("tenant_id")
        role = payload.get("role")

        db_token = self.db.query(RefreshToken).filter(RefreshToken.jti == jti).first()
        if not db_token or db_token.is_revoked:
            # Token reuse detection: revoke all tokens for this user family
            if db_token:
                self.db.query(RefreshToken).filter(RefreshToken.user_id == user_id).update({"is_revoked": True})
                self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token revoked or reused. Re-authentication required."
            )

        # Revoke old token
        db_token.is_revoked = True
        db_token.revoked_at = datetime.now(timezone.utc)

        user = self.db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer active.")

        new_access, new_refresh = self._issue_tokens(user, tenant_id, role)
        self.db.commit()
        return new_access, new_refresh

    def logout(self, user_id: str):
        """Revokes active refresh tokens and sessions for user."""
        self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False
        ).update({"is_revoked": True, "revoked_at": datetime.now(timezone.utc)})
        
        self.db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).update({"is_active": False})
        
        self.db.commit()

    def _issue_tokens(self, user: User, tenant_id: str, role: str) -> Tuple[str, str]:
        claims = {
            "tenant_id": tenant_id,
            "role": role,
            "email": user.email,
            "full_name": user.full_name
        }
        access_token = create_access_token(user.id, claims=claims)
        refresh_token = create_refresh_token(user.id, claims=claims)

        # Save refresh token in database for rotation & reuse tracking
        ref_payload = decode_token(refresh_token)
        db_ref = RefreshToken(
            user_id=user.id,
            jti=ref_payload["jti"],
            token_hash=hash_password(refresh_token[:20]),
            expires_at=datetime.fromtimestamp(ref_payload["exp"], tz=timezone.utc),
            is_revoked=False
        )
        self.db.add(db_ref)
        return access_token, refresh_token

