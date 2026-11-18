from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.leads.router import router as leads_router
from app.modules.contacts.router import router as contacts_router
from app.modules.properties.router import router as properties_router
from app.modules.listings.router import router as listings_router
from app.modules.enquiries.router import router as enquiries_router
from app.modules.appointments.router import router as appointments_router
from app.modules.tasks.router import router as tasks_router
from app.modules.deals.router import router as deals_router
from app.modules.finance.router import router as finance_router, commissions_router
from app.modules.organization.router import router as organization_router
from app.modules.communications.router import router as communications_router
from app.modules.documents.router import router as documents_router
from app.modules.campaigns.router import router as campaigns_router
from app.modules.analytics.router import router as dashboard_router, analytics_router
from app.modules.platform.router import router as platform_router
from app.modules.billing.router import router as billing_router
from app.modules.audit.router import router as audit_router

api_v1_router = APIRouter()

# Include all module routers
api_v1_router.include_router(auth_router)
api_v1_router.include_router(leads_router)
api_v1_router.include_router(leads_router, prefix="/crm")
api_v1_router.include_router(contacts_router)
api_v1_router.include_router(properties_router)
api_v1_router.include_router(listings_router)
api_v1_router.include_router(enquiries_router)
api_v1_router.include_router(appointments_router)
api_v1_router.include_router(tasks_router)
api_v1_router.include_router(deals_router)
api_v1_router.include_router(finance_router)
api_v1_router.include_router(commissions_router)
api_v1_router.include_router(organization_router)
api_v1_router.include_router(communications_router)
api_v1_router.include_router(documents_router)
api_v1_router.include_router(campaigns_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(platform_router)
api_v1_router.include_router(billing_router)
api_v1_router.include_router(audit_router)

