import pytest
from decimal import Decimal

def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_auth_login_success(client, setup_tenants_and_users):
    payload = {
        "email": "alexander@apexhorizon.com",
        "password": "Password123!"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "access_token" in data
    assert data["user"]["email"] == "alexander@apexhorizon.com"

def test_auth_login_invalid_password(client, setup_tenants_and_users):
    payload = {
        "email": "alexander@apexhorizon.com",
        "password": "WrongPassword!"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 401

def test_multi_tenant_lead_isolation(client, setup_tenants_and_users):
    headers_a = setup_tenants_and_users["headers_a"]
    headers_b = setup_tenants_and_users["headers_b"]

    # 1. Agency A creates a private confidential lead
    lead_payload = {
        "first_name": "Devendra",
        "last_name": "Ambani",
        "email": "devendra.ambani@reliance.com",
        "phone": "+91 98200 11111",
        "budget_min": 50000000,
        "budget_max": 90000000,
        "status": "QUALIFIED"
    }
    res_a = client.post("/api/v1/leads", json=lead_payload, headers=headers_a)
    assert res_a.status_code == 201
    lead_a_id = res_a.json()["data"]["id"]

    # 2. Agency A lists leads -> sees the lead
    list_a = client.get("/api/v1/leads", headers=headers_a)
    assert list_a.status_code == 200
    lead_ids_a = [l["id"] for l in list_a.json()["data"]]
    assert lead_a_id in lead_ids_a

    # 3. Agency B lists leads -> CANNOT see Agency A's lead (ISOLATION GUARANTEED)
    list_b = client.get("/api/v1/leads", headers=headers_b)
    assert list_b.status_code == 200
    lead_ids_b = [l["id"] for l in list_b.json()["data"]]
    assert lead_a_id not in lead_ids_b

    # 4. Agency B attempts direct ID access -> returns 404
    direct_b = client.get(f"/api/v1/leads/{lead_a_id}", headers=headers_b)
    assert direct_b.status_code == 404

def test_property_creation_and_public_listing(client, setup_tenants_and_users):
    headers_a = setup_tenants_and_users["headers_a"]

    # 1. Create property
    prop_payload = {
        "title": "The Skybridge Penthouse",
        "reference_no": "PROP-PENT-001",
        "property_type": "APARTMENT",
        "price": 85000000,
        "carpet_area_sqft": 4200,
        "bedrooms": "4",
        "bathrooms": "5",
        "locality": "Bandra West",
        "city": "Mumbai",
        "status": "AVAILABLE"
    }
    res = client.post("/api/v1/properties", json=prop_payload, headers=headers_a)
    assert res.status_code == 201
    prop_id = res.json()["data"]["id"]

    # 2. Syndicate to Listing
    list_payload = {
        "property_id": prop_id,
        "title": "The Skybridge Penthouse - Bandra West",
        "price": 85000000,
        "is_published": True
    }
    res_list = client.post("/api/v1/listings", json=list_payload, headers=headers_a)
    assert res_list.status_code == 201
    slug = res_list.json()["data"]["slug"]

    # 3. Access via unauthenticated public portal
    pub_res = client.get(f"/api/v1/public/listings/{slug}")
    assert pub_res.status_code == 200
    assert pub_res.json()["data"]["slug"] == slug

    # 4. Submit public enquiry
    enquiry_payload = {
        "name": "Ananya Birla",
        "email": "ananya@birla.com",
        "phone": "+91 98200 22334",
        "message": "Interested in private viewing."
    }
    enq_res = client.post(f"/api/v1/public/listings/{slug}/enquiries", json=enquiry_payload)
    assert enq_res.status_code == 201

def test_deals_and_commission_calculation(client, setup_tenants_and_users):
    headers_a = setup_tenants_and_users["headers_a"]

    deal_payload = {
        "deal_name": "Skybridge Penthouse Deal",
        "client_name": "Devendra Ambani",
        "deal_value": 85000000,
        "commission_rate_pct": 2.0,
        "stage": "NEGOTIATION"
    }
    res = client.post("/api/v1/deals", json=deal_payload, headers=headers_a)
    assert res.status_code == 201
    data = res.json()["data"]
    deal_id = data["id"]
    # 2% of 85,000,000 = 1,700,000
    assert data["commission_amount"] == 1700000.0

    # Record payment
    payment_payload = {
        "amount": 5000000,
        "payment_type": "TOKEN",
        "payment_method": "BANK_TRANSFER"
    }
    pay_res = client.post(f"/api/v1/deals/{deal_id}/payments", json=payment_payload, headers=headers_a)
    assert pay_res.status_code == 201

    # Close deal
    close_res = client.patch(f"/api/v1/deals/{deal_id}", json={"stage": "CLOSED_WON"}, headers=headers_a)
    assert close_res.status_code == 200
    assert close_res.json()["data"]["stage"] == "CLOSED_WON"

def test_dashboard_metrics(client, setup_tenants_and_users):
    headers_a = setup_tenants_and_users["headers_a"]

    res = client.get("/api/v1/dashboard/agency", headers=headers_a)
    assert res.status_code == 200
    metrics = res.json()["data"]["metrics"]
    assert "totalProperties" in metrics
    assert "activeLeads" in metrics
    assert "closedRevenue" in metrics
    assert "activeDeals" in metrics

