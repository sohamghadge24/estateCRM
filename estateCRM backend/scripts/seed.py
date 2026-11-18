"""EstateOS Database Seeder for Production & Local Development
Populates authentic baseline agency data (Apex Horizon Capital) into MySQL database.
"""
import uuid
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine
from app.database.models import (
    Base,
    Tenant,
    User,
    Membership,
    Branch,
    Team,
    TeamMember,
    Contact,
    Lead,
    LeadActivity,
    Property,
    PropertyMedia,
    PropertyDocument,
    Listing,
    Enquiry,
    Appointment,
    Task,
    Deal,
    DealPayment,
    Commission,
    FinanceTransaction,
    Expense,
    Campaign,
    CommunicationLog,
    DocumentVault,
    Plan,
    Subscription,
    Invoice,
    AuditLog,
)
from app.core.security import hash_password

def seed_database():
    print("Initiating EstateOS database seeding...")
    # Create all tables if they don't exist yet
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_tenant = db.query(Tenant).filter(Tenant.subdomain == "apexhorizon").first()
        if existing_tenant:
            print("Apex Horizon Capital tenant already seeded. Skipping initial seed.")
            return

        now = datetime.now(timezone.utc)

        # 1. Platform Plans
        starter_plan = Plan(
            name="Starter Agency",
            slug="starter",
            price_monthly=Decimal("4999.00"),
            price_annual=Decimal("49990.00"),
            max_agents=5,
            max_properties=50,
            features={"customDomain": False, "apiAccess": False, "whiteLabel": False}
        )
        pro_plan = Plan(
            name="Professional Agency",
            slug="pro",
            price_monthly=Decimal("14999.00"),
            price_annual=Decimal("149990.00"),
            max_agents=20,
            max_properties=250,
            features={"customDomain": True, "apiAccess": True, "whiteLabel": False}
        )
        enterprise_plan = Plan(
            name="Enterprise Brokerage",
            slug="enterprise",
            price_monthly=Decimal("39999.00"),
            price_annual=Decimal("399990.00"),
            max_agents=100,
            max_properties=2000,
            features={"customDomain": True, "apiAccess": True, "whiteLabel": True, "dedicatedSupport": True}
        )
        db.add_all([starter_plan, pro_plan, enterprise_plan])
        db.flush()

        # 2. Main Agency Tenant: Apex Horizon Capital
        tenant = Tenant(
            id="t_apex_01",
            name="Apex Horizon Capital",
            subdomain="apexhorizon",
            plan="ENTERPRISE",
            status="ACTIVE",
            currency="INR",
            timezone="Asia/Kolkata",
            email="contact@apexhorizon.com",
            phone="+91 22 6123 4567",
            settings={"brandColor": "#EB5E28", "require2FA": False}
        )
        db.add(tenant)
        db.flush()

        # 3. Agency Subscription
        sub = Subscription(
            tenant_id=tenant.id,
            plan_id=enterprise_plan.id,
            plan_name="Enterprise Brokerage",
            status="ACTIVE",
            current_period_start=now - timedelta(days=15),
            current_period_end=now + timedelta(days=350)
        )
        db.add(sub)

        # 4. Users & Memberships
        admin_user = User(
            id="usr_alex_01",
            email="alexander.wright@apexhorizon.com",
            full_name="Alexander Wright",
            phone="+91 98200 11223",
            hashed_password=hash_password("Alexander123!"),
            is_active=True,
            is_verified=True
        )
        agent_elena = User(
            id="usr_elena_02",
            email="elena.rostova@apexhorizon.com",
            full_name="Elena Rostova",
            phone="+91 98200 44556",
            hashed_password=hash_password("Elena123!"),
            is_active=True,
            is_verified=True
        )
        agent_marcus = User(
            id="usr_marcus_03",
            email="marcus.sterling@apexhorizon.com",
            full_name="Marcus Sterling",
            phone="+91 98200 77889",
            hashed_password=hash_password("Marcus123!"),
            is_active=True,
            is_verified=True
        )
        super_admin = User(
            id="usr_super_00",
            email="superadmin@estateos.com",
            full_name="Platform SuperAdmin",
            phone="+91 90000 00001",
            hashed_password=hash_password("SuperAdmin123!"),
            is_active=True,
            is_verified=True
        )
        db.add_all([admin_user, agent_elena, agent_marcus, super_admin])
        db.flush()

        # Memberships
        m_admin = Membership(
            user_id=admin_user.id,
            tenant_id=tenant.id,
            role="AGENCY_ADMIN",
            is_active=True
        )
        m_elena = Membership(
            user_id=agent_elena.id,
            tenant_id=tenant.id,
            role="SALES_AGENT",
            is_active=True
        )
        m_marcus = Membership(
            user_id=agent_marcus.id,
            tenant_id=tenant.id,
            role="PROPERTY_MANAGER",
            is_active=True
        )
        m_super = Membership(
            user_id=super_admin.id,
            tenant_id=tenant.id,
            role="SUPER_ADMIN",
            is_active=True
        )
        db.add_all([m_admin, m_elena, m_marcus, m_super])
        db.flush()

        # 5. Organization: Branches & Teams
        branch_mumbai = Branch(
            tenant_id=tenant.id,
            name="South Mumbai Flagship",
            code="BOM-S",
            city="Mumbai",
            address="Level 14, Nariman Point Commercial Hub",
            phone="+91 22 4001 2200",
            is_active=True
        )
        branch_bkc = Branch(
            tenant_id=tenant.id,
            name="BKC Corporate Centre",
            code="BOM-BKC",
            city="Mumbai",
            address="Tower 2, Bandra-Kurla Complex",
            phone="+91 22 4002 3300",
            is_active=True
        )
        db.add_all([branch_mumbai, branch_bkc])
        db.flush()

        team_luxury = Team(
            tenant_id=tenant.id,
            branch_id=branch_mumbai.id,
            name="Ultra-Luxury Residential Team",
            is_active=True
        )
        team_comm = Team(
            tenant_id=tenant.id,
            branch_id=branch_bkc.id,
            name="Commercial & Office Leasing",
            is_active=True
        )
        db.add_all([team_luxury, team_comm])
        db.flush()

        # 6. Properties
        prop_01 = Property(
            id="prop_01",
            tenant_id=tenant.id,
            title="The Skybridge Penthouse",
            reference_no="PROP-SKY-001",
            property_type="APARTMENT",
            category="RESIDENTIAL",
            sale_or_rent="SALE",
            price=Decimal("85000000.00"),
            carpet_area_sqft=Decimal("4200.00"),
            bedrooms="4",
            bathrooms="5",
            locality="Bandra West, Hill Road",
            city="Mumbai",
            state="Maharashtra",
            country="India",
            postal_code="400050",
            status="AVAILABLE",
            rera_registration_no="P51800024911",
            owner_name="Vikas Singhania",
            owner_phone="+91 98201 44321",
            assigned_agent="Alexander Wright",
            featured=True,
            description="Ultra-luxury duplex penthouse with 270-degree Arabian Sea views, private plunge pool, and dedicated concierge elevator.",
            amenities=["Swimming Pool", "Private Elevator", "24/7 Security", "Gym", "Sea View", "Covered Parking (4 Cars)"]
        )
        prop_02 = Property(
            id="prop_02",
            tenant_id=tenant.id,
            title="Emerald Bay Luxury Villa",
            reference_no="PROP-VIL-002",
            property_type="VILLA",
            category="RESIDENTIAL",
            sale_or_rent="SALE",
            price=Decimal("142000000.00"),
            carpet_area_sqft=Decimal("6500.00"),
            bedrooms="5",
            bathrooms="6",
            locality="Palm Beach Road",
            city="Navi Mumbai",
            state="Maharashtra",
            country="India",
            postal_code="400705",
            status="AVAILABLE",
            rera_registration_no="P52000031844",
            owner_name="Priya Mehra",
            owner_phone="+91 98334 11200",
            assigned_agent="Elena Rostova",
            featured=True,
            description="Modern Italian-architecture waterfront villa with landscaped zen garden, private cinema suite, and temperature-controlled wine cellar.",
            amenities=["Waterfront Access", "Private Cinema", "Wine Cellar", "Solar Heated Pool", "Italian Marble Flooring"]
        )
        prop_03 = Property(
            id="prop_03",
            tenant_id=tenant.id,
            title="BKC One Financial Tower Office",
            reference_no="PROP-COM-003",
            property_type="COMMERCIAL",
            category="COMMERCIAL",
            sale_or_rent="RENT",
            price=Decimal("1800000.00"),
            carpet_area_sqft=Decimal("7800.00"),
            bedrooms="0",
            bathrooms="4",
            locality="G Block, BKC",
            city="Mumbai",
            state="Maharashtra",
            country="India",
            postal_code="400051",
            status="AVAILABLE",
            rera_registration_no="P51800019230",
            owner_name="Prestige Commercial REIT",
            owner_phone="+91 22 6789 0011",
            assigned_agent="Marcus Sterling",
            featured=False,
            description="Grade-A LEED Platinum certified corporate office plate with panoramic skyline views, fully fitted with acoustic partitions and backup power.",
            amenities=["LEED Platinum", "High-speed Elevators", "100% DG Backup", "Valet Parking", "Cafeteria"]
        )
        db.add_all([prop_01, prop_02, prop_03])
        db.flush()

        # 7. Listings
        list_01 = Listing(
            tenant_id=tenant.id,
            property_id=prop_01.id,
            title="The Skybridge Penthouse - Bandra West",
            slug="the-skybridge-penthouse-bandra-west",
            price=Decimal("85000000.00"),
            is_published=True,
            published_at=now - timedelta(days=20),
            featured=True,
            view_count=840,
            enquiry_count=24
        )
        list_02 = Listing(
            tenant_id=tenant.id,
            property_id=prop_02.id,
            title="Emerald Bay Waterfront Villa - Palm Beach Road",
            slug="emerald-bay-waterfront-villa",
            price=Decimal("142000000.00"),
            is_published=True,
            published_at=now - timedelta(days=14),
            featured=True,
            view_count=520,
            enquiry_count=18
        )
        db.add_all([list_01, list_02])
        db.flush()

        # 8. Contacts & Leads
        contact_01 = Contact(
            id="cnt_01",
            tenant_id=tenant.id,
            first_name="Devendra",
            last_name="Ambani",
            email="devendra.ambani@reliancefamily.com",
            phone="+91 98200 99881",
            contact_type="BUYER",
            budget_min=Decimal("80000000.00"),
            budget_max=Decimal("150000000.00"),
            preferred_locations=["Bandra West", "Worli Seaface"],
            notes="HNW investor seeking sea-view penthouse with high security for family."
        )
        contact_02 = Contact(
            id="cnt_02",
            tenant_id=tenant.id,
            first_name="Radhika",
            last_name="Poddar",
            email="radhika.poddar@poddarenterprises.com",
            phone="+91 98210 77665",
            contact_type="BUYER",
            budget_min=Decimal("120000000.00"),
            budget_max=Decimal("160000000.00"),
            preferred_locations=["Palm Beach Road", "Alibaug"],
            notes="Interested in luxury standalone villas."
        )
        db.add_all([contact_01, contact_02])
        db.flush()

        lead_01 = Lead(
            id="lead_01",
            tenant_id=tenant.id,
            first_name="Devendra",
            last_name="Ambani",
            email="devendra.ambani@reliancefamily.com",
            phone="+91 98200 99881",
            status="QUALIFIED",
            source="DIRECT",
            budget_min=Decimal("80000000.00"),
            budget_max=Decimal("150000000.00"),
            property_type="Penthouse",
            assigned_agent_name="Alexander Wright",
            contact_id=contact_01.id,
            score=95,
            notes="Qualified buyer with confirmed liquid funds."
        )
        lead_02 = Lead(
            id="lead_02",
            tenant_id=tenant.id,
            first_name="Radhika",
            last_name="Poddar",
            email="radhika.poddar@poddarenterprises.com",
            phone="+91 98210 77665",
            status="NEGOTIATION",
            source="WEBSITE",
            budget_min=Decimal("120000000.00"),
            budget_max=Decimal("160000000.00"),
            property_type="Villa",
            assigned_agent_name="Elena Rostova",
            contact_id=contact_02.id,
            score=92,
            notes="In final terms negotiation for Emerald Bay Villa."
        )
        lead_03 = Lead(
            id="lead_03",
            tenant_id=tenant.id,
            first_name="Vikramaditya",
            last_name="Birla",
            email="v.birla@adityaglobal.in",
            phone="+91 98300 12345",
            status="NEW",
            source="REFERRAL",
            budget_min=Decimal("15000000.00"),
            budget_max=Decimal("25000000.00"),
            property_type="Commercial Office",
            assigned_agent_name="Marcus Sterling",
            score=70,
            notes="Requirement for corporate headquarters expansion in BKC."
        )
        db.add_all([lead_01, lead_02, lead_03])
        db.flush()

        # 9. Appointments & Tasks
        apt_01 = Appointment(
            tenant_id=tenant.id,
            property_id=prop_01.id,
            lead_id=lead_01.id,
            contact_id=contact_01.id,
            title="Skybridge Penthouse Private Viewing",
            client_name="Devendra Ambani",
            client_phone="+91 98200 99881",
            assigned_agent="Alexander Wright",
            appointment_type="SITE_VISIT",
            scheduled_at=now + timedelta(hours=2),
            duration_minutes=90,
            status="SCHEDULED",
            location="Bandra West, Hill Road"
        )
        db.add(apt_01)

        task_01 = Task(
            tenant_id=tenant.id,
            title="Draft Sale Agreement for Emerald Bay Villa",
            description="Coordinate with conveyancing attorneys for Poddar acquisition draft.",
            priority="HIGH",
            status="TODO",
            due_date=now + timedelta(days=2),
            assigned_to="Elena Rostova",
            related_to="Emerald Bay Villa - Poddar Deal"
        )
        task_02 = Task(
            tenant_id=tenant.id,
            title="Follow up with Devendra Ambani on Site Visit feedback",
            description="Send architectural blueprint and maintenance schedule.",
            priority="URGENT",
            status="TODO",
            due_date=now + timedelta(days=1),
            assigned_to="Alexander Wright",
            related_to="Devendra Ambani (Lead)"
        )
        task_03 = Task(
            tenant_id=tenant.id,
            title="Verify RERA clearance certificates for BKC Level 18",
            description="Obtain latest occupancy certificate copy from Prestige developers.",
            priority="HIGH",
            status="TODO",
            due_date=now + timedelta(days=3),
            assigned_to="Marcus Sterling",
            related_to="Prestige Financial Tower"
        )
        db.add_all([task_01, task_02, task_03])

        # 10. Deals, Payments & Commissions
        deal_01 = Deal(
            tenant_id=tenant.id,
            deal_name="The Skybridge Penthouse - Ambani Mandate",
            property_id=prop_01.id,
            property_title="The Skybridge Penthouse",
            contact_id=contact_01.id,
            client_name="Devendra Ambani",
            lead_id=lead_01.id,
            assigned_agent="Alexander Wright",
            stage="UNDER_CONTRACT",
            deal_value=Decimal("85000000.00"),
            commission_rate_pct=Decimal("2.00"),
            commission_amount=Decimal("1700000.00"),
            expected_close_date=now + timedelta(days=15)
        )
        deal_02 = Deal(
            tenant_id=tenant.id,
            deal_name="Emerald Bay Waterfront Villa - Poddar Deal",
            property_id=prop_02.id,
            property_title="Emerald Bay Luxury Villa",
            contact_id=contact_02.id,
            client_name="Radhika Poddar",
            lead_id=lead_02.id,
            assigned_agent="Elena Rostova",
            stage="CLOSED_WON",
            deal_value=Decimal("142000000.00"),
            commission_rate_pct=Decimal("2.00"),
            commission_amount=Decimal("2840000.00"),
            closed_at=now - timedelta(days=3)
        )
        db.add_all([deal_01, deal_02])
        db.flush()

        # Commissions
        comm_01 = Commission(
            tenant_id=tenant.id,
            deal_id=deal_01.id,
            agent_name="Alexander Wright",
            total_commission=Decimal("1700000.00"),
            agent_split_pct=Decimal("50.00"),
            agent_payout=Decimal("850000.00"),
            agency_retained=Decimal("850000.00"),
            status="ACCRUED"
        )
        comm_02 = Commission(
            tenant_id=tenant.id,
            deal_id=deal_02.id,
            agent_name="Elena Rostova",
            total_commission=Decimal("2840000.00"),
            agent_split_pct=Decimal("50.00"),
            agent_payout=Decimal("1420000.00"),
            agency_retained=Decimal("1420000.00"),
            status="APPROVED"
        )
        db.add_all([comm_01, comm_02])

        # Finance Transactions
        tx_01 = FinanceTransaction(
            tenant_id=tenant.id,
            transaction_type="REVENUE",
            category="Brokerage Commission",
            amount=Decimal("2840000.00"),
            currency="INR",
            transaction_date=now - timedelta(days=3),
            description="Brokerage Commission - Emerald Bay Villa Closing",
            status="SETTLED"
        )
        tx_02 = FinanceTransaction(
            tenant_id=tenant.id,
            transaction_type="REVENUE",
            category="Consultancy Retainer",
            amount=Decimal("500000.00"),
            currency="INR",
            transaction_date=now - timedelta(days=10),
            description="Commercial Advisory Mandate Retainer",
            status="SETTLED"
        )
        db.add_all([tx_01, tx_02])

        # 11. Initial Audit Log
        audit = AuditLog(
            tenant_id=tenant.id,
            actor_name="Alexander Wright",
            action="WORKSPACE_INITIALIZED",
            entity="Apex Horizon Capital Core Workspace",
            entity_type="SYSTEM",
            status="SUCCESS"
        )
        db.add(audit)

        db.commit()
        print("EstateOS database successfully seeded with Apex Horizon Capital production baseline!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

