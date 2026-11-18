import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPages } from './components/auth/AuthPages';
import { Sidebar } from './components/crm/Sidebar';
import { TopNav } from './components/crm/TopNav';

// ── All 17 Core Enterprise Functional Module Panels ─────────────────────────
import { DashboardPanel } from './components/crm/DashboardPanel';
import { PropertiesPanel } from './components/crm/PropertiesPanel';
import { ListingsPanel } from './components/crm/ListingsPanel';
import { LeadsPanel } from './components/crm/LeadsPanel';
import { ContactsPanel } from './components/crm/ContactsPanel';
import { DealsPanel } from './components/crm/DealsPanel';
import { EnquiriesPanel } from './components/crm/EnquiriesPanel';
import { AppointmentsPanel } from './components/crm/AppointmentsPanel';
import { TasksPanel } from './components/crm/TasksPanel';
import { CommunicationsPanel } from './components/crm/CommunicationsPanel';
import { MarketingPanel } from './components/crm/MarketingPanel';
import { DocumentsPanel } from './components/crm/DocumentsPanel';
import { FinancePanel } from './components/crm/FinancePanel';
import { BillingPanel } from './components/crm/BillingPanel';
import { TeamPanel } from './components/crm/TeamPanel';
import { AuditPanel } from './components/crm/AuditPanel';
import { SettingsPanel } from './components/crm/SettingsPanel';
import { PlatformAdminPanel } from './components/crm/PlatformAdminPanel';

// ── Quick Creation Modals ───────────────────────────────────────────────────
import { AddLeadModal } from './components/crm/AddLeadModal';
import { AddPropertyModal } from './components/crm/AddPropertyModal';
import { AddDealModal } from './components/crm/AddDealModal';

// ─── Main Authenticated CRM Application ─────────────────────────────────────
function CRMApp() {
  const { isAuthenticated } = useAuth();

  // If not logged in, render the Auth system
  if (!isAuthenticated) {
    return <AuthPages />;
  }

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Creation Modals
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);

  // Refresh counters
  const [leadsRefreshKey, setLeadsRefreshKey] = useState(0);
  const [propertiesRefreshKey, setPropertiesRefreshKey] = useState(0);
  const [dealsRefreshKey, setDealsRefreshKey] = useState(0);

  const handleLeadAdded = () => {
    setShowAddLead(false);
    setLeadsRefreshKey(k => k + 1);
    setActiveTab('leads');
  };

  const handlePropertyAdded = () => {
    setShowAddProperty(false);
    setPropertiesRefreshKey(k => k + 1);
    setActiveTab('properties');
  };

  const handleDealAdded = () => {
    setShowAddDeal(false);
    setDealsRefreshKey(k => k + 1);
    setActiveTab('deals');
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardPanel
            onNavigate={setActiveTab}
            onOpenAddLead={() => setShowAddLead(true)}
            onOpenAddProperty={() => setShowAddProperty(true)}
          />
        );
      case 'properties':
        return (
          <PropertiesPanel
            key={propertiesRefreshKey}
            onOpenAddProperty={() => setShowAddProperty(true)}
          />
        );
      case 'listings':
        return <ListingsPanel onNavigate={setActiveTab} />;
      case 'leads':
        return (
          <LeadsPanel
            key={leadsRefreshKey}
            onOpenAddLead={() => setShowAddLead(true)}
          />
        );
      case 'contacts':
        return <ContactsPanel onNavigate={setActiveTab} />;
      case 'deals':
        return (
          <DealsPanel
            key={dealsRefreshKey}
            onOpenAddDeal={() => setShowAddDeal(true)}
          />
        );
      case 'enquiries':
        return <EnquiriesPanel onNavigate={setActiveTab} />;
      case 'appointments':
        return <AppointmentsPanel onNavigate={setActiveTab} />;
      case 'tasks':
        return <TasksPanel onNavigate={setActiveTab} />;
      case 'communications':
        return <CommunicationsPanel onNavigate={setActiveTab} />;
      case 'marketing':
        return <MarketingPanel onNavigate={setActiveTab} />;
      case 'documents':
        return <DocumentsPanel onNavigate={setActiveTab} />;
      case 'finance':
        return <FinancePanel onNavigate={setActiveTab} />;
      case 'billing':
        return <BillingPanel onNavigate={setActiveTab} />;
      case 'team':
        return <TeamPanel onNavigate={setActiveTab} />;
      case 'audit':
        return <AuditPanel onNavigate={setActiveTab} />;
      case 'settings':
        return <SettingsPanel onNavigate={setActiveTab} />;
      case 'platform':
        return <PlatformAdminPanel onNavigate={setActiveTab} />;
      default:
        return (
          <DashboardPanel
            onNavigate={setActiveTab}
            onOpenAddLead={() => setShowAddLead(true)}
            onOpenAddProperty={() => setShowAddProperty(true)}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {/* GovTrack360-Style Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Workspace Surface */}
      <div className="app-main">
        {/* GovTrack360 Top Navigation Header */}
        <TopNav
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onToggleSidebar={() => setSidebarOpen(open => !open)}
          onOpenAddLead={() => setShowAddLead(true)}
          onOpenAddProperty={() => setShowAddProperty(true)}
          onOpenAddDeal={() => setShowAddDeal(true)}
        />

        {/* Scrollable Page Content */}
        <main className="page-scroll">
          <div className="page-content">{renderPanel()}</div>
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <AddLeadModal
        isOpen={showAddLead}
        onClose={() => setShowAddLead(false)}
        onSuccess={handleLeadAdded}
      />
      <AddPropertyModal
        isOpen={showAddProperty}
        onClose={() => setShowAddProperty(false)}
        onSuccess={handlePropertyAdded}
      />
      <AddDealModal
        isOpen={showAddDeal}
        onClose={() => setShowAddDeal(false)}
        onSuccess={handleDealAdded}
      />
    </div>
  );
}

// ─── Root export wrapped in AuthProvider ──────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <CRMApp />
    </AuthProvider>
  );
}
