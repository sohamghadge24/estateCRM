// Centralized EstateOS TypeScript Domain Models & API Contracts

export type UserRole =
  | 'SUPER_ADMIN'
  | 'AGENCY_ADMIN'
  | 'BRANCH_MANAGER'
  | 'TEAM_LEADER'
  | 'SALES_AGENT'
  | 'PROPERTY_MANAGER'
  | 'MARKETING_EXECUTIVE'
  | 'ACCOUNTANT'
  | 'READ_ONLY';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  agencyName?: string;
  agency_name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  isActive?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';
  currency: string;
  timezone: string;
}

export interface Membership {
  id: string;
  userId: string;
  tenantId: string;
  role: UserRole;
  branchId?: string;
  teamId?: string;
  isActive: boolean;
}

export interface AuthSession {
  user: User;
  active_tenant?: Tenant;
  tenant_id?: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface Lead {
  id: string;
  tenant_id?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneE164: string;
  phone?: string;
  budgetMin?: number;
  budgetMax?: number;
  budget?: string;
  preferredLocality?: string;
  propertyTypePreference?: string;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'SITE_VISIT' | 'NEGOTIATION' | 'CONVERTED' | 'LOST';
  assignedAgent?: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: 'CALL' | 'EMAIL' | 'WHATSAPP' | 'SITE_VISIT' | 'NOTE';
  details?: string;
  performedBy: string;
  timestamp: string;
}

export interface Contact {
  id: string;
  fullName: string;
  type: 'BUYER' | 'SELLER' | 'LANDLORD' | 'TENANT' | 'INVESTOR' | 'PARTNER';
  phone: string;
  email?: string;
  budget?: string;
  locality?: string;
  assignedAgent?: string;
  notes?: string;
  createdAt?: string;
}

export interface PropertyMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'FLOOR_PLAN';
  url: string;
  caption?: string;
  sort_order?: number;
}

export interface PropertyDocument {
  id: string;
  document_type: string;
  title: string;
  file_url: string;
}

export interface Property {
  id: string;
  title: string;
  referenceNo?: string;
  reference_no?: string;
  propertyType: string;
  property_type?: string;
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'LAND';
  saleOrRent: 'SALE' | 'RENT';
  price: number;
  carpetAreaSqft: number;
  bedrooms?: string;
  bathrooms?: string;
  locality: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status: 'AVAILABLE' | 'UNDER_OFFER' | 'SOLD' | 'RENTED';
  reraRegistrationNo?: string;
  ownerName?: string;
  ownerPhone?: string;
  assignedAgent?: string;
  featured?: boolean;
  description?: string;
  amenities?: string[];
  media?: PropertyMedia[];
  documents?: PropertyDocument[];
  createdAt?: string;
}

export interface Listing {
  id: string;
  propertyId: string;
  title: string;
  slug: string;
  price: number;
  isPublished: boolean;
  is_published: boolean;
  publishedAt?: string;
  viewCount: number;
  inquiryCount: number;
  createdAt?: string;
}

export interface Enquiry {
  id: string;
  listingId?: string;
  clientName: string;
  client_name?: string;
  clientPhone: string;
  client_phone?: string;
  clientEmail?: string;
  client_email?: string;
  propertyTitle?: string;
  message?: string;
  status: 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'CONVERTED' | 'SPAM';
  assignedAgent?: string;
  createdAt?: string;
}

export interface Appointment {
  id: string;
  type: 'SITE_VISIT' | 'CLIENT_MEETING' | 'VALUATION' | 'DOCUMENT_SIGNING';
  title: string;
  clientName: string;
  propertyTitle?: string;
  assignedAgent: string;
  date: string;
  time: string;
  location?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completed: boolean;
  dueDate: string;
  due?: string;
  due_date?: string;
  assignedTo: string;
  relatedTo?: string;
  createdAt?: string;
}

export interface Deal {
  id: string;
  dealName: string;
  deal_name?: string;
  title?: string;
  propertyId?: string;
  propertyTitle?: string;
  clientName: string;
  client_name?: string;
  client?: string;
  assignedAgent: string;
  stage: 'DISCOVERY' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'UNDER_CONTRACT' | 'CLOSED_WON' | 'CLOSED_LOST';
  dealValue: number;
  deal_value?: number;
  value?: number;
  commissionRatePct: number;
  commissionAmount: number;
  commission_amount?: number;
  closedAt?: string;
  notes?: string;
  createdAt?: string;
}

export interface Commission {
  id: string;
  deal_id: string;
  agent_name: string;
  total_commission: number;
  agent_split_pct: number;
  agent_payout: number;
  agency_retained: number;
  status: 'ACCRUED' | 'PAID' | 'DISPUTED';
  paid_at?: string;
}

export interface FinanceTransaction {
  id: string;
  type: 'REVENUE' | 'EXPENSE' | 'COMMISSION_PAYOUT' | 'ESCROW';
  transactionType?: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  referenceId?: string;
  status: 'PENDING' | 'SETTLED' | 'CANCELLED';
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  vendorName?: string;
  approvedBy: string;
  status: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  is_headquarters?: boolean;
}

export interface Team {
  id: string;
  branch_id: string;
  name: string;
  leader_name?: string;
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  branch?: string;
  team?: string;
  status: 'ACTIVE' | 'INVITED' | 'INACTIVE';
  dealsCount?: number;
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'GOOGLE_ADS' | 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'OFFLINE';
  budget: number;
  spend: number;
  leadsGenerated: number;
  conversions: number;
  roi: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'PAUSED' | 'COMPLETED';
}

export interface DocumentVaultItem {
  id: string;
  name: string;
  title?: string;
  type: string;
  document_type?: string;
  category: string;
  size: string;
  file_size?: number;
  file_url?: string;
  relatedEntity: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CommunicationLog {
  id: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
  recipientName: string;
  recipientContact: string;
  subject?: string;
  content: string;
  sentBy: string;
  timestamp: string;
  deliveryStatus: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
}

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  interval: string;
  currentPeriodEnd: string;
  licensedSeats: number;
  activeSeats: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  paid_at?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  user_email?: string;
  category: string;
  ip_address?: string;
  timestamp: string;
  status: string;
}

export interface DashboardKPIs {
  totalProperties: number;
  availableProperties: number;
  activeLeads: number;
  activeDeals: number;
  wonDeals: number;
  totalDeals: number;
  closedRevenue: number;
  totalRevenue: number;
  grossBrokerage: number;
  conversionRate: number;
  enquiriesCount: number;
  todayEnquiries: number;
  todayVisits: number;
  todayTasksDue: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    request_id: string;
    page?: number;
    page_size?: number;
    total?: number;
  };
}

