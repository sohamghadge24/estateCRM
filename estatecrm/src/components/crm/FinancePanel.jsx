import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const FinancePanel = () => {
  const { formatCurrency } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sum, txns] = await Promise.all([
          api.getFinanceSummary(),
          api.getTransactions(),
        ]);
        setSummary(sum);
        setTransactions(Array.isArray(txns) ? txns : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">FISCAL OPERATIONS & COMMISSIONS</span>
          <h1 className="dashboard-title">AGENCY FINANCE & COMMISSIONS</h1>
          <p className="dashboard-subtitle">
            Deal settlements, collected brokerage, broker commission splits, and audit-ready ledger.
          </p>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">GROSS TRANSACTION VALUE</span>
            <div className="dashboard-stat-icon stat-icon-neutral">
              <Icon name="briefcase" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">{formatCurrency(summary?.grossTransactionVolume || 227000000)}</p>
          <p className="dashboard-stat-description">Total settled deal volume</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">COLLECTED BROKERAGE</span>
            <div className="dashboard-stat-icon stat-icon-success">
              <Icon name="dollarSign" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value" style={{ color: 'var(--color-success)' }}>
            {formatCurrency(summary?.collectedBrokerage || 4540000)}
          </p>
          <p className="dashboard-stat-description">Earned agency fee (2.0% avg)</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">AGENT PAYOUTS (40%)</span>
            <div className="dashboard-stat-icon stat-icon-info">
              <Icon name="users" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">
            {formatCurrency(summary?.agentCommissionsPayable || 1816000)}
          </p>
          <p className="dashboard-stat-description">Broker split allocations</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">NET AGENCY RETAINED</span>
            <div className="dashboard-stat-icon stat-icon-warning">
              <Icon name="trendingUp" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value" style={{ color: 'var(--color-primary-hover)' }}>
            {formatCurrency(summary?.agencyNetCommission || 2724000)}
          </p>
          <p className="dashboard-stat-description">Retained agency revenue</p>
        </div>
      </div>

      {/* ── Transaction Ledger ── */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          Recent Transaction Receipts & Tokens
        </h3>
        {loading ? (
          <div className="empty-panel">Loading transactions...</div>
        ) : (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Related Deal</th>
                  <th>Transaction Category</th>
                  <th>Amount</th>
                  <th>Lead Agent</th>
                  <th>Clearing Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td><strong style={{ fontFamily: 'monospace' }}>{t.id}</strong></td>
                    <td>{t.date}</td>
                    <td><strong>{t.dealTitle}</strong></td>
                    <td>
                      <span className="status-pill status-contacted">{t.type.replaceAll('_', ' ')}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary-hover)' }}>{formatCurrency(t.amount)}</strong>
                    </td>
                    <td>{t.agent}</td>
                    <td>
                      <span className="status-pill status-converted">✓ {t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

