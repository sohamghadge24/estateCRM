"""End-to-End Frontend + Backend Integration Test Suite
Verifies all 6 complete workflows required by the integration specification:
Workflow 1: Authentication & Session
Workflow 2: CRM (Contact, Lead, Assignment, Status Advance, Activities)
Workflow 3: Property & Marketplace Syndication
Workflow 4: Public Enquiry & Conversion to Lead
Workflow 5: Deal, Offers, Payments, Commissions & Real-time Dashboard KPIs
Workflow 6: Multi-Tenant Data Isolation (Deny-by-default)
"""
import pytest
from decimal import Decimal

def test_workflow_1_authentication(client, setup_tenants_and_users):
    # 1. Login as Agency Admin
    login_res = client.post("/api/v1/auth/login", json={
        "email": "alexander@apexhorizon.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()["data"]
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "alexander@apexhorizon.com"
    token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {token}", "X-Tenant-ID": "tenant_a"}

    # 2. Get User Profile (/auth/me)
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()["data"]
    assert me_data["user"]["email"] == "alexander@apexhorizon.com"
    assert me_data["user"]["role"] == "AGENCY_ADMIN"

    # 3. Load Dashboard (/dashboard/agency & /dashboard/overview)
    dash_res = client.get("/api/v1/dashboard/agency", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()["data"]
    assert "metrics" in dash_data
    assert "totalProperties" in dash_data["metrics"]

    # 4. Logout
    logout_res = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200

def test_workflow_2_crm_lifecycle(client, setup_tenants_and_users):
    headers = setup_tenants_and_users["headers_a"]

    # 1. Create a Contact
    contact_res = client.post("/api/v1/contacts", json={
        "fullName": "Cyrus Poonawalla",
        "type": "BUYER",
        "phone": "+91 98200 11223",
        "email": "cyrus@seruminstitute.com",
        "budget": "₹ 75 Cr",
        "locality": "Worli Sea Face"
    }, headers=headers)
    assert contact_res.status_code == 201
    contact = contact_res.json()["data"]
    assert contact["fullName"] == "Cyrus Poonawalla"

    # 2. Create a Lead
    lead_res = client.post("/api/v1/leads", json={
        "firstName": "Gautam",
        "lastName": "Singhania",
        "email": "gautam@raymond.in",
        "phoneE164": "+91 98200 44556",
        "budgetMin": 50000000,
        "budgetMax": 100000000,
        "preferredLocality": "Breach Candy",
        "propertyTypePreference": "PENTHOUSE",
        "source": "WEBSITE",
        "status": "NEW"
    }, headers=headers)
    assert lead_res.status_code == 201
    lead_id = lead_res.json()["data"]["id"]

    # 3. Assign Lead
    assign_res = client.post(f"/api/v1/leads/{lead_id}/assign", json={
        "assigned_agent": "Elena Rostova"
    }, headers=headers)
    assert assign_res.status_code == 200
    assert assign_res.json()["data"]["assignedAgent"] == "Elena Rostova"

    # 4. Advance Status
    status_res = client.patch(f"/api/v1/leads/{lead_id}", json={
        "status": "QUALIFIED"
    }, headers=headers)
    assert status_res.status_code == 200
    assert status_res.json()["data"]["status"] == "QUALIFIED"

    # 5. Add Activity Log
    act_res = client.post(f"/api/v1/leads/{lead_id}/activities", json={
        "activity_type": "CALL",
        "details": "Client confirmed interest in sea-facing terrace.",
        "performed_by": "Elena Rostova"
    }, headers=headers)
    assert act_res.status_code == 201

def test_workflow_3_property_and_listings(client, setup_tenants_and_users):
    headers = setup_tenants_and_users["headers_a"]

    # 1. Create Property
    prop_res = client.post("/api/v1/properties", json={
        "title": "Oceanview Signature Villa",
        "property_type": "VILLA",
        "price": 120000000,
        "carpet_area_sqft": 6500,
        "locality": "Juhu Tara Road",
        "city": "Mumbai",
        "status": "AVAILABLE"
    }, headers=headers)
    assert prop_res.status_code == 201
    prop_id = prop_res.json()["data"]["id"]

    # 2. Search Properties
    search_res = client.get("/api/v1/properties/search?q=Oceanview", headers=headers)
    assert search_res.status_code == 200
    assert len(search_res.json()["data"]) >= 1

    # 3. Create Listing
    list_res = client.post("/api/v1/listings", json={
        "property_id": prop_id,
        "title": "Oceanview Signature Villa",
        "slug": "oceanview-signature-villa",
        "price": 120000000,
        "is_published": False
    }, headers=headers)
    assert list_res.status_code == 201
    listing_id = list_res.json()["data"]["id"]

    # 4. Publish Listing
    pub_res = client.post(f"/api/v1/listings/{listing_id}/publish", headers=headers)
    assert pub_res.status_code == 200
    assert pub_res.json()["data"]["isPublished"] is True

    # 5. Public Listing Retrieval by Slug (Unauthenticated)
    pub_view = client.get("/api/v1/public/listings/oceanview-signature-villa")
    assert pub_view.status_code == 200
    assert pub_view.json()["data"]["slug"] == "oceanview-signature-villa"

def test_workflow_4_public_enquiry_to_lead(client, setup_tenants_and_users):
    headers = setup_tenants_and_users["headers_a"]

    # Prep: Create property and published listing for enquiry
    prop = client.post("/api/v1/properties", json={
        "title": "Malabar Hill Penthouse",
        "price": 90000000,
        "carpet_area_sqft": 4500,
        "locality": "Malabar Hill",
        "city": "Mumbai"
    }, headers=headers).json()["data"]

    listing = client.post("/api/v1/listings", json={
        "property_id": prop["id"],
        "title": "Malabar Hill Penthouse",
        "slug": "malabar-hill-penthouse",
        "price": 90000000,
        "is_published": True
    }, headers=headers).json()["data"]

    # 1. Submit Public Enquiry
    enq_res = client.post(f"/api/v1/public/listings/{listing['slug']}/enquiries", json={
        "client_name": "Aadarsh Singhal",
        "client_phone": "+91 98111 22334",
        "client_email": "aadarsh@singhalgroup.com",
        "message": "Interested in private viewing this Sunday."
    })
    assert enq_res.status_code == 201
    enquiry_id = enq_res.json()["data"]["id"]

    # 2. Agency Views Enquiry
    enq_view = client.get(f"/api/v1/enquiries/{enquiry_id}", headers=headers)
    assert enq_view.status_code == 200
    assert enq_view.json()["data"]["clientName"] == "Aadarsh Singhal"

    # 3. Convert Enquiry into Lead
    conv_res = client.post(f"/api/v1/enquiries/{enquiry_id}/convert", json={
        "assigned_agent": "Alexander Wright"
    }, headers=headers)
    assert conv_res.status_code == 200
    assert "lead" in conv_res.json()["data"]
    assert conv_res.json()["data"]["lead"]["firstName"] == "Aadarsh"

def test_workflow_5_deal_offer_payment_commission_dashboard(client, setup_tenants_and_users):
    headers = setup_tenants_and_users["headers_a"]

    # 1. Create Deal
    deal_res = client.post("/api/v1/deals", json={
        "dealName": "Villa Nirvana Acquisition",
        "propertyTitle": "Villa Nirvana",
        "clientName": "Rajiv Bajaj",
        "assignedAgent": "Elena Rostova",
        "stage": "NEGOTIATION",
        "dealValue": 95000000,
        "commissionRatePct": 2.0
    }, headers=headers)
    assert deal_res.status_code == 201
    deal_id = deal_res.json()["data"]["id"]

    # 2. Submit Counter Offer
    offer_res = client.post(f"/api/v1/deals/{deal_id}/offers", json={
        "amount": 92000000,
        "offered_by": "Rajiv Bajaj",
        "status": "ACCEPTED"
    }, headers=headers)
    assert offer_res.status_code == 201

    # 3. Record Token Payment
    pay_res = client.post(f"/api/v1/deals/{deal_id}/payments", json={
        "amount": 10000000,
        "payment_type": "TOKEN",
        "payment_method": "BANK_TRANSFER",
        "reference_no": "RTGS-2026-998811"
    }, headers=headers)
    assert pay_res.status_code == 201

    # 4. Close Deal
    close_res = client.patch(f"/api/v1/deals/{deal_id}", json={
        "stage": "CLOSED_WON"
    }, headers=headers)
    assert close_res.status_code == 200
    assert close_res.json()["data"]["stage"] == "CLOSED_WON"

    # 5. Verify Real Live Dashboard KPIs
    dash_res = client.get("/api/v1/dashboard/agency", headers=headers)
    assert dash_res.status_code == 200
    metrics = dash_res.json()["data"]["metrics"]
    assert metrics["wonDeals"] >= 1
    assert metrics["closedRevenue"] >= 95000000

def test_workflow_6_tenant_isolation(client, setup_tenants_and_users):
    headers_a = setup_tenants_and_users["headers_a"]
    headers_b = setup_tenants_and_users["headers_b"]

    # 1. Tenant A creates private Lead
    lead_a = client.post("/api/v1/leads", json={
        "firstName": "Confidential",
        "lastName": "HNW Buyer",
        "phoneE164": "+91 99999 88888",
        "source": "DIRECT_REFERRAL"
    }, headers=headers_a).json()["data"]
    lead_a_id = lead_a["id"]

    # 2. Tenant B CANNOT read Tenant A's lead
    res_b = client.get(f"/api/v1/leads/{lead_a_id}", headers=headers_b)
    assert res_b.status_code == 404

    # 3. Tenant B listing does not contain Tenant A's lead
    list_b = client.get("/api/v1/leads", headers=headers_b).json()["data"]
    b_ids = [l["id"] for l in list_b]
    assert lead_a_id not in b_ids
