"""Initial production database schema for EstateOS

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-11-06 14:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Tenants
    op.create_table(
        'tenants',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('subdomain', sa.String(60), nullable=False, unique=True),
        sa.Column('plan', sa.String(50), nullable=False, server_default='STARTER'),
        sa.Column('status', sa.String(30), nullable=False, server_default='ACTIVE'),
        sa.Column('logo_url', sa.String(500), nullable=True),
        sa.Column('phone', sa.String(30), nullable=True),
        sa.Column('email', sa.String(120), nullable=True),
        sa.Column('currency', sa.String(10), nullable=False, server_default='INR'),
        sa.Column('timezone', sa.String(50), nullable=False, server_default='Asia/Kolkata'),
        sa.Column('settings', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_tenants_name', 'tenants', ['name'])
    op.create_index('ix_tenants_subdomain', 'tenants', ['subdomain'])
    op.create_index('ix_tenants_status', 'tenants', ['status'])

    # 2. Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(150), nullable=False, unique=True),
        sa.Column('full_name', sa.String(150), nullable=False),
        sa.Column('phone', sa.String(30), nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # 3. Memberships
    op.create_table(
        'memberships',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='SALES_AGENT'),
        sa.Column('branch_id', sa.String(36), nullable=True),
        sa.Column('team_id', sa.String(36), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_memberships_user_id', 'memberships', ['user_id'])
    op.create_index('ix_memberships_tenant_id', 'memberships', ['tenant_id'])
    op.create_index('ix_memberships_role', 'memberships', ['role'])

    # 4. Invitations
    op.create_table(
        'invitations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('email', sa.String(150), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='SALES_AGENT'),
        sa.Column('token', sa.String(120), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('invited_by_id', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_invitations_tenant_id', 'invitations', ['tenant_id'])
    op.create_index('ix_invitations_email', 'invitations', ['email'])

    # 5. Refresh Tokens
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('jti', sa.String(100), nullable=False, unique=True),
        sa.Column('token_hash', sa.String(255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])
    op.create_index('ix_refresh_tokens_jti', 'refresh_tokens', ['jti'])

    # 6. User Sessions
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('session_token', sa.String(120), nullable=False, unique=True),
        sa.Column('ip_address', sa.String(60), nullable=True),
        sa.Column('user_agent', sa.String(300), nullable=True),
        sa.Column('last_activity', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_user_sessions_user_id', 'user_sessions', ['user_id'])

    # 7. Branches
    op.create_table(
        'branches',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('code', sa.String(30), nullable=True),
        sa.Column('address', sa.String(300), nullable=True),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('phone', sa.String(30), nullable=True),
        sa.Column('email', sa.String(120), nullable=True),
        sa.Column('manager_id', sa.String(36), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_branches_tenant_id', 'branches', ['tenant_id'])
    op.create_index('ix_branches_city', 'branches', ['city'])

    # 8. Teams
    op.create_table(
        'teams',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('branch_id', sa.String(36), sa.ForeignKey('branches.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('leader_id', sa.String(36), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_teams_tenant_id', 'teams', ['tenant_id'])

    # 9. Team Members
    op.create_table(
        'team_members',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('team_id', sa.String(36), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('membership_id', sa.String(36), sa.ForeignKey('memberships.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_team_members_team_id', 'team_members', ['team_id'])
    op.create_index('ix_team_members_membership_id', 'team_members', ['membership_id'])

    # 10. Contacts
    op.create_table(
        'contacts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('email', sa.String(150), nullable=True),
        sa.Column('phone', sa.String(30), nullable=True),
        sa.Column('contact_type', sa.String(50), nullable=False, server_default='BUYER'),
        sa.Column('budget_min', sa.Numeric(18, 2), nullable=True),
        sa.Column('budget_max', sa.Numeric(18, 2), nullable=True),
        sa.Column('preferred_locations', sa.JSON(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_contacts_tenant_email', 'contacts', ['tenant_id', 'email'])
    op.create_index('ix_contacts_tenant_phone', 'contacts', ['tenant_id', 'phone'])

    # 11. Leads
    op.create_table(
        'leads',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('email', sa.String(150), nullable=True),
        sa.Column('phone', sa.String(30), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='NEW'),
        sa.Column('source', sa.String(50), nullable=False, server_default='WEBSITE'),
        sa.Column('budget_min', sa.Numeric(18, 2), nullable=True),
        sa.Column('budget_max', sa.Numeric(18, 2), nullable=True),
        sa.Column('property_type', sa.String(50), nullable=True),
        sa.Column('assigned_agent_id', sa.String(36), nullable=True),
        sa.Column('assigned_agent_name', sa.String(150), nullable=True),
        sa.Column('contact_id', sa.String(36), sa.ForeignKey('contacts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('score', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_leads_tenant_status', 'leads', ['tenant_id', 'status'])
    op.create_index('ix_leads_tenant_agent', 'leads', ['tenant_id', 'assigned_agent_id'])

    # 12. Lead Activities
    op.create_table(
        'lead_activities',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lead_id', sa.String(36), sa.ForeignKey('leads.id', ondelete='CASCADE'), nullable=False),
        sa.Column('activity_type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('created_by_id', sa.String(36), nullable=True),
        sa.Column('created_by_name', sa.String(150), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_lead_activities_lead_id', 'lead_activities', ['lead_id'])

    # 13. Properties
    op.create_table(
        'properties',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('reference_no', sa.String(60), nullable=False),
        sa.Column('property_type', sa.String(50), nullable=False, server_default='APARTMENT'),
        sa.Column('category', sa.String(50), nullable=False, server_default='RESIDENTIAL'),
        sa.Column('sale_or_rent', sa.String(20), nullable=False, server_default='SALE'),
        sa.Column('price', sa.Numeric(18, 2), nullable=False),
        sa.Column('carpet_area_sqft', sa.Numeric(12, 2), nullable=False),
        sa.Column('bedrooms', sa.String(20), nullable=True),
        sa.Column('bathrooms', sa.String(20), nullable=True),
        sa.Column('locality', sa.String(150), nullable=False),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('country', sa.String(100), nullable=False, server_default='India'),
        sa.Column('postal_code', sa.String(20), nullable=True),
        sa.Column('latitude', sa.Numeric(10, 8), nullable=True),
        sa.Column('longitude', sa.Numeric(11, 8), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='AVAILABLE'),
        sa.Column('rera_registration_no', sa.String(80), nullable=True),
        sa.Column('owner_name', sa.String(150), nullable=True),
        sa.Column('owner_phone', sa.String(30), nullable=True),
        sa.Column('assigned_agent', sa.String(150), nullable=True),
        sa.Column('featured', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('amenities', sa.JSON(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_properties_tenant_ref', 'properties', ['tenant_id', 'reference_no'], unique=True)
    op.create_index('ix_properties_tenant_status', 'properties', ['tenant_id', 'status'])
    op.create_index('ix_properties_tenant_city', 'properties', ['tenant_id', 'city'])

    # 14. Property Media
    op.create_table(
        'property_media',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('property_id', sa.String(36), sa.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False),
        sa.Column('media_type', sa.String(30), nullable=False, server_default='IMAGE'),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('caption', sa.String(200), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_property_media_property_id', 'property_media', ['property_id'])

    # 15. Property Documents
    op.create_table(
        'property_documents',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('property_id', sa.String(36), sa.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False),
        sa.Column('document_type', sa.String(50), nullable=False, server_default='TITLE_DEED'),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('file_url', sa.String(500), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=True),
        sa.Column('mime_type', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_property_documents_property_id', 'property_documents', ['property_id'])

    # 16. Listings
    op.create_table(
        'listings',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('property_id', sa.String(36), sa.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('slug', sa.String(200), nullable=False, unique=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('price', sa.Numeric(18, 2), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('featured', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('enquiry_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_listings_slug', 'listings', ['slug'])
    op.create_index('ix_listings_is_published', 'listings', ['is_published'])

    # 17. Enquiries
    op.create_table(
        'enquiries',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('property_id', sa.String(36), sa.ForeignKey('properties.id', ondelete='SET NULL'), nullable=True),
        sa.Column('listing_id', sa.String(36), sa.ForeignKey('listings.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('email', sa.String(150), nullable=True),
        sa.Column('phone', sa.String(30), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('source', sa.String(50), nullable=False, server_default='WEBSITE'),
        sa.Column('status', sa.String(50), nullable=False, server_default='NEW'),
        sa.Column('assigned_agent', sa.String(150), nullable=True),
        sa.Column('converted_lead_id', sa.String(36), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_enquiries_tenant_status', 'enquiries', ['tenant_id', 'status'])

    # 18. Appointments
    op.create_table(
        'appointments',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('property_id', sa.String(36), sa.ForeignKey('properties.id', ondelete='SET NULL'), nullable=True),
        sa.Column('lead_id', sa.String(36), sa.ForeignKey('leads.id', ondelete='SET NULL'), nullable=True),
        sa.Column('contact_id', sa.String(36), sa.ForeignKey('contacts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('client_name', sa.String(150), nullable=False),
        sa.Column('client_phone', sa.String(30), nullable=True),
        sa.Column('assigned_agent', sa.String(150), nullable=True),
        sa.Column('appointment_type', sa.String(50), nullable=False, server_default='SITE_VISIT'),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False, server_default='60'),
        sa.Column('status', sa.String(50), nullable=False, server_default='SCHEDULED'),
        sa.Column('location', sa.String(250), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_appointments_tenant_scheduled', 'appointments', ['tenant_id', 'scheduled_at'])

    # 19. Tasks
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('priority', sa.String(30), nullable=False, server_default='MEDIUM'),
        sa.Column('status', sa.String(30), nullable=False, server_default='TODO'),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('assigned_to', sa.String(150), nullable=True),
        sa.Column('related_to', sa.String(150), nullable=True),
        sa.Column('lead_id', sa.String(36), nullable=True),
        sa.Column('deal_id', sa.String(36), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_tasks_tenant_status', 'tasks', ['tenant_id', 'status'])
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])

    # 20. Deals
    op.create_table(
        'deals',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('deal_name', sa.String(200), nullable=False),
        sa.Column('property_id', sa.String(36), sa.ForeignKey('properties.id', ondelete='SET NULL'), nullable=True),
        sa.Column('property_title', sa.String(200), nullable=True),
        sa.Column('contact_id', sa.String(36), sa.ForeignKey('contacts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('client_name', sa.String(150), nullable=False),
        sa.Column('lead_id', sa.String(36), nullable=True),
        sa.Column('assigned_agent', sa.String(150), nullable=True),
        sa.Column('stage', sa.String(50), nullable=False, server_default='DISCOVERY'),
        sa.Column('deal_value', sa.Numeric(18, 2), nullable=False),
        sa.Column('commission_rate_pct', sa.Numeric(5, 2), nullable=False, server_default='2.00'),
        sa.Column('commission_amount', sa.Numeric(18, 2), nullable=False),
        sa.Column('expected_close_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_deals_tenant_stage', 'deals', ['tenant_id', 'stage'])

    # 21. Deal Payments
    op.create_table(
        'deal_payments',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('deal_id', sa.String(36), sa.ForeignKey('deals.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount', sa.Numeric(18, 2), nullable=False),
        sa.Column('payment_type', sa.String(50), nullable=False, server_default='TOKEN'),
        sa.Column('payment_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('payment_method', sa.String(50), nullable=False, server_default='BANK_TRANSFER'),
        sa.Column('status', sa.String(50), nullable=False, server_default='RECEIVED'),
        sa.Column('reference_no', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_deal_payments_deal_id', 'deal_payments', ['deal_id'])

    # 22. Commissions
    op.create_table(
        'commissions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('deal_id', sa.String(36), sa.ForeignKey('deals.id', ondelete='CASCADE'), nullable=False),
        sa.Column('agent_name', sa.String(150), nullable=False),
        sa.Column('total_commission', sa.Numeric(18, 2), nullable=False),
        sa.Column('agent_split_pct', sa.Numeric(5, 2), nullable=False, server_default='50.00'),
        sa.Column('agent_payout', sa.Numeric(18, 2), nullable=False),
        sa.Column('agency_retained', sa.Numeric(18, 2), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='ACCRUED'),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_commissions_deal_id', 'commissions', ['deal_id'])

    # 23. Finance Transactions
    op.create_table(
        'finance_transactions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('transaction_type', sa.String(50), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('amount', sa.Numeric(18, 2), nullable=False),
        sa.Column('currency', sa.String(10), nullable=False, server_default='INR'),
        sa.Column('transaction_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('description', sa.String(250), nullable=True),
        sa.Column('reference_id', sa.String(100), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='SETTLED'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_finance_tx_tenant_date', 'finance_transactions', ['tenant_id', 'transaction_date'])

    # 24. Expenses
    op.create_table(
        'expenses',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('amount', sa.Numeric(18, 2), nullable=False),
        sa.Column('expense_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('description', sa.String(250), nullable=False),
        sa.Column('vendor_name', sa.String(150), nullable=True),
        sa.Column('approved_by', sa.String(150), nullable=True),
        sa.Column('payment_method', sa.String(50), nullable=False, server_default='BANK_TRANSFER'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_expenses_tenant_cat', 'expenses', ['tenant_id', 'category'])

    # 25. Campaigns
    op.create_table(
        'campaigns',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('channel', sa.String(50), nullable=False, server_default='DIGITAL_ADS'),
        sa.Column('budget', sa.Numeric(18, 2), nullable=False),
        sa.Column('actual_spend', sa.Numeric(18, 2), nullable=False, server_default='0.00'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='ACTIVE'),
        sa.Column('leads_generated', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('deals_closed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_campaigns_tenant_status', 'campaigns', ['tenant_id', 'status'])

    # 26. Communication Logs
    op.create_table(
        'communication_logs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('channel', sa.String(30), nullable=False),
        sa.Column('recipient', sa.String(150), nullable=False),
        sa.Column('subject', sa.String(250), nullable=True),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='SENT'),
        sa.Column('provider_reference', sa.String(120), nullable=True),
        sa.Column('error_message', sa.String(300), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_comm_logs_tenant_channel', 'communication_logs', ['tenant_id', 'channel'])

    # 27. Document Vault
    op.create_table(
        'documents',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('category', sa.String(100), nullable=False, server_default='AGREEMENT'),
        sa.Column('file_url', sa.String(500), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=True),
        sa.Column('mime_type', sa.String(100), nullable=True),
        sa.Column('access_level', sa.String(50), nullable=False, server_default='CONFIDENTIAL'),
        sa.Column('uploaded_by', sa.String(150), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_documents_tenant_cat', 'documents', ['tenant_id', 'category'])

    # 28. Plans
    op.create_table(
        'plans',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('slug', sa.String(50), nullable=False, unique=True),
        sa.Column('price_monthly', sa.Numeric(12, 2), nullable=False),
        sa.Column('price_annual', sa.Numeric(12, 2), nullable=False),
        sa.Column('max_agents', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('max_properties', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # 29. Subscriptions
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('plan_id', sa.String(36), sa.ForeignKey('plans.id'), nullable=False),
        sa.Column('plan_name', sa.String(100), nullable=False, server_default='PRO'),
        sa.Column('status', sa.String(50), nullable=False, server_default='ACTIVE'),
        sa.Column('current_period_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('current_period_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('cancel_at_period_end', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_subscriptions_tenant_id', 'subscriptions', ['tenant_id'])

    # 30. Invoices
    op.create_table(
        'invoices',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('subscription_id', sa.String(36), nullable=True),
        sa.Column('invoice_number', sa.String(60), nullable=False, unique=True),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(10), nullable=False, server_default='INR'),
        sa.Column('status', sa.String(50), nullable=False, server_default='PAID'),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('pdf_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_invoices_tenant_id', 'invoices', ['tenant_id'])

    # 31. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('tenant_id', sa.String(36), nullable=True),
        sa.Column('actor_id', sa.String(36), nullable=True),
        sa.Column('actor_name', sa.String(150), nullable=False, server_default='System'),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('entity', sa.String(200), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=False, server_default='GENERAL'),
        sa.Column('ip_address', sa.String(60), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(30), nullable=False, server_default='SUCCESS'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_audit_logs_tenant_id', 'audit_logs', ['tenant_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_entity_type', 'audit_logs', ['entity_type'])

def downgrade() -> None:
    tables = [
        'audit_logs', 'invoices', 'subscriptions', 'plans', 'documents',
        'communication_logs', 'campaigns', 'expenses', 'finance_transactions',
        'commissions', 'deal_payments', 'deals', 'tasks', 'appointments',
        'enquiries', 'listings', 'property_documents', 'property_media',
        'properties', 'lead_activities', 'leads', 'contacts', 'team_members',
        'teams', 'branches', 'user_sessions', 'refresh_tokens', 'invitations',
        'memberships', 'users', 'tenants'
    ]
    for table in tables:
        op.drop_table(table)

