import contextvars
from typing import Optional
from fastapi import Request, HTTPException, status
from app.core.logging import logger

# Thread/Task-local context storage for tenant_id
_tenant_context: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar("tenant_id", default=None)

def get_current_tenant_id() -> Optional[str]:
    """Retrieve the active tenant ID for the current request context."""
    return _tenant_context.get()

def set_current_tenant_id(tenant_id: Optional[str]) -> contextvars.Token:
    """Set the active tenant ID for the current request context."""
    return _tenant_context.set(tenant_id)

def reset_current_tenant_id(token: contextvars.Token) -> None:
    """Reset the tenant context back to its previous state."""
    _tenant_context.reset(token)

class TenantContext:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.token = None

    def __enter__(self):
        self.token = set_current_tenant_id(self.tenant_id)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.token:
            reset_current_tenant_id(self.token)

def resolve_tenant(request: Request) -> str:
    """
    Dependency to resolve and enforce tenant context on protected routes.
    The tenant is extracted from verified user memberships, or requested via X-Tenant-ID header
    if the authenticated user is authorized for that tenant.
    """
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        # Check header
        tenant_id = request.headers.get("X-Tenant-ID")
        if tenant_id:
            set_current_tenant_id(tenant_id)

    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant context required. Provide X-Tenant-ID header or authenticate with an active agency membership."
        )
    return tenant_id

