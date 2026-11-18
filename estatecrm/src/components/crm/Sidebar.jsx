import React from 'react';
import { Icon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ activeTab, onTabChange, collapsed, onToggleCollapse, mobileOpen, onClose }) => {
  const { user, activeTenant, logout } = useAuth();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navigationGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Dashboard', icon: 'layoutDashboard' },
      ],
    },
    {
      label: 'PROPERTY',
      items: [
        { id: 'properties', label: 'All Properties', icon: 'building' },
        { id: 'listings', label: 'Listings & Marketplace', icon: 'globe' },
      ],
    },
    {
      label: 'CRM & SALES',
      items: [
        { id: 'leads', label: 'Leads', icon: 'users' },
        { id: 'contacts', label: 'Contacts & Clients', icon: 'contact' },
        { id: 'deals', label: 'Deals & Pipeline', icon: 'briefcase' },
        { id: 'enquiries', label: 'Inbound Enquiries', icon: 'inbox' },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        { id: 'appointments', label: 'Appointments & Visits', icon: 'calendar' },
        { id: 'tasks', label: 'Tasks & Activities', icon: 'checkSquare' },
        { id: 'communications', label: 'Communications', icon: 'messageSquare' },
      ],
    },
    {
      label: 'MANAGEMENT',
      items: [
        { id: 'marketing', label: 'Campaigns & ROI', icon: 'megaphone' },
        { id: 'documents', label: 'Documents & Vault', icon: 'fileText' },
        { id: 'finance', label: 'Finance & Commissions', icon: 'dollarSign' },

      ],
    },
    {
      label: 'ADMINISTRATION',
      items: [
        { id: 'team', label: 'Employees & Teams', icon: 'userCheck' },
        { id: 'billing', label: 'Billing & Subscriptions', icon: 'creditCard' },
        { id: 'audit', label: 'Audit Logs', icon: 'shield' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
      ],
    },
  ];

  if (isSuperAdmin) {
    navigationGroups.push({
      label: 'SAAS PLATFORM',
      items: [
        { id: 'platform', label: 'Platform Admin', icon: 'server' },
      ],
    });
  }

  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`}>
        {/* Brand Lockup */}
        <div className="sidebar-top">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <span className="font-display font-bold">E</span>
            </div>
            {!collapsed && (
              <div className="brand-copy">
                <span className="brand-name">EstateCRM</span>
                <span className="brand-tenant">{activeTenant?.name || 'Beverly & Hill Agency'}</span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="sidebar-collapse"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name={collapsed ? 'chevronRight' : 'panelLeft'} size={16} />
          </button>
          <button onClick={onClose} className="sidebar-mobile-close" aria-label="Close navigation">
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Categorized Navigation */}
        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigationGroups.map((group) => (
            <div className="sidebar-group" key={group.label}>
              {!collapsed && <p className="sidebar-section-label">{group.label}</p>}
              {group.items.map((item) => {
                const isActive = activeTab === item.id && !item.isAlias;
                return (
                  <button
                    key={`${group.label}-${item.id}-${item.label}`}
                    onClick={() => { onTabChange(item.id); if (onClose) onClose(); }}
                    className={`sidebar-link ${isActive ? 'is-active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon name={item.icon} size={16} className={isActive ? 'text-[#EB5E28]' : 'text-prop-muted'} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Mobile App Promo Card (Matching Image 2 Bottom Card) */}
        {/* {!collapsed && (
          <div className="mx-3 my-2 p-3.5 rounded-2xl bg-[#161A1D] text-white relative overflow-hidden border border-neutral-800 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-prop-champagne text-white flex items-center justify-center text-[10px] font-bold">
                  ★
                </div>
                <span className="text-xs font-bold text-white">EstateCRM Mobile</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight mb-2.5">
                Real-time site visits & offline lead sync on iOS & Android.
              </p>
              <button
                onClick={() => alert('Download EstateCRM Mobile from the App Store.')}
                className="w-full py-1.5 rounded-lg bg-prop-champagne hover:bg-prop-champagneDark text-white text-[10px] font-semibold transition-colors"
              >
                Get Mobile App
              </button>
            </div>
          </div>
        )} */}

        {/* User Account / Profile */}
        <div className="sidebar-account">
          <div className="account-avatar">{user?.fullName?.charAt(0) || 'A'}</div>
          {!collapsed && (
            <div className="account-copy">
              <span className="account-name">{user?.fullName || 'Alexander Wright'}</span>
              <span className="account-role">{user?.role?.replaceAll('_', ' ') || 'Managing Broker'}</span>
            </div>
          )}
          <button onClick={logout} className="account-logout" title="Sign out" aria-label="Sign out">
            <Icon name="logOut" size={15} />
          </button>
        </div>
      </aside>
    </>
  );
};
