import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AddDealModal } from './AddDealModal';

const STAGES = [
  { id: 'OPPORTUNITY', label: 'Opportunity', color: '#ABC4FF' },
  { id: 'OFFER_SUBMITTED', label: 'Offer Submitted', color: '#CCDBFD' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: '#EB5E28' },
  { id: 'BOOKING', label: 'Booking / Token', color: '#B3D89C' },
  { id: 'AGREEMENT', label: 'Agreement Draft', color: '#279B78' },
  { id: 'CLOSED_WON', label: 'Closed Won', color: '#247044' },
  { id: 'CLOSED_LOST', label: 'Closed Lost', color: '#BA181B' },
];

export const DealsPanel = () => {
  const { formatCurrency } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' | 'TABLE'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const data = await api.getDeals();
      setDeals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleStageChange = async (id, stage) => {
    await api.updateDealStage(id, stage);
    fetchDeals();
    if (selectedDeal?.id === id) {
      setSelectedDeal(prev => ({ ...prev, stage }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this deal record?')) {
      await api.deleteDeal(id);
      fetchDeals();
      if (selectedDeal?.id === id) setSelectedDeal(null);
    }
  };

  const activePipelineValue = deals
    .filter(d => d.stage !== 'CLOSED_LOST' && d.stage !== 'CLOSED_WON')
    .reduce((sum, d) => sum + (Number(d.dealValue) || 0), 0);

  const closedWonValue = deals
    .filter(d => d.stage === 'CLOSED_WON')
    .reduce((sum, d) => sum + (Number(d.dealValue) || 0), 0);

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">TRANSACTION REVENUE & PIPELINE</span>
          <h1 className="dashboard-title">DEALS & TRANSACTIONS</h1>
          <p className="dashboard-subtitle">
            Commercial real estate opportunities, offer management, tokens, and settlement milestones.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 2, background: '#f0ede7', borderRadius: 7 }}>
            <button
              onClick={() => setViewMode('KANBAN')}
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                background: viewMode === 'KANBAN' ? 'white' : 'transparent',
                color: viewMode === 'KANBAN' ? 'var(--color-text-primary)' : 'var(--color-muted)',
                fontWeight: 600,
                fontSize: 11,
              }}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              style={{
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                background: viewMode === 'TABLE' ? 'white' : 'transparent',
                color: viewMode === 'TABLE' ? 'var(--color-text-primary)' : 'var(--color-muted)',
                fontWeight: 600,
                fontSize: 11,
              }}
            >
              Table View
            </button>
          </div>
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
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* ── High-Level Deal Metrics Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">ACTIVE PIPELINE VALUE</span>
            <div className="dashboard-stat-icon stat-icon-neutral">
              <Icon name="briefcase" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value" style={{ color: 'var(--color-primary-hover)' }}>
            {formatCurrency(activePipelineValue)}
          </p>
          <p className="dashboard-stat-description">Across {deals.filter(d => d.stage !== 'CLOSED_LOST' && d.stage !== 'CLOSED_WON').length} in-progress negotiations</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">CLOSED TRANSACTIONS</span>
            <div className="dashboard-stat-icon stat-icon-success">
              <Icon name="trendingUp" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">
            {formatCurrency(closedWonValue)}
          </p>
          <p className="dashboard-stat-description">Recognized transactional volume</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">ESTIMATED COMMISSIONS</span>
            <div className="dashboard-stat-icon stat-icon-info">
              <Icon name="dollarSign" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">
            {formatCurrency((activePipelineValue + closedWonValue) * 0.02)}
          </p>
          <p className="dashboard-stat-description">Standard 2.0% agency brokerage allocation</p>
        </div>
      </div>

      {/* ── Kanban View ── */}
      {viewMode === 'KANBAN' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
          alignItems: 'start',
          overflowX: 'auto',
          paddingBottom: 20,
        }}>
          {STAGES.filter(s => s.id !== 'CLOSED_LOST').map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.dealValue) || 0), 0);
            return (
              <div key={stage.id} style={{
                background: '#FAF9F6',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '12px 10px',
                minWidth: 260,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>
                      {stage.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: '#f0ede7', color: 'var(--color-muted)' }}>
                    {stageDeals.length}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 12 }}>
                  {formatCurrency(stageTotal)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stageDeals.length === 0 ? (
                    <div style={{ padding: '24px 10px', textAlign: 'center', fontSize: 11, color: '#A4A099', border: '1px dashed #E0DCD3', borderRadius: 8 }}>
                      No deals in this stage
                    </div>
                  ) : (
                    stageDeals.map(deal => (
                      <div
                        key={deal.id}
                        onClick={() => setSelectedDeal(deal)}
                        style={{
                          background: 'white',
                          border: '1px solid var(--color-border)',
                          borderRadius: 8,
                          padding: 12,
                          boxShadow: 'var(--shadow-card)',
                          cursor: 'pointer',
                          transition: 'transform 120ms ease, box-shadow 120ms ease',
                        }}
                      >
                        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                          {deal.title}
                        </h4>
                        <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '0 0 8px 0' }}>
                          Client: <strong>{deal.clientName}</strong>
                        </p>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary-hover)', marginBottom: 8 }}>
                          {formatCurrency(deal.dealValue)}
                        </div>

                        {/* Stage quick advancement */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f4f1eb' }}>
                          <span style={{ fontSize: 10, color: 'var(--color-muted)' }}>{deal.assignedAgent}</span>
                          <select
                            value={deal.stage}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStageChange(deal.id, e.target.value)}
                            style={{
                              height: 24,
                              fontSize: 10,
                              fontWeight: 600,
                              borderRadius: 4,
                              border: '1px solid var(--color-border)',
                              background: '#F8F7F4',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Deal Title</th>
                <th>Client / Buyer</th>
                <th>Property</th>
                <th>Deal Value</th>
                <th>Pipeline Stage</th>
                <th>Booking Deposit</th>
                <th>Brokerage (2%)</th>
                <th>Assigned Agent</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(d => (
                <tr key={d.id}>
                  <td className="lead-name-cell">
                    <button className="lead-name-button" onClick={() => setSelectedDeal(d)}>
                      {d.title}
                    </button>
                    <small>ID: {d.id}</small>
                  </td>
                  <td><strong>{d.clientName}</strong></td>
                  <td>{d.propertyTitle || '—'}</td>
                  <td>
                    <strong style={{ color: 'var(--color-primary-hover)' }}>{formatCurrency(d.dealValue)}</strong>
                  </td>
                  <td>
                    <select
                      value={d.stage}
                      onChange={(e) => handleStageChange(d.id, e.target.value)}
                      style={{
                        height: 28,
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: '1px solid var(--color-border)',
                        background: 'white',
                      }}
                    >
                      {STAGES.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>{d.bookingAmount ? formatCurrency(d.bookingAmount) : '—'}</td>
                  <td>{formatCurrency((d.dealValue || 0) * (d.commissionRate || 2) / 100)}</td>
                  <td>{d.assignedAgent}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => setSelectedDeal(d)}
                        style={{ padding: '4px 8px', borderRadius: 6, background: '#f7f5f0', fontSize: 11 }}
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
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

      {/* ── Deal Detail Drawer ── */}
      {selectedDeal && (
        <div className="dialog-backdrop" onClick={() => setSelectedDeal(null)}>
          <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <header>
              <div>
                <span className="eyebrow">TRANSACTION DOSSIER</span>
                <h2>{selectedDeal.title}</h2>
                <span className="lead-id">Deal Value: {formatCurrency(selectedDeal.dealValue)} • Closing Target: {selectedDeal.expectedCloseDate || 'Q4 2026'}</span>
              </div>
              <button className="icon-action" onClick={() => setSelectedDeal(null)}>
                <Icon name="x" size={16} />
              </button>
            </header>

            <div className="detail-grid">
              <div>
                <span>Purchaser / Client</span>
                <strong>{selectedDeal.clientName}</strong>
              </div>
              <div>
                <span>Property Asset</span>
                <strong>{selectedDeal.propertyTitle || '—'}</strong>
              </div>
              <div>
                <span>Pipeline Stage</span>
                <strong style={{ color: 'var(--color-primary)' }}>{selectedDeal.stage.replaceAll('_', ' ')}</strong>
              </div>
              <div>
                <span>Assigned Agent</span>
                <strong>{selectedDeal.assignedAgent}</strong>
              </div>
              <div>
                <span>Booking / Token Advance</span>
                <strong>{selectedDeal.bookingAmount ? formatCurrency(selectedDeal.bookingAmount) : 'Pending token receipt'}</strong>
              </div>
              <div>
                <span>Calculated Brokerage Fee</span>
                <strong style={{ color: 'var(--color-success)' }}>
                  {formatCurrency((selectedDeal.dealValue || 0) * (selectedDeal.commissionRate || 2) / 100)} ({selectedDeal.commissionRate || 2}%)
                </strong>
              </div>
            </div>

            {selectedDeal.notes && (
              <div className="detail-notes">
                <span>Negotiation Notes:</span>
                <p>{selectedDeal.notes}</p>
              </div>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleStageChange(selectedDeal.id, 'CLOSED_WON')}
                  style={{ height: 34, padding: '0 14px', borderRadius: 7, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontWeight: 700, fontSize: 11 }}
                >
                  Mark Closed Won ✓
                </button>
                <button
                  onClick={() => handleStageChange(selectedDeal.id, 'CLOSED_LOST')}
                  style={{ height: 34, padding: '0 14px', borderRadius: 7, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontWeight: 700, fontSize: 11 }}
                >
                  Mark Lost ✗
                </button>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                style={{ height: 34, padding: '0 16px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 12, fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddDealModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); fetchDeals(); }}
      />
    </div>
  );
};

