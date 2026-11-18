import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';

export const SettingsPanel = () => {
  const { user, setUser, activeTenant, setActiveTenant, currency, setCurrency } = useAuth();
  const [tab, setTab] = useState('PROFILE'); // 'PROFILE' | 'SECURITY' | 'AGENCY' | 'CRM' | 'INTEGRATIONS' | 'APPEARANCE'

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName || 'Alexander Wright');
  const [email, setEmail] = useState(user?.email || 'admin@estatecrm.com');
  const [phone, setPhone] = useState('+91 98200 11000');
  const [profileSaved, setProfileSaved] = useState(false);

  // Agency form
  const [agencyName, setAgencyName] = useState(activeTenant?.name || 'Apex Horizon Capital');
  const [reraLicense, setReraLicense] = useState('A51800004921');
  const [agencySaved, setAgencySaved] = useState(false);

  // Security form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  // Integrations state
  const [integrations, setIntegrations] = useState({
    stripe: { connected: true, key: 'sk_live_••••••••••••9012' },
    whatsapp: { connected: true, key: 'WABA_ID_••••••••4120' },
    sendgrid: { connected: true, key: 'SG.••••••••••••8819' },
    twilio: { connected: false, key: '' },
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    setUser(prev => ({ ...prev, fullName, email }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAgencySave = (e) => {
    e.preventDefault();
    setActiveTenant(prev => ({ ...prev, name: agencyName }));
    setAgencySaved(true);
    setTimeout(() => setAgencySaved(false), 3000);
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    if (!newPw) return;
    setPwSaved(true);
    setCurrentPw('');
    setNewPw('');
    setTimeout(() => setPwSaved(false), 3000);
  };

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">SYSTEM & WORKSPACE PREFERENCES</span>
          <h1 className="dashboard-title">SETTINGS & CONFIGURATION</h1>
          <p className="dashboard-subtitle">
            Configure agency branding, individual profile, security policies, API integrations, and CRM pipeline.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        {/* ── Settings Subnav ── */}
        <div style={{
          background: 'white',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          padding: 8,
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {[
            { id: 'PROFILE', label: 'My Profile', icon: 'users' },
            { id: 'SECURITY', label: 'Account & Security', icon: 'shield' },
            { id: 'AGENCY', label: 'Agency Profile', icon: 'building' },
            { id: 'CRM', label: 'CRM & Pipeline', icon: 'briefcase' },
            { id: 'INTEGRATIONS', label: 'API Integrations', icon: 'server' },
            { id: 'APPEARANCE', label: 'Theme & Appearance', icon: 'settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                height: 38,
                padding: '0 12px',
                borderRadius: 6,
                background: tab === item.id ? 'var(--color-primary)' : 'transparent',
                color: tab === item.id ? 'white' : 'var(--color-text-secondary)',
                fontWeight: tab === item.id ? 700 : 500,
                fontSize: 12,
                textAlign: 'left',
              }}
            >
              <Icon name={item.icon} size={15} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── Settings Content Area ── */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* ── Tab: Profile ── */}
          {tab === 'PROFILE' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Personal Profile Details
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 12, marginBottom: 20 }}>
                Update your contact details, designation, and default working timezone.
              </p>

              {profileSaved && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
                  Profile successfully updated!
                </div>
              )}

              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 10 }}>
                  <button
                    type="submit"
                    style={{ height: 36, padding: '0 18px', borderRadius: 7, background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: 12 }}
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Tab: Security ── */}
          {tab === 'SECURITY' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Password & Session Management
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 12, marginBottom: 20 }}>
                Maintain enterprise security with strong credentials and active device session control.
              </p>

              {pwSaved && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
                  Password updated and all other sessions refreshed.
                </div>
              )}

              <form onSubmit={handleSecuritySave} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 440, marginBottom: 28 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter existing password"
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min 8 characters with numbers & symbols"
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    style={{ height: 36, padding: '0 18px', borderRadius: 7, background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: 12 }}
                  >
                    Update Password
                  </button>
                </div>
              </form>

              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 10 }}>
                Active Authenticated Sessions
              </h4>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#FAF9F6' }}>
                  <div>
                    <strong style={{ fontSize: 12, display: 'block' }}>Chrome on macOS (Current Browser)</strong>
                    <small style={{ color: 'var(--color-muted)' }}>IP: 103.21.124.89 • Active now</small>
                  </div>
                  <span className="status-pill status-converted">This Device</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Agency Profile ── */}
          {tab === 'AGENCY' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Agency Corporate Information
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 12, marginBottom: 20 }}>
                Configure company legal name, RERA registration, and client-facing branding.
              </p>

              {agencySaved && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
                  Agency settings saved!
                </div>
              )}

              <form onSubmit={handleAgencySave} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Agency Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    RERA Broker License Registration Number
                  </label>
                  <input
                    type="text"
                    value={reraLicense}
                    onChange={(e) => setReraLicense(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13, fontFamily: 'monospace' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                      Default Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 13 }}
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="AED">AED (United Arab Emirates Dirham)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                      Headquarters City
                    </label>
                    <input
                      type="text"
                      defaultValue="Mumbai, India"
                      style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    style={{ height: 36, padding: '0 18px', borderRadius: 7, background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: 12 }}
                  >
                    Save Agency Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Tab: Integrations ── */}
          {tab === 'INTEGRATIONS' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Third-Party Provider Adapters
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 12, marginBottom: 20 }}>
                Manage encrypted API keys for payment gateways, messaging cloud providers, and mapping APIs.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { id: 'whatsapp', name: 'Meta WhatsApp Cloud API', desc: 'Direct client messaging & site visit alerts', connected: true, key: 'WABA_ID_••••4120' },
                  { id: 'stripe', name: 'Stripe Payments', desc: 'Customer token advances & SaaS billing gateway', connected: true, key: 'sk_live_••••9012' },
                  { id: 'sendgrid', name: 'SendGrid Email API', desc: 'Transactional PDF agreements & brochures', connected: true, key: 'SG.••••8819' },
                  { id: 'twilio', name: 'Twilio SMS Gateway', desc: 'Instant OTP and high-priority SMS alerts', connected: false, key: 'Unconfigured' },
                ].map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: '#FAF9F6',
                  }}>
                    <div>
                      <strong style={{ fontSize: 13, color: 'var(--color-text-primary)', display: 'block' }}>{item.name}</strong>
                      <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{item.desc}</span>
                      <small style={{ display: 'block', fontFamily: 'monospace', marginTop: 4, color: 'var(--color-text-secondary)' }}>
                        Key: {item.key}
                      </small>
                    </div>
                    <div>
                      <span className={`status-pill ${item.connected ? 'status-converted' : 'status-lost'}`}>
                        {item.connected ? '● Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: Appearance ── */}
          {tab === 'APPEARANCE' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                EstateCRM Design System & Palette
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 12, marginBottom: 20 }}>
                Official color tokens applied across dashboard cards, sidebar, and data tables.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  { name: 'Warm Ivory Background', hex: '#FFFCF2', desc: 'Primary canvas background' },
                  { name: 'Estate Brand Orange', hex: '#EB5E28', desc: 'Primary CTA and active navigation' },
                  { name: 'Deep Charcoal Typography', hex: '#252422', desc: 'High-contrast headings and text' },
                  { name: 'Success Emerald', hex: '#247044', desc: 'Closed deals and verified status' },
                  { name: 'Info Blue', hex: '#345487', desc: 'Scheduled visits and notifications' },
                  { name: 'Alert Red', hex: '#BA181B', desc: 'Urgent follow-ups and errors' },
                ].map((c, i) => (
                  <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: 48, background: c.hex }} />
                    <div style={{ padding: 10, background: 'white' }}>
                      <strong style={{ fontSize: 12, display: 'block' }}>{c.name}</strong>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-muted)' }}>{c.hex}</span>
                      <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: CRM & Pipeline Config ── */}
          {tab === 'CRM' && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                CRM Pipeline Stages & Lead Sources
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: 12, marginBottom: 20 }}>
                Configure pipeline progression milestones for your sales brokers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { stage: '1. Opportunity Identified', prob: '30%', desc: 'Initial contact established' },
                  { stage: '2. Offer Submitted', prob: '50%', desc: 'Formal client offer presented' },
                  { stage: '3. Under Negotiation', prob: '70%', desc: 'Terms and counteroffers discussed' },
                  { stage: '4. Booking / Token Deposit', prob: '85%', desc: 'Token advance cleared' },
                  { stage: '5. Agreement Drafted', prob: '95%', desc: 'Legal clearance & registration' },
                  { stage: '6. Closed Won', prob: '100%', desc: 'Deal concluded, commission recognized' },
                ].map((s, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid #f0ede7',
                    background: '#FAF9F6',
                    fontSize: 12,
                  }}>
                    <div>
                      <strong>{s.stage}</strong>
                      <span style={{ color: 'var(--color-muted)', marginLeft: 8 }}>({s.desc})</span>
                    </div>
                    <span className="status-pill status-qualified">Default Probability: {s.prob}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

