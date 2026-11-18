import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { AddContactModal } from './AddContactModal';

export const ContactsPanel = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await api.getContacts();
      setContacts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact record?')) {
      await api.deleteContact(id);
      fetchContacts();
      if (selectedContact?.id === id) setSelectedContact(null);
    }
  };

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      (c.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.locality || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">RELATIONSHIP MANAGEMENT</span>
          <h1 className="dashboard-title">CONTACTS & CLIENTS</h1>
          <p className="dashboard-subtitle">
            Centralized registry of verified buyers, property owners, institutional investors, and tenants.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setShowAddModal(true)}
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
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, or locality..."
              style={{ width: '100%', height: 36, padding: '0 12px 0 32px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 12 }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ height: 36, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 12, color: 'var(--color-text-secondary)' }}
          >
            <option value="ALL">All Categories</option>
            <option value="BUYER">Buyers</option>
            <option value="SELLER">Sellers / Owners</option>
            <option value="LANDLORD">Landlords</option>
            <option value="TENANT">Tenants</option>
            <option value="INVESTOR">Investors</option>
          </select>
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
          Showing <strong>{filtered.length}</strong> of {contacts.length} records
        </div>
      </div>

      {/* ── Table Listing ── */}
      {loading ? (
        <div className="empty-panel">Loading verified contacts...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-panel" style={{ padding: '48px 24px' }}>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-info-bg)', color: 'var(--color-info)', display: 'grid', placeItems: 'center' }}>
              <Icon name="contact" size={24} />
            </div>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            No contacts match current filters
          </h3>
          <p style={{ color: 'var(--color-muted)', fontSize: 12, maxWidth: 360, margin: '0 auto 16px' }}>
            Register high-net-worth buyers, property sellers, and corporate landlords to track preferences.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ minHeight: 34, padding: '0 14px', borderRadius: 7, background: 'var(--color-primary)', color: 'white', fontSize: 12, fontWeight: 700 }}
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Category</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Budget / Value</th>
                <th>Locality</th>
                <th>Assigned Agent</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="lead-name-cell">
                    <button className="lead-name-button" onClick={() => setSelectedContact(c)}>
                      {c.fullName}
                    </button>
                    <small>ID: {c.id}</small>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      c.type === 'BUYER' ? 'status-qualified' :
                      c.type === 'SELLER' ? 'status-converted' :
                      c.type === 'INVESTOR' ? 'status-site-visit' : 'status-contacted'
                    }`}>
                      {c.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.phone || '—'}</span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{c.email || '—'}</span>
                  </td>
                  <td>
                    <strong>{c.budget || '—'}</strong>
                  </td>
                  <td>{c.locality || '—'}</td>
                  <td>
                    <span style={{ color: 'var(--color-text-primary)', fontSize: 12 }}>{c.assignedAgent || 'Alexander Wright'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => setSelectedContact(c)}
                        title="View Full Profile"
                        style={{ padding: '4px 8px', borderRadius: 6, background: '#f7f5f0', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Delete"
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

      {/* ── Detail Drawer ── */}
      {selectedContact && (
        <div className="dialog-backdrop" onClick={() => setSelectedContact(null)}>
          <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <header>
              <div>
                <span className="eyebrow">VERIFIED CLIENT RECORD</span>
                <h2>{selectedContact.fullName}</h2>
                <span className="lead-id">ID: {selectedContact.id} • Registered {new Date(selectedContact.createdAt).toLocaleDateString()}</span>
              </div>
              <button className="icon-action" onClick={() => setSelectedContact(null)}>
                <Icon name="x" size={16} />
              </button>
            </header>

            <div className="detail-grid">
              <div>
                <span>Category</span>
                <span className="status-pill status-qualified" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                  {selectedContact.type}
                </span>
              </div>
              <div>
                <span>Assigned Agent</span>
                <strong>{selectedContact.assignedAgent || 'Alexander Wright'}</strong>
              </div>
              <div>
                <span>Direct Phone</span>
                <strong style={{ fontFamily: 'monospace' }}>{selectedContact.phone || '—'}</strong>
              </div>
              <div>
                <span>Email Address</span>
                <strong>{selectedContact.email || '—'}</strong>
              </div>
              <div>
                <span>Investment / Budget</span>
                <strong>{selectedContact.budget || 'Unspecified'}</strong>
              </div>
              <div>
                <span>Target Locality</span>
                <strong>{selectedContact.locality || 'Any Prime Locality'}</strong>
              </div>
            </div>

            {selectedContact.notes && (
              <div className="detail-notes">
                <span>Client Notes & Mandate:</span>
                <p>{selectedContact.notes}</p>
              </div>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setSelectedContact(null)}
                style={{ height: 34, padding: '0 16px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 12, fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); fetchContacts(); }}
      />
    </div>
  );
};

