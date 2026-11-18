import React, { useEffect, useState } from 'react';
import { Icon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const pageNames = {
  overview: 'Dashboard',
  properties: 'All Properties',
  listings: 'Listings & Marketplace',
  leads: 'Leads',
  contacts: 'Contacts & Clients',
  deals: 'Deals & Pipeline',
  enquiries: 'Inbound Enquiries',
  appointments: 'Appointments & Visits',
  tasks: 'Tasks & Activities',
  communications: 'Communications',
  marketing: 'Campaigns & ROI',
  documents: 'Documents & Vault',
  finance: 'Finance & Commissions',
  billing: 'SaaS Subscription',
  team: 'Team & Organization',
  audit: 'Audit & Governance',
  settings: 'Settings & Preferences',
  platform: 'Platform Admin',
};

export const TopNav = ({
  activeTab,
  onNavigate,
  onToggleSidebar,
  onOpenAddLead,
  onOpenAddProperty,
  onOpenAddDeal,
}) => {
  const { user, currency, setCurrency, activeTenant, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        await api.getHealth();
        if (mounted) setBackendOnline(true);
      } catch {
        if (mounted) setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Live system alerts
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Offer Submitted for Emerald Bay Villa', time: '12m ago', read: false },
    { id: 2, title: 'Devendra Ambani confirmed Site Visit today 2:30 PM', time: '1h ago', read: false },
    { id: 3, title: 'New Web Enquiry received from credtank.com', time: '3h ago', read: true },
  ]);

  useEffect(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) {
      setResults([]);
      return undefined;
    }

    let active = true;
    const timeout = window.setTimeout(async () => {
      try {
        const [leads, properties, contacts, deals] = await Promise.all([
          api.getLeads(),
          api.getProperties(),
          api.getContacts(),
          api.getDeals(),
        ]);
        if (!active) return;
        const leadRows = Array.isArray(leads) ? leads : [];
        const propertyRows = Array.isArray(properties) ? properties : [];
        const contactRows = Array.isArray(contacts) ? contacts : [];
        const dealRows = Array.isArray(deals) ? deals : [];

        const leadMatches = leadRows
          .filter((l) => `${l.firstName || ''} ${l.lastName || ''} ${l.phoneE164 || ''}`.toLowerCase().includes(term))
          .slice(0, 3)
          .map((l) => ({
            id: `lead-${l.id}`,
            title: `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Lead',
            detail: l.phoneE164 || l.status || 'Lead record',
            tab: 'leads',
            kind: 'Lead',
          }));

        const propertyMatches = propertyRows
          .filter((p) => `${p.title || ''} ${p.locality || ''} ${p.city || ''}`.toLowerCase().includes(term))
          .slice(0, 3)
          .map((p) => ({
            id: `prop-${p.id}`,
            title: p.title || 'Property',
            detail: `${p.locality || ''}, ${p.city || ''}`,
            tab: 'properties',
            kind: 'Property',
          }));

        const contactMatches = contactRows
          .filter((c) => `${c.fullName || ''} ${c.phone || ''}`.toLowerCase().includes(term))
          .slice(0, 3)
          .map((c) => ({
            id: `cont-${c.id}`,
            title: c.fullName || 'Contact',
            detail: `${c.type} • ${c.phone}`,
            tab: 'contacts',
            kind: 'Contact',
          }));

        const dealMatches = dealRows
          .filter((d) => `${d.title || ''} ${d.clientName || ''}`.toLowerCase().includes(term))
          .slice(0, 3)
          .map((d) => ({
            id: `deal-${d.id}`,
            title: d.title || 'Deal',
            detail: `${d.stage} • ${d.clientName}`,
            tab: 'deals',
            kind: 'Deal',
          }));

        setResults([...leadMatches, ...propertyMatches, ...contactMatches, ...dealMatches].slice(0, 7));
      } catch {
        if (active) setResults([]);
      }
    }, 200);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [query]);

  const selectResult = (result) => {
    setQuery('');
    setSearchOpen(false);
    onNavigate(result.tab);
  };

  const currencyOptions = [
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'AED', name: 'UAE Dirham (AED)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'USD', name: 'US Dollar ($)' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="topbar">
      <div className="topbar-start">
        <button className="mobile-menu-button" onClick={onToggleSidebar} aria-label="Open navigation">
          <Icon name="menu" size={19} />
        </button>

        {/* ── GovTrack360 Style Breadcrumb Line ── */}
        <div className="breadcrumb-line">
          <span className="breadcrumb-workspace">EstateCRM</span>
          <Icon name="chevronRight" size={14} />
          <span className="breadcrumb-current">{pageNames[activeTab] || 'Workspace'}</span>
        </div>

        {/* ── GovTrack360 System Online Pill ── */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 99,
          background: backendOnline ? 'var(--color-success-bg)' : '#FFF0EF',
          color: backendOnline ? 'var(--color-success)' : '#BA181B',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.04em',
          border: `1px solid ${backendOnline ? 'rgba(36, 112, 68, 0.2)' : 'rgba(186, 24, 27, 0.2)'}`,
          marginLeft: 10,
        }} title={backendOnline ? 'Connected to FastAPI backend at http://localhost:8000/api/v1' : 'Backend is unreachable. Start FastAPI backend on port 8000'}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: backendOnline ? 'var(--color-success)' : '#BA181B',
            display: 'inline-block',
            boxShadow: `0 0 0 2px ${backendOnline ? 'rgba(36, 112, 68, 0.2)' : 'rgba(186, 24, 27, 0.2)'}`,
          }} />
          {backendOnline ? 'SYSTEM ONLINE' : 'BACKEND OFFLINE'}
        </div>
      </div>

      {/* ── Global Quick Search ── */}
      <div className="topbar-search global-search-wrap">
        <Icon name="search" size={16} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false); }}
          placeholder="Search leads, properties, contacts, deals..."
          aria-label="Global search"
        />
        <kbd>⌘ K</kbd>
        {searchOpen && query.trim().length >= 2 && (
          <div className="search-results glass-dropdown">
            {results.length ? results.map((result) => (
              <button key={result.id} className="search-result" onClick={() => selectResult(result)}>
                <span className="search-result-icon">
                  <Icon name={
                    result.kind === 'Lead' ? 'users' :
                    result.kind === 'Property' ? 'building' :
                    result.kind === 'Deal' ? 'briefcase' : 'contact'
                  } size={15} />
                </span>
                <span className="search-result-copy">
                  <span>{result.title}</span>
                  <small>{result.detail}</small>
                </span>
                <span className="search-result-kind">{result.kind}</span>
              </button>
            )) : (
              <p className="search-empty">No matching records found in database.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Actions & Top Right Controls ── */}
      <div className="topbar-actions">
        {/* Currency Switcher */}
        <div className="currency-control" style={{ position: 'relative' }}>
          <button
            className="currency-button"
            onClick={() => setShowCurrencyDropdown(open => !open)}
            aria-expanded={showCurrencyDropdown}
            aria-label="Choose currency"
          >
            {currency}<Icon name="chevronDown" size={13} />
          </button>
          {showCurrencyDropdown && (
            <div className="currency-menu glass-dropdown" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 60 }}>
              {currencyOptions.map((option) => (
                <button
                  key={option.code}
                  onClick={() => { setCurrency(option.code); setShowCurrencyDropdown(false); }}
                  className={currency === option.code ? 'is-selected' : ''}
                >
                  <span>{option.code}</span><small>{option.name}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <button className="topbar-secondary-action" onClick={onOpenAddProperty} title="Catalogue new property">
          <Icon name="building" size={15} /><span>Add property</span>
        </button>
        <button className="topbar-primary-action" onClick={onOpenAddLead} title="Capture new client lead">
          <Icon name="plus" size={15} /><span>New lead</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(s => !s)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'white',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--color-text-secondary)',
              position: 'relative',
              cursor: 'pointer',
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Icon name="bell" size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--color-primary)',
              }} />
            )}
          </button>

          {showNotifications && (
            <div className="glass-dropdown" style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: 320,
              borderRadius: 10,
              padding: '14px',
              zIndex: 70,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>System Notifications</strong>
                <button
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  style={{ background: 'none', color: 'var(--color-primary)', fontSize: 11, fontWeight: 600 }}
                >
                  Mark all read
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: n.read ? 'rgba(250, 249, 246, 0.7)' : 'rgba(255, 240, 232, 0.85)',
                    border: '1px solid rgba(240, 237, 231, 0.8)',
                    fontSize: 11,
                  }}>
                    <p style={{ margin: '0 0 3px 0', fontWeight: 600, color: 'var(--color-text-primary)' }}>{n.title}</p>
                    <span style={{ color: 'var(--color-muted)', fontSize: 10 }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Icon */}
        <button
          onClick={() => setShowHelpModal(true)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'white',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
          title="EstateCRM Documentation & Help"
          aria-label="Help & Documentation"
        > 
          <Icon name="helpCircle" size={16} />
        </button>

        {/* User Avatar & Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(s => !s)}
            className="topbar-profile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-expanded={showProfileMenu}
          >
            <div className="topbar-avatar">{user?.fullName?.charAt(0) || 'U'}</div>
            <div className="topbar-profile-copy" style={{ textAlign: 'left' }}>
              <span>{user?.fullName || 'Account'}</span>
              <small>{user?.role?.replaceAll('_', ' ') || 'Member'}</small>
            </div>
            <Icon name="chevronDown" size={13} style={{ color: 'var(--color-muted)' }} />
          </button>

          {showProfileMenu && (
            <div className="glass-dropdown" style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              width: 220,
              borderRadius: 10,
              padding: 8,
              zIndex: 70,
            }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0ede7', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', display: 'block' }}>
                  {user?.fullName}
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-muted)', display: 'block' }}>
                  {activeTenant?.name}
                </span>
              </div>
              <button
                onClick={() => { setShowProfileMenu(false); onNavigate('settings'); }}
                style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 6, background: 'none', textAlign: 'left', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}
              >
                <Icon name="settings" size={14} />
                <span>Account Settings</span>
              </button>
              <button
                onClick={() => { setShowProfileMenu(false); onNavigate('team'); }}
                style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 6, background: 'none', textAlign: 'left', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}
              >
                <Icon name="userCheck" size={14} />
                <span>Team Directory</span>
              </button>
              <div style={{ borderTop: '1px solid #f0ede7', margin: '6px 0' }} />
              <button
                onClick={() => { setShowProfileMenu(false); logout(); }}
                style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 6, background: 'none', textAlign: 'left', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-danger)' }}
              >
                <Icon name="logOut" size={14} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="dialog-backdrop" onClick={() => setShowHelpModal(false)}>
          <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <header>
              <div>
                <span className="eyebrow">OPERATIONAL REFERENCE</span>
                <h2>EstateCRM Knowledge Base</h2>
              </div>
              <button className="icon-action" onClick={() => setShowHelpModal(false)}>
                <Icon name="x" size={16} />
              </button>
            </header>
            <div style={{ padding: '16px 0', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 10 }}>
                <strong>EstateCRM v1.0 Blueprint:</strong> Designed using GovTrack360 design architecture with warm ivory canvases, charcoal typography, and deliberate orange interactive accents.
              </p>
              <ul style={{ paddingLeft: 18, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>Properties:</strong> Catalogues residential, commercial, and land assets with RERA registration numbers.</li>
                <li><strong>Listings:</strong> Syndicates approved property assets to the public verified portal.</li>
                <li><strong>Deals Pipeline:</strong> Track offers, booking tokens, agreement milestones, and broker commissions.</li>
                <li><strong>Audit Logs:</strong> Real-time immutable event tracking for compliance.</li>
              </ul>
              <div style={{ padding: 12, borderRadius: 8, background: '#F8F7F4', border: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 700, display: 'block', marginBottom: 2 }}>Need priority engineering support?</span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Contact platform team at support@estatecrm.com</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
