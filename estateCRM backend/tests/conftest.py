import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.main import app
from app.database.base import Base
from app.database.session import get_db
from app.database.models import Tenant, User, Membership
from app.core.security import hash_password, create_access_token

# Fast, clean in-memory test database for test suite isolation
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def setup_tenants_and_users(db_session):
    # 1. Tenant A (Apex Horizon Capital)
    tenant_a = Tenant(
        id="tenant_a",
        name="Apex Horizon Capital",
        subdomain="apexhorizon",
        plan="PRO",
        status="ACTIVE"
    )
    # 2. Tenant B (Prime Square Realty)
    tenant_b = Tenant(
        id="tenant_b",
        name="Prime Square Realty",
        subdomain="primesquare",
        plan="STARTER",
        status="ACTIVE"
    )
    db_session.add_all([tenant_a, tenant_b])
    db_session.flush()

    # User A (Agency Admin for Tenant A)
    user_a = User(
        id="user_a",
        email="alexander@apexhorizon.com",
        full_name="Alexander Wright",
        hashed_password=hash_password("Password123!"),
        is_active=True,
        is_verified=True
    )
    # User B (Agency Admin for Tenant B)
    user_b = User(
        id="user_b",
        email="john@primesquare.com",
        full_name="John Doe",
        hashed_password=hash_password("Password123!"),
        is_active=True,
        is_verified=True
    )
    db_session.add_all([user_a, user_b])
    db_session.flush()

    # Memberships
    m_a = Membership(
        user_id=user_a.id,
        tenant_id=tenant_a.id,
        role="AGENCY_ADMIN",
        is_active=True
    )
    m_b = Membership(
        user_id=user_b.id,
        tenant_id=tenant_b.id,
        role="AGENCY_ADMIN",
        is_active=True
    )
    db_session.add_all([m_a, m_b])
    db_session.commit()

    token_a = create_access_token(user_a.id, claims={"tenant_id": tenant_a.id, "role": "AGENCY_ADMIN"})
    token_b = create_access_token(user_b.id, claims={"tenant_id": tenant_b.id, "role": "AGENCY_ADMIN"})

    return {
        "tenant_a": tenant_a,
        "tenant_b": tenant_b,
        "user_a": user_a,
        "user_b": user_b,
        "token_a": token_a,
        "token_b": token_b,
        "headers_a": {"Authorization": f"Bearer {token_a}", "X-Tenant-ID": tenant_a.id},
        "headers_b": {"Authorization": f"Bearer {token_b}", "X-Tenant-ID": tenant_b.id},
    }

