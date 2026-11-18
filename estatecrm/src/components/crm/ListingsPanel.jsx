import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ListingsPanel = () => {
  const { formatCurrency } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'UNDER_REVIEW' | 'PAUSED'
  const [portalMode, setPortalMode] = useState(false); // Public portal simulation
  const [selectedListing, setSelectedListing] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings();
      setListings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleStatusChange = async (id, status) => {
    await api.updateListingStatus(id, status);
    fetchListings();
    if (selectedListing?.id === id) {
      setSelectedListing(prev => ({ ...prev, status }));
    }
  };

  const filtered = listings.filter((l) => {
    if (activeTab === 'ALL') return true;
    return l.status === activeTab;
  });

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">DISTRIBUTION & MARKETING</span>
          <h1 className="dashboard-title">LISTINGS & MARKETPLACE</h1>
          <p className="dashboard-subtitle">
            Multichannel property listing syndication, public portal synchronization, and approval lifecycle.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setPortalMode(p => !p)}
            style={{
              height: 38,
              padding: '0 16px',
              borderRadius: 8,
              background: portalMode ? 'var(--color-dark)' : 'white',
              color: portalMode ? 'white' : 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontWeight: 600,
              fontSize: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="globe" size={16} />
            <span>{portalMode ? 'Exit Portal Preview' : 'Public Portal View'}</span>
          </button>
        </div>
      </div>

      {/* ── Public Portal Simulated Experience ── */}
      {portalMode ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid var(--color-border)',
          padding: '32px 28px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 32px' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 99,
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Public Verified Portal View
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Curated Prime & Luxury Real Estate
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>
              Public-facing marketplace displaying only approved and active inventory with confidential broker protection.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {listings.filter(l => l.status === 'PUBLISHED').map(listing => (
              <div key={listing.id} style={{
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                background: '#FAF9F6',
              }}>
                <div style={{
                  height: 160,
                  background: 'linear-gradient(135deg, #252422 0%, #403D39 100%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 16,
                  color: 'white',
                }}>
                  <div>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--color-primary)', fontWeight: 700 }}>
                      FOR {listing.listingType}
                    </span>
                    <h4 style={{ fontSize: 16, fontWeight: 700, marginTop: 6, color: '#fff' }}>{listing.propertyTitle}</h4>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-hover)', marginBottom: 8 }}>
                    {formatCurrency(listing.price)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-muted)', marginBottom: 16 }}>
                    <span>{listing.viewsCount} Public Views</span>
                    <span>{listing.enquiriesCount} Inquiries</span>
                  </div>
                  <button
                    onClick={() => alert(`Inquiry modal opened for ${listing.propertyTitle}`)}
                    style={{
                      width: '100%',
                      height: 36,
                      borderRadius: 6,
                      background: 'var(--color-primary)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    Request Brochure & Visit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Agency Admin Marketplace View ── */
        <>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
            {[
              { id: 'ALL', label: 'All Listings' },
              { id: 'PUBLISHED', label: 'Published & Live' },
              { id: 'UNDER_REVIEW', label: 'Pending Manager Approval' },
              { id: 'PAUSED', label: 'Paused / Archived' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  height: 32,
                  padding: '0 14px',
                  borderRadius: 6,
                  background: activeTab === tab.id ? 'var(--color-text-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div className="empty-panel">Loading listings...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-panel">No listings in this state.</div>
          ) : (
            <div className="lead-table-wrap">
              <table className="lead-table">
                <thead>
                  <tr>
                    <th>Property / Title</th>
                    <th>Listing Type</th>
                    <th>Price</th>
                    <th>Approval Status</th>
                    <th>Traffic & Analytics</th>
                    <th>Published At</th>
                    <th style={{ textAlign: 'right' }}>Workflow Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td className="lead-name-cell">
                        <strong>{l.propertyTitle}</strong>
                        <small>Listing ID: {l.id}</small>
                      </td>
                      <td>
                        <span className="status-pill status-contacted">FOR {l.listingType}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary-hover)' }}>{formatCurrency(l.price)}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${
                          l.status === 'PUBLISHED' ? 'status-converted' :
                          l.status === 'UNDER_REVIEW' ? 'status-qualified' : 'status-lost'
                        }`}>
                          {l.status.replaceAll('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                          <strong>{l.viewsCount || 0}</strong> views • <strong>{l.enquiriesCount || 0}</strong> leads
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                          {l.publishedAt ? new Date(l.publishedAt).toLocaleDateString() : 'Not published'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {l.status === 'UNDER_REVIEW' && (
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              onClick={() => handleStatusChange(l.id, 'PUBLISHED')}
                              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 11, fontWeight: 700 }}
                            >
                              Approve & Publish
                            </button>
                            <button
                              onClick={() => handleStatusChange(l.id, 'PAUSED')}
                              style={{ padding: '4px 10px', borderRadius: 6, background: '#f5f3f4', color: 'var(--color-text-secondary)', fontSize: 11 }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {l.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleStatusChange(l.id, 'PAUSED')}
                            style={{ padding: '4px 10px', borderRadius: 6, background: '#f5f3f4', color: 'var(--color-text-secondary)', fontSize: 11 }}
                          >
                            Pause Listing
                          </button>
                        )}
                        {l.status === 'PAUSED' && (
                          <button
                            onClick={() => handleStatusChange(l.id, 'PUBLISHED')}
                            style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--color-primary)', color: 'white', fontSize: 11, fontWeight: 700 }}
                          >
                            Re-publish
                          </button>
                        )}
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

