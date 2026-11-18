import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../common/Icons';

export const LeadsPanel = ({ onOpenAddLead }) => {
  const { formatCurrency } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [error, setError] = useState('');
  const [customerSubTab, setCustomerSubTab] = useState('Summary'); // 'Summary' | 'Analytics' | 'Details' | 'Timeline'
  const [timelineNotes, setTimelineNotes] = useState([
    { id: 1, type: 'CALL', text: 'Spoke with client regarding sea-facing penthouse specifications. Highly interested in high-floor units with private elevator.', time: '2 hours ago', by: 'Alexander Wright' },
    { id: 2, type: 'EMAIL', text: 'Dispatched verified architectural sanction plans and RERA certificate via SendGrid.', time: 'Yesterday at 4:15 PM', by: 'Alexander Wright' },
  ]);
  const [newNote, setNewNote] = useState('');

  const loadLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLeads();
      setLeads(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(err.message || 'Unable to load leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this lead record? This action is audited and irreversible.')) {
      try {
        await api.deleteLead(id);
        setSelectedIds(current => current.filter(selectedId => selectedId !== id));
        if (selectedLead?.id === id) setSelectedLead(null);
        loadLeads();
      } catch (err) {
        setError(err.message || 'Unable to delete this lead.');
      }
    }
  };

  const handleStatusAdvance = async (leadId, nextStatus) => {
    await api.updateLead(leadId, { status: nextStatus });
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => ({ ...prev, status: nextStatus }));
    }
    loadLeads();
  };

  const handleAddTimelineNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setTimelineNotes([
      { id: Date.now(), type: 'NOTE', text: newNote, time: 'Just now', by: 'Alexander Wright' },
      ...timelineNotes,
    ]);
    setNewNote('');
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      `${l.firstName || ''} ${l.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.phoneE164 || '').includes(searchQuery) ||
      (l.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.preferredLocality || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || l.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="crm-panel-container">
      {/* ── If a lead is selected: Render Microsoft Dynamics 365 Sales Hub Customer Workspace ── */}
      {selectedLead ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* 1. Dynamics 365 Action Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            background: '#F8F7F4',
            borderBottom: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                ← Back to Lead Queue
              </button>
              <span style={{ color: 'var(--color-border)' }}>|</span>
              <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Lead ID: {selectedLead.id}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => alert(`Dialing ${selectedLead.phoneE164}...`)}
                style={{ height: 32, padding: '0 12px', borderRadius: 6, background: '#252422', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Icon name="phone" size={13} />
                <span>Call Client</span>
              </button>
              <button
                onClick={() => alert(`WhatsApp chat initiated for ${selectedLead.phoneE164}`)}
                style={{ height: 32, padding: '0 12px', borderRadius: 6, background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid rgba(36,112,68,0.2)', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Icon name="messageSquare" size={13} />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => alert(`Exported client dossier to PDF for ${selectedLead.firstName}`)}
                style={{ height: 32, padding: '0 10px', borderRadius: 6, background: 'white', border: '1px solid var(--color-border)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}
              >
                To PDF
              </button>
              <button
                onClick={() => handleDelete(selectedLead.id)}
                style={{ height: 32, padding: '0 10px', borderRadius: 6, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid rgba(186,24,27,0.2)', fontSize: 11, fontWeight: 600 }}
              >
                Delete
              </button>
            </div>
          </div>

          {/* 2. Dynamics 365 Customer Banner Header */}
          <div style={{
            padding: '24px 28px',
            background: 'linear-gradient(180deg, #FAF9F6 0%, #FFFFFF 100%)',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#252422',
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: 600,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {selectedLead.firstName?.charAt(0)}{selectedLead.lastName?.charAt(0)}
                </div>
                <div>
                  <h1 style={{ fontSize: 'var(--font-size-page-heading, 24px)', fontWeight: 'var(--font-weight-semibold, 600)', color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h1>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    Preferred Locality: {selectedLead.preferredLocality || 'Prime Mumbai & Coastal'} • Asset: {selectedLead.propertyTypePreference}
                  </span>
                </div>
              </div>

              {/* Metadata chips */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block' }}>Lead Source</span>
                  <strong style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{selectedLead.source}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block' }}>Rating</span>
                  <span className="status-pill status-qualified" style={{ marginTop: 2 }}>Warm Prospect</span>
                </div>
                <div>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block' }}>Stage Status</span>
                  <span className="status-pill status-converted" style={{ marginTop: 2 }}>{selectedLead.status}</span>
                </div>
                <div>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block' }}>Owner</span>
                  <strong style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{selectedLead.assignedAgent || 'Alexander Wright'}</strong>
                </div>
              </div>
            </div>

            {/* 3. Dynamics 365 Opportunity Process Ribbon (Chevron pipeline path) */}
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block', marginBottom: 8, letterSpacing: '0.04em' }}>
                OPPORTUNITY SALES PROCESS (DYNAMICS 365 WORKFLOW)
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
              }}>
                {[
                  { id: 'NEW', label: '1. Qualify', desc: 'Screen budget & intent' },
                  { id: 'QUALIFIED', label: '2. Develop', desc: 'Curate inventory shortlist' },
                  { id: 'SITE_VISIT', label: '3. Propose', desc: 'Private site inspection' },
                  { id: 'NEGOTIATION', label: '4. Close', desc: 'Terms & booking token' },
                ].map((step, idx) => {
                  const isActive = selectedLead.status === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStatusAdvance(selectedLead.id, step.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: isActive ? '#252422' : '#F5F3F4',
                        color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                        border: '1px solid',
                        borderColor: isActive ? '#252422' : 'var(--color-border)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 140ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 12 }}>{step.label}</strong>
                        {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EB5E28' }} />}
                      </div>
                      <span style={{ fontSize: 10, color: isActive ? '#CCC5B9' : 'var(--color-muted)', display: 'block', marginTop: 2 }}>
                        {step.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Sub-Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: 16,
            padding: '0 28px',
            borderBottom: '1px solid var(--color-border)',
            background: '#FFFFFF',
          }}>
            {['Summary', 'Details', 'Timeline & Notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setCustomerSubTab(tab)}
                style={{
                  padding: '14px 4px',
                  background: 'none',
                  borderBottom: customerSubTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: customerSubTab === tab ? 'var(--color-text-primary)' : 'var(--color-muted)',
                  fontWeight: customerSubTab === tab ? 700 : 500,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 5. Dynamics 365 Three-Column Dossier Layout */}
          <div style={{
            padding: '24px 28px',
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr 0.8fr',
            gap: 20,
            alignItems: 'start',
            background: 'var(--color-background)',
          }}>
            {/* Column 1: Contact Card & Preferences */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                padding: '18px 20px',
                boxShadow: 'var(--shadow-card)',
              }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Contact Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: 10 }}>Primary Phone</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{selectedLead.phoneE164}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: 10 }}>Email Address</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{selectedLead.email || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: 10 }}>Budget Range</span>
                    <strong style={{ color: 'var(--color-primary-hover)' }}>
                      {selectedLead.budgetMin ? `${formatCurrency(selectedLead.budgetMin)} - ${formatCurrency(selectedLead.budgetMax)}` : 'On Request'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: 10 }}>Asset Category Preference</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{selectedLead.propertyTypePreference}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: 10 }}>Preferred Locality</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{selectedLead.preferredLocality || 'Prime Mumbai & Coastal'}</strong>
                  </div>
                </div>
              </div>

              {selectedLead.notes && (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  padding: '18px 20px',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Mandate Notes
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    "{selectedLead.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Column 2: Dynamics 365 "Up Next" Card & Activity Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Up Next Card (Dynamics 365 signature element) */}
              <div style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF7 100%)',
                borderRadius: 12,
                border: '1px solid #EEDFBC',
                padding: '18px 20px',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#8F7549', letterSpacing: '0.04em' }}>
                    UP NEXT (SEQUENCE: LUXURY BUYER NURTURING)
                  </span>
                  <span className="status-pill status-qualified" style={{ fontSize: 9 }}>Step 2 of 4</span>
                </div>
                <strong style={{ fontSize: 14, color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>
                  Client Site Inspection Follow-up Call
                </strong>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Call client to review architectural plans for sea-facing penthouses and confirm availability for Saturday site visit.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => alert(`Initiating priority call to ${selectedLead.phoneE164}...`)}
                    style={{
                      height: 32,
                      padding: '0 14px',
                      borderRadius: 6,
                      background: '#252422',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Icon name="phone" size={13} />
                    <span>Call Now</span>
                  </button>
                  <button
                    onClick={() => alert('Sequence step marked complete!')}
                    style={{
                      height: 32,
                      padding: '0 12px',
                      borderRadius: 6,
                      background: 'white',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Mark Complete
                  </button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                padding: '18px 20px',
                boxShadow: 'var(--shadow-card)',
              }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Client Interaction Timeline
                </h4>

                <form onSubmit={handleAddTimelineNote} style={{ marginBottom: 16 }}>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log client call notes, meeting feedback, or preference updates..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 12, marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      style={{ height: 28, padding: '0 12px', borderRadius: 6, background: 'var(--color-primary)', color: 'white', fontSize: 11, fontWeight: 700 }}
                    >
                      Post Note
                    </button>
                  </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {timelineNotes.map(n => (
                    <div key={n.id} style={{
                      padding: 10,
                      borderRadius: 8,
                      background: '#FAF9F6',
                      border: '1px solid #f0ede7',
                      fontSize: 11,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span className="status-pill status-contacted" style={{ fontSize: 9 }}>{n.type}</span>
                        <span style={{ color: 'var(--color-muted)' }}>{n.time} by {n.by}</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: Dynamics 365 Lead Score & Relationship Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Lead Score Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                padding: '20px',
                boxShadow: 'var(--shadow-card)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block', marginBottom: 12 }}>
                  PREDICTIVE LEAD SCORE
                </span>

                {/* Score Circular Gauge */}
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  border: '6px solid #279B78',
                  borderTopColor: '#EB5E28',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 12px',
                }}>
                  <div>
                    <strong style={{ fontSize: 26, color: 'var(--color-text-primary)', display: 'block', lineHeight: 1 }}>92</strong>
                    <span style={{ fontSize: 9, color: 'var(--color-muted)', fontWeight: 700 }}>GRADE A</span>
                  </div>
                </div>

                {/* Signal Highlights */}
                <div style={{ textAlign: 'left', fontSize: 11, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#279B78', fontWeight: 800 }}>▲</span>
                    <span>Purchase timeframe is Q4 2026</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#279B78', fontWeight: 800 }}>▲</span>
                    <span>Budget matches luxury penthouse inventory</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#279B78', fontWeight: 800 }}>▲</span>
                    <span>Direct phone response SLA &lt; 2 hours</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                padding: '18px 20px',
                boxShadow: 'var(--shadow-card)',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block', marginBottom: 12 }}>
                  ASSOCIATED OPPORTUNITY
                </span>
                <strong style={{ fontSize: 13, color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>
                  Skybridge Penthouse Acquisition
                </strong>
                <span style={{ fontSize: 11, color: 'var(--color-primary-hover)', fontWeight: 700, display: 'block', marginBottom: 10 }}>
                  Deal Value: {formatCurrency(85000000)}
                </span>
                <span className="status-pill status-qualified" style={{ fontSize: 9 }}>
                  Stage: Under Negotiation
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Standard Lead Queue & Table Listing ── */
        <>
          {/* Header */}
          <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
            <div>
              <span className="eyebrow">CUSTOMER RELATIONSHIP MANAGEMENT</span>
              <h1 className="dashboard-title">LEADS MANAGEMENT</h1>
              <p className="dashboard-subtitle">
                Centralized queue of verified client acquisitions, qualification stages, and broker assignments.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={onOpenAddLead}
                style={{
                  height: 38,
                  padding: '0 16px',
                  borderRadius: 8,
                  background: 'var(--color-primary)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon name="plus" size={16} />
                <span>Create Lead</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 16,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'white',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 300px' }}>
              <div className="lead-search" style={{ width: '100%', maxWidth: 360, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 10, top: 10, color: 'var(--color-muted)' }}>
                  <Icon name="search" size={15} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, locality, or email..."
                  style={{ width: '100%', height: 36, padding: '0 12px 0 32px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 12 }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: 36, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 12 }}
              >
                <option value="all">All Qualification Stages</option>
                <option value="NEW">New Inbound</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="SITE_VISIT">Site Visit Scheduled</option>
                <option value="NEGOTIATION">Under Negotiation</option>
                <option value="CONVERTED">Converted / Closed</option>
              </select>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
              Showing <strong>{filteredLeads.length}</strong> of {leads.length} leads
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="empty-panel">Loading verified leads queue...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="empty-panel">No leads found matching current criteria.</div>
          ) : (
            <div className="lead-table-wrap">
              <table className="lead-table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Stage Status</th>
                    <th>Direct Phone</th>
                    <th>Budget Range</th>
                    <th>Target Locality</th>
                    <th>Source</th>
                    <th>Assigned Broker</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td className="lead-name-cell">
                        <button
                          className="lead-name-button"
                          onClick={() => setSelectedLead(lead)}
                          title="Open Dynamics 365 Customer Workspace"
                        >
                          {lead.firstName} {lead.lastName}
                        </button>
                        <small>{lead.email || `Lead ID: ${lead.id}`}</small>
                      </td>
                      <td>
                        <span className={`status-pill ${
                          lead.status === 'NEW' ? 'status-lost' :
                          lead.status === 'QUALIFIED' ? 'status-qualified' :
                          lead.status === 'SITE_VISIT' ? 'status-site-visit' : 'status-converted'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td><span style={{ fontFamily: 'monospace' }}>{lead.phoneE164}</span></td>
                      <td>
                        <strong style={{ color: 'var(--color-primary-hover)' }}>
                          {lead.budgetMin ? `${formatCurrency(lead.budgetMin)} - ${formatCurrency(lead.budgetMax)}` : 'On Request'}
                        </strong>
                      </td>
                      <td>{lead.preferredLocality || 'Prime Mumbai'}</td>
                      <td>
                        <span className="status-pill status-contacted">{lead.source}</span>
                      </td>
                      <td>{lead.assignedAgent || 'Alexander Wright'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            style={{ padding: '4px 10px', borderRadius: 6, background: '#f7f5f0', fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)' }}
                          >
                            Workspace →
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: 11 }}
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
