// Centralized API Endpoint Definitions for EstateOS

export const ENDPOINTS = {
  // Health
  HEALTH: '/health',

  // Authentication & Session
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SWITCH_TENANT: '/auth/switch-tenant',
  },

  // Dashboard & Analytics
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    AGENCY: '/dashboard/agency',
    ANALYTICS: '/analytics',
  },

  // CRM & Leads
  LEADS: {
    LIST: '/leads',
    CREATE: '/leads',
    GET: (id: string) => `/leads/${id}`,
    UPDATE: (id: string) => `/leads/${id}`,
    DELETE: (id: string) => `/leads/${id}`,
    ASSIGN: (id: string) => `/leads/${id}/assign`,
    ACTIVITIES: (id: string) => `/leads/${id}/activities`,
  },

  // Contacts
  CONTACTS: {
    LIST: '/contacts',
    CREATE: '/contacts',
    GET: (id: string) => `/contacts/${id}`,
    UPDATE: (id: string) => `/contacts/${id}`,
    DELETE: (id: string) => `/contacts/${id}`,
  },

  // Properties
  PROPERTIES: {
    LIST: '/properties',
    CREATE: '/properties',
    GET: (id: string) => `/properties/${id}`,
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    SEARCH: '/properties/search',
  },

  // Listings
  LISTINGS: {
    LIST: '/listings',
    CREATE: '/listings',
    GET: (id: string) => `/listings/${id}`,
    UPDATE: (id: string) => `/listings/${id}`,
    UPDATE_STATUS: (id: string) => `/listings/${id}/status`,
    PUBLISH: (id: string) => `/listings/${id}/publish`,
    UNPUBLISH: (id: string) => `/listings/${id}/unpublish`,
    PUBLIC_LIST: '/public/listings',
    PUBLIC_GET: (slug: string) => `/public/listings/${slug}`,
  },

  // Enquiries
  ENQUIRIES: {
    LIST: '/enquiries',
    CREATE: '/enquiries',
    GET: (id: string) => `/enquiries/${id}`,
    UPDATE: (id: string) => `/enquiries/${id}`,
    CONVERT: (id: string) => `/enquiries/${id}/convert`,
  },

  // Appointments
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    GET: (id: string) => `/appointments/${id}`,
    UPDATE: (id: string) => `/appointments/${id}`,
    DELETE: (id: string) => `/appointments/${id}`,
  },

  // Tasks
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    GET: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    TOGGLE: (id: string) => `/tasks/${id}/toggle`,
    MY_TASKS: '/tasks/my-tasks',
  },

  // Deals & Transactions
  DEALS: {
    LIST: '/deals',
    CREATE: '/deals',
    GET: (id: string) => `/deals/${id}`,
    UPDATE: (id: string) => `/deals/${id}`,
    UPDATE_STAGE: (id: string) => `/deals/${id}/stage`,
    PAYMENTS: (id: string) => `/deals/${id}/payments`,
    OFFERS: (id: string) => `/deals/${id}/offers`,
    DELETE: (id: string) => `/deals/${id}`,
  },

  // Finance & Accounting
  FINANCE: {
    TRANSACTIONS: '/finance/transactions',
    CREATE_TRANSACTION: '/finance/transactions',
    EXPENSES: '/finance/expenses',
    CREATE_EXPENSE: '/finance/expenses',
    COMMISSIONS: '/finance/commissions',
    COMMISSIONS_ROOT: '/commissions',
    PAYOUT_COMMISSION: (id: string) => `/finance/commissions/${id}/payout`,
  },

  // Organization, Teams & Members
  ORGANIZATION: {
    BRANCHES: '/organization/branches',
    CREATE_BRANCH: '/organization/branches',
    TEAMS: '/organization/teams',
    CREATE_TEAM: '/organization/teams',
    MEMBERS: '/organization/members',
    INVITE: '/organization/members/invite',
  },

  // Marketing Campaigns
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    GET: (id: string) => `/campaigns/${id}`,
    UPDATE: (id: string) => `/campaigns/${id}`,
  },

  // Document Vault
  DOCUMENTS: {
    LIST: '/documents',
    CREATE: '/documents',
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
  },

  // Communications (Email, SMS, WhatsApp)
  COMMUNICATIONS: {
    LIST: '/communications',
    SEND: '/communications/send',
  },

  // Billing & Subscriptions
  BILLING: {
    SUBSCRIPTION: '/billing/subscription',
    INVOICES: '/billing/invoices',
  },

  // Audit Logs
  AUDIT: {
    LIST: '/audit-logs',
  },

  // SaaS Platform Administration
  PLATFORM: {
    DASHBOARD: '/platform/dashboard',
    STATS: '/platform/stats',
    TENANTS: '/platform/tenants',
    TOGGLE_STATUS: (id: string) => `/platform/tenants/${id}/toggle-status`,
  },
};

