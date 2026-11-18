from enum import Enum
from typing import Set, Dict, List

class RoleEnum(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    AGENCY_ADMIN = "AGENCY_ADMIN"
    BRANCH_MANAGER = "BRANCH_MANAGER"
    TEAM_LEADER = "TEAM_LEADER"
    SALES_AGENT = "SALES_AGENT"
    PROPERTY_MANAGER = "PROPERTY_MANAGER"
    MARKETING_EXECUTIVE = "MARKETING_EXECUTIVE"
    ACCOUNTANT = "ACCOUNTANT"
    READ_ONLY = "READ_ONLY"

class ScopeEnum(str, Enum):
    OWN = "OWN"
    TEAM = "TEAM"
    BRANCH = "BRANCH"
    TENANT = "TENANT"

class PermissionEnum(str, Enum):
    # Leads & CRM
    LEADS_VIEW = "leads.view"
    LEADS_CREATE = "leads.create"
    LEADS_UPDATE = "leads.update"
    LEADS_DELETE = "leads.delete"
    LEADS_ASSIGN = "leads.assign"

    # Properties & Inventory
    PROPERTIES_VIEW = "properties.view"
    PROPERTIES_CREATE = "properties.create"
    PROPERTIES_UPDATE = "properties.update"
    PROPERTIES_DELETE = "properties.delete"
    PROPERTIES_PUBLISH = "properties.publish"

    # Deals & Transactions
    DEALS_VIEW = "deals.view"
    DEALS_CREATE = "deals.create"
    DEALS_UPDATE = "deals.update"
    DEALS_CLOSE = "deals.close"

    # Finance & Commission
    FINANCE_VIEW = "finance.view"
    FINANCE_RECORD = "finance.record"

    # Users & Team Management
    USERS_INVITE = "users.invite"
    USERS_MANAGE = "users.manage"

    # Billing & Platform
    BILLING_MANAGE = "billing.manage"
    REPORTS_VIEW = "reports.view"
    PLATFORM_MANAGE = "platform.manage"

# Default Role Permission Mappings
ROLE_PERMISSIONS_MAP: Dict[RoleEnum, Set[str]] = {
    RoleEnum.SUPER_ADMIN: {p.value for p in PermissionEnum},
    RoleEnum.AGENCY_ADMIN: {
        PermissionEnum.LEADS_VIEW, PermissionEnum.LEADS_CREATE, PermissionEnum.LEADS_UPDATE, PermissionEnum.LEADS_DELETE, PermissionEnum.LEADS_ASSIGN,
        PermissionEnum.PROPERTIES_VIEW, PermissionEnum.PROPERTIES_CREATE, PermissionEnum.PROPERTIES_UPDATE, PermissionEnum.PROPERTIES_DELETE, PermissionEnum.PROPERTIES_PUBLISH,
        PermissionEnum.DEALS_VIEW, PermissionEnum.DEALS_CREATE, PermissionEnum.DEALS_UPDATE, PermissionEnum.DEALS_CLOSE,
        PermissionEnum.FINANCE_VIEW, PermissionEnum.FINANCE_RECORD,
        PermissionEnum.USERS_INVITE, PermissionEnum.USERS_MANAGE,
        PermissionEnum.BILLING_MANAGE, PermissionEnum.REPORTS_VIEW
    },
    RoleEnum.BRANCH_MANAGER: {
        PermissionEnum.LEADS_VIEW, PermissionEnum.LEADS_CREATE, PermissionEnum.LEADS_UPDATE, PermissionEnum.LEADS_ASSIGN,
        PermissionEnum.PROPERTIES_VIEW, PermissionEnum.PROPERTIES_CREATE, PermissionEnum.PROPERTIES_UPDATE, PermissionEnum.PROPERTIES_PUBLISH,
        PermissionEnum.DEALS_VIEW, PermissionEnum.DEALS_CREATE, PermissionEnum.DEALS_UPDATE, PermissionEnum.DEALS_CLOSE,
        PermissionEnum.FINANCE_VIEW,
        PermissionEnum.USERS_INVITE,
        PermissionEnum.REPORTS_VIEW
    },
    RoleEnum.TEAM_LEADER: {
        PermissionEnum.LEADS_VIEW, PermissionEnum.LEADS_CREATE, PermissionEnum.LEADS_UPDATE, PermissionEnum.LEADS_ASSIGN,
        PermissionEnum.PROPERTIES_VIEW, PermissionEnum.PROPERTIES_CREATE, PermissionEnum.PROPERTIES_UPDATE,
        PermissionEnum.DEALS_VIEW, PermissionEnum.DEALS_CREATE, PermissionEnum.DEALS_UPDATE,
        PermissionEnum.REPORTS_VIEW
    },
    RoleEnum.SALES_AGENT: {
        PermissionEnum.LEADS_VIEW, PermissionEnum.LEADS_CREATE, PermissionEnum.LEADS_UPDATE,
        PermissionEnum.PROPERTIES_VIEW,
        PermissionEnum.DEALS_VIEW, PermissionEnum.DEALS_CREATE, PermissionEnum.DEALS_UPDATE,
        PermissionEnum.REPORTS_VIEW
    },
    RoleEnum.PROPERTY_MANAGER: {
        PermissionEnum.PROPERTIES_VIEW, PermissionEnum.PROPERTIES_CREATE, PermissionEnum.PROPERTIES_UPDATE, PermissionEnum.PROPERTIES_PUBLISH,
        PermissionEnum.LEADS_VIEW,
        PermissionEnum.REPORTS_VIEW
    },
    RoleEnum.MARKETING_EXECUTIVE: {
        PermissionEnum.LEADS_VIEW, PermissionEnum.LEADS_CREATE,
        PermissionEnum.PROPERTIES_VIEW, PermissionEnum.PROPERTIES_PUBLISH,
        PermissionEnum.REPORTS_VIEW
    },
    RoleEnum.ACCOUNTANT: {
        PermissionEnum.FINANCE_VIEW, PermissionEnum.FINANCE_RECORD,
        PermissionEnum.DEALS_VIEW,
        PermissionEnum.BILLING_MANAGE,
        PermissionEnum.REPORTS_VIEW
    },
    RoleEnum.READ_ONLY: {
        PermissionEnum.LEADS_VIEW,
        PermissionEnum.PROPERTIES_VIEW,
        PermissionEnum.DEALS_VIEW,
        PermissionEnum.REPORTS_VIEW
    }
}

def has_permission(user_role: str, required_permission: str) -> bool:
    """Checks whether the given role holds the required permission."""
    try:
        role = RoleEnum(user_role)
    except ValueError:
        return False
    return required_permission in ROLE_PERMISSIONS_MAP.get(role, set())

