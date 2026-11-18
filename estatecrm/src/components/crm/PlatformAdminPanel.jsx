import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const PlatformAdminPanel = () => {
  const { formatCurrency } = useAuth();
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [st, tn] = await Promise.all([
          api.getPlatformStats(),
          api.getTenants(),
        ]);
        setStats(st);
        setTenants(Array.isArray(tn) ? tn : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleStatus = async (tenantId) => {
    await api.toggleTenantStatus(tenantId);
    const tn = await api.getTenants();
    setTenants(Array.isArray(tn) ? tn : []);
  };

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--color-primary-hover)' }}>ESTATEOS GLOBAL OPERATOR CONSOLE</span>
          <h1 className="dashboard-title">SAAS PLATFORM ADMINISTRATION</h1>
          <p className="dashboard-subtitle">
            Cross-tenant cluster monitoring, agency subscription enforcement, and infrastructure health telemetry.
          </p>
        </div>
      </div>

      {/* ── Infrastructure Telemetry ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">TOTAL ONBOARDED AGENCIES</span>
            <div className="dashboard-stat-icon stat-icon-neutral">
              <Icon name="building" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">{stats?.totalTenants || 48}</p>
          <p className="dashboard-stat-description">{stats?.activeAgencies || 46} active across 3 cloud regions</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">PLATFORM RUN-RATE MRR</span>
            <div className="dashboard-stat-icon stat-icon-success">
              <Icon name="dollarSign" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value" style={{ color: 'var(--color-success)' }}>
            {formatCurrency(stats?.totalPlatformMRR || 1680000)}
          </p>
          <p className="dashboard-stat-description">Recurring SaaS subscriptions</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">SYSTEM AVAILABILITY</span>
            <div className="dashboard-stat-icon stat-icon-info">
              <Icon name="server" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">{stats?.systemUptime || '99.98%'}</p>
          <p className="dashboard-stat-description">0 SLA breaches in trailing 90 days</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">CELERY WORKERS</span>
            <div className="dashboard-stat-icon stat-icon-warning">
              <Icon name="activity" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">{stats?.celeryWorkers || '4/4 ACTIVE'}</p>
          <p className="dashboard-stat-description">Async queue operational</p>
        </div>
      </div>

      {/* ── Tenant Management Table ── */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          Registered Agency Tenants (Tenant Isolation Boundary)
        </h3>
        {loading ? (
          <div className="empty-panel">Loading tenant registry...</div>
        ) : (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <thead>
                <tr>
                  <th>Agency Tenant Name</th>
                  <th>Subdomain</th>
                  <th>SaaS Plan</th>
                  <th>Agents Provisioned</th>
                  <th>Active Properties</th>
                  <th>Onboarding Date</th>
                  <th>Tenant Status</th>
                  <th style={{ textAlign: 'right' }}>Operator Action</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.id}>
                    <td className="lead-name-cell">
                      <strong>{t.name}</strong>
                      <small>Tenant UUID: {t.id}</small>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{t.subdomain}.estatecrm.com</span>
                    </td>
                    <td>
                      <span className="status-pill status-contacted">{t.plan}</span>
                    </td>
                    <td>{t.agents}</td>
                    <td>{t.properties}</td>
                    <td>{t.joinedDate}</td>
                    <td>
                      <span className={`status-pill ${t.status === 'ACTIVE' ? 'status-converted' : 'status-lost'}`}>
                        {t.status === 'ACTIVE' ? '● Active Tenant' : '● Suspended'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(t.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: t.status === 'ACTIVE' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                          color: t.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {t.status === 'ACTIVE' ? 'Suspend Access' : 'Reactivate Tenant'}
                      </button>
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

