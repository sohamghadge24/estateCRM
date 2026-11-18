import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

export const DocumentsPanel = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('PROPERTY_DOCS');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadName.trim()) return;
    await api.uploadDocument({
      name: uploadName,
      category: uploadCategory,
      size: `${(Math.random() * 3 + 0.8).toFixed(1)} MB`,
      uploadedBy: 'Alexander Wright',
    });
    setUploadName('');
    setShowUploadModal(false);
    fetchDocs();
  };

  const filtered = documents.filter(d => {
    if (activeCategory === 'ALL') return true;
    return d.category === activeCategory;
  });

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">ASSET VAULT & COMPLIANCE</span>
          <h1 className="dashboard-title">DOCUMENTS & MEDIA</h1>
          <p className="dashboard-subtitle">
            Secure private S3-compatible document repository, signed agreements, and KYC verification records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setShowUploadModal(true)}
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
            <Icon name="uploadCloud" size={16} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'ALL', label: 'All Files' },
          { id: 'PROPERTY_DOCS', label: 'Property Plans & Sanctions' },
          { id: 'AGREEMENTS', label: 'Sale & Lease Agreements' },
          { id: 'CUSTOMER_KYC', label: 'Client KYC & Passports' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 6,
              background: activeCategory === tab.id ? 'var(--color-text-primary)' : 'white',
              color: activeCategory === tab.id ? 'white' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Files Table ── */}
      {loading ? (
        <div className="empty-panel">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-panel">No documents stored in this category.</div>
      ) : (
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>File Size</th>
                <th>Uploaded By</th>
                <th>Storage Security</th>
                <th>Upload Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td className="lead-name-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f0ede7', display: 'grid', placeItems: 'center', color: 'var(--color-primary-hover)' }}>
                        <Icon name="fileText" size={16} />
                      </div>
                      <div>
                        <strong>{doc.name}</strong>
                        <small>Doc ID: {doc.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="status-pill status-contacted">
                      {doc.category.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{doc.size}</span>
                  </td>
                  <td>{doc.uploadedBy || 'Alexander Wright'}</td>
                  <td>
                    <span className="status-pill status-converted" style={{ fontSize: 9 }}>
                      AES-256 Encrypted
                    </span>
                  </td>
                  <td>{doc.createdAt}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => alert(`Simulated signed download link generated for ${doc.name}`)}
                      style={{ padding: '4px 10px', borderRadius: 6, background: '#f7f5f0', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="dialog-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <header>
              <div>
                <span className="eyebrow">ENCRYPTED ATTACHMENT</span>
                <h2>Upload Secure File</h2>
                <small style={{ color: 'var(--color-muted)' }}>Supported: PDF, DWG, PNG, MP4 (Max 50MB)</small>
              </div>
              <button className="icon-action" onClick={() => setShowUploadModal(false)}>
                <Icon name="x" size={16} />
              </button>
            </header>

            <form onSubmit={handleUploadSubmit} style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Document Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Bandra_Penthouse_FloorPlan_Signed.pdf"
                  style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Document Classification
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 13 }}
                >
                  <option value="PROPERTY_DOCS">Property Plans & Sanctions</option>
                  <option value="AGREEMENTS">Sale & Lease Agreements</option>
                  <option value="CUSTOMER_KYC">Customer KYC & ID</option>
                  <option value="RECEIPTS">Payment Receipts & Tax Invoices</option>
                </select>
              </div>

              <div style={{
                border: '2px dashed #E0DCD3',
                borderRadius: 8,
                padding: '24px 16px',
                textAlign: 'center',
                background: '#FAF9F6',
              }}>
                <Icon name="uploadCloud" size={28} style={{ color: 'var(--color-primary)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                  Click to select file from disk
                </p>
                <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>Files are scanned for malware before indexing</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{ height: 36, padding: '0 14px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 12, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ height: 36, padding: '0 16px', borderRadius: 7, background: 'var(--color-primary)', color: 'white', fontSize: 12, fontWeight: 700 }}
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

