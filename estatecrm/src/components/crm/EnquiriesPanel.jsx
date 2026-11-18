import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

export const EnquiriesPanel = ({ onNavigate }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [converting, setConverting] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await api.getEnquiries();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleConvert = async (enq) => {
    setConverting(true);
    try {
      await api.convertEnquiryToLead(enq);
      alert(`Enquiry converted to a verified lead for ${enq.customerName}!`);
      fetchEnquiries();
      setSelectedEnquiry(null);
      if (onNavigate) onNavigate('leads');
    } catch (err) {
      alert(`Error converting enquiry: ${err.message}`);
    } finally {
      setConverting(false);
    }
  };

  const handleMarkResponded = async (id) => {
    await api.updateEnquiry(id, { status: 'RESPONDED' });
    fetchEnquiries();
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry(prev => ({ ...prev, status: 'RESPONDED' }));
    }
  };

  const filtered = enquiries.filter(e => {
    if (statusFilter === 'ALL') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">INBOUND CAPTURE & SLA</span>
          <h1 className="dashboard-title">ENQUIRY MANAGEMENT</h1>
          <p className="dashboard-subtitle">
            Centralized intake for portal enquiries, web forms, direct calls, and marketing campaigns.
          </p>
        </div>
      </div>

      {/* ── Filter Controls ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'ALL', label: 'All Enquiries' },
          { id: 'NEW', label: 'New / Unattended' },
          { id: 'RESPONDED', label: 'Responded' },
          { id: 'CONVERTED', label: 'Converted to Lead' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 6,
              background: statusFilter === tab.id ? 'var(--color-text-primary)' : 'white',
              color: statusFilter === tab.id ? 'white' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Enquiries Table ── */}
      {loading ? (
        <div className="empty-panel">Loading inbound enquiries...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-panel">No enquiries matching filter.</div>
      ) : (
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Customer / Prospect</th>
                <th>Interested Property</th>
                <th>Inquiry Source</th>
                <th>Status</th>
                <th>Message Snippet</th>
                <th>Received</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="lead-name-cell">
                    <button className="lead-name-button" onClick={() => setSelectedEnquiry(e)}>
                      {e.customerName}
                    </button>
                    <small>{e.phone || e.email}</small>
                  </td>
                  <td>
                    <strong>{e.propertyTitle || 'General Enquiry'}</strong>
                  </td>
                  <td>
                    <span className="status-pill status-contacted">{e.source.replaceAll('_', ' ')}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      e.status === 'NEW' ? 'status-lost' :
                      e.status === 'CONVERTED' ? 'status-converted' : 'status-qualified'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.message}
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {e.status !== 'CONVERTED' && (
                        <button
                          onClick={() => handleConvert(e)}
                          disabled={converting}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: 'var(--color-primary)',
                            color: 'white',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          Convert to Lead
                        </button>
                      )}
                      {e.status === 'NEW' && (
                        <button
                          onClick={() => handleMarkResponded(e.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: '#f7f5f0',
                            color: 'var(--color-text-secondary)',
                            fontSize: 11,
                          }}
                        >
                          Mark Responded
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedEnquiry(e)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: '#f7f5f0',
                          color: 'var(--color-text-secondary)',
                          fontSize: 11,
                        }}
                      >
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selectedEnquiry && (
        <div className="dialog-backdrop" onClick={() => setSelectedEnquiry(null)}>
          <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <header>
              <div>
                <span className="eyebrow">INBOUND ENQUIRY DETAILS</span>
                <h2>{selectedEnquiry.customerName}</h2>
                <span className="lead-id">Received via {selectedEnquiry.source} • {new Date(selectedEnquiry.createdAt).toLocaleString()}</span>
              </div>
              <button className="icon-action" onClick={() => setSelectedEnquiry(null)}>
                <Icon name="x" size={16} />
              </button>
            </header>

            <div className="detail-grid">
              <div>
                <span>Phone Contact</span>
                <strong style={{ fontFamily: 'monospace' }}>{selectedEnquiry.phone || '—'}</strong>
              </div>
              <div>
                <span>Email Address</span>
                <strong>{selectedEnquiry.email || '—'}</strong>
              </div>
              <div>
                <span>Interested Property</span>
                <strong>{selectedEnquiry.propertyTitle || 'General Catalog'}</strong>
              </div>
              <div>
                <span>Current Status</span>
                <span className="status-pill status-qualified" style={{ alignSelf: 'flex-start' }}>{selectedEnquiry.status}</span>
              </div>
            </div>

            <div className="detail-notes">
              <span>Customer Message:</span>
              <p style={{ background: '#F8F7F4', padding: 12, borderRadius: 8, fontStyle: 'italic' }}>
                "{selectedEnquiry.message}"
              </p>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {selectedEnquiry.status !== 'CONVERTED' && (
                <button
                  onClick={() => handleConvert(selectedEnquiry)}
                  style={{
                    height: 36,
                    padding: '0 16px',
                    borderRadius: 7,
                    background: 'var(--color-primary)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Convert to Verified CRM Lead
                </button>
              )}
              <button
                onClick={() => setSelectedEnquiry(null)}
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 7,
                  border: '1px solid var(--color-border)',
                  background: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

