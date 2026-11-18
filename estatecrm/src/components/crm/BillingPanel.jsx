import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const BillingPanel = () => {
  const { formatCurrency } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getSubscription();
        setSub(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !sub) {
    return <div className="empty-panel">Loading subscription status...</div>;
  }

  const { quotas } = sub;

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">SAAS SUBSCRIPTION & ENTITLEMENTS</span>
          <h1 className="dashboard-title">BILLING & SUBSCRIPTIONS</h1>
          <p className="dashboard-subtitle">
            Manage your agency's EstateCRM plan, user seat quotas, cloud storage limits, and tax invoices.
          </p>
        </div>
      </div>

      {/* ── Active Plan Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #252422 0%, #161A1D 100%)',
        borderRadius: 14,
        padding: '28px 32px',
        color: '#FFFFFF',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: 'var(--color-primary)',
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
            }}>
              {sub.tier} PLAN
            </span>
            <span style={{ fontSize: 12, color: '#B3D89C', fontWeight: 600 }}>● Active Subscription</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>
            {sub.planName}
          </h2>
          <p style={{ color: '#CCC5B9', fontSize: 13, margin: 0 }}>
            Includes Multi-branch hierarchy, custom RERA compliance exports, and priority API rate limits.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-primary-hover)' }}>
            {formatCurrency(sub.monthlyPrice)} <span style={{ fontSize: 13, color: '#A4A099', fontWeight: 500 }}>/ month</span>
          </div>
          <span style={{ fontSize: 11, color: '#A4A099', display: 'block', marginTop: 4 }}>
            Next billing renewal: {sub.nextBillingDate}
          </span>
          <button
            onClick={() => alert('Plan modification requested. Contact your account manager.')}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              borderRadius: 7,
              background: 'white',
              color: 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            Upgrade / Modify Plan
          </button>
        </div>
      </div>

      {/* ── Quota Usage Meters ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 14 }}>
          Tenant Quota Consumption
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
          {[
            { label: 'Active User Seats', used: quotas.users.used, max: quotas.users.max, unit: 'seats' },
            { label: 'Properties Catalogued', used: quotas.properties.used, max: quotas.properties.max, unit: 'units' },
            { label: 'Published Listings', used: quotas.activeListings.used, max: quotas.activeListings.max, unit: 'listings' },
            { label: 'Cloud Vault Storage', used: quotas.storageGb.used, max: quotas.storageGb.max, unit: 'GB' },
          ].map((q, idx) => {
            const pct = Math.min(100, Math.round((q.used / q.max) * 100));
            return (
              <div key={idx} style={{
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '16px',
                boxShadow: 'var(--shadow-card)',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block', marginBottom: 8 }}>
                  {q.label}
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <strong style={{ fontSize: 20, color: 'var(--color-text-primary)' }}>{q.used}</strong>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>of {q.max} {q.unit}</span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 99, background: '#f0ede7', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: pct > 85 ? 'var(--color-danger)' : 'var(--color-primary)',
                    borderRadius: 99,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Invoice History ── */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          Billing Receipts & Invoices
        </h3>
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Invoice Reference</th>
                <th>Billing Date</th>
                <th>Amount Billed</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th style={{ textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {sub.invoices.map(inv => (
                <tr key={inv.id}>
                  <td><strong style={{ fontFamily: 'monospace' }}>{inv.id}</strong></td>
                  <td>{inv.date}</td>
                  <td><strong>{formatCurrency(inv.amount)}</strong></td>
                  <td>
                    <span className="status-pill status-converted">✓ {inv.status}</span>
                  </td>
                  <td>Corporate Credit Card (•••• 9012)</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => alert(`Downloading PDF invoice: ${inv.id}`)}
                      style={{ padding: '4px 10px', borderRadius: 6, background: '#f7f5f0', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

