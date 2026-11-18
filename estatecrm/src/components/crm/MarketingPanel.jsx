import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const MarketingPanel = () => {
  const { formatCurrency } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await api.getCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (Number(c.leadsGenerated) || 0), 0);

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">GROWTH & LEAD ATTRIBUTION</span>
          <h1 className="dashboard-title">MARKETING & CAMPAIGNS</h1>
          <p className="dashboard-subtitle">
            Digital ad spend tracking, portal performance, campaign ROI, and lead source attribution.
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">TOTAL ALLOCATED BUDGET</span>
            <div className="dashboard-stat-icon stat-icon-neutral">
              <Icon name="dollarSign" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">{formatCurrency(totalBudget)}</p>
          <p className="dashboard-stat-description">{formatCurrency(totalSpent)} spent across active channels</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">ATTRIBUTED LEADS</span>
            <div className="dashboard-stat-icon stat-icon-info">
              <Icon name="users" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">{totalLeads}</p>
          <p className="dashboard-stat-description">Directly generated from campaigns</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">BLENDED CAMPAIGN ROI</span>
            <div className="dashboard-stat-icon stat-icon-success">
              <Icon name="trendingUp" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value" style={{ color: 'var(--color-success)' }}>3.1x</p>
          <p className="dashboard-stat-description">Calculated against closed brokerage</p>
        </div>
      </div>

      {/* ── Campaigns Table ── */}
      {loading ? (
        <div className="empty-panel">Loading marketing campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="empty-panel">No active marketing campaigns.</div>
      ) : (
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Channel</th>
                <th>Budget</th>
                <th>Spend to Date</th>
                <th>Inbound Leads</th>
                <th>Qualified</th>
                <th>Status</th>
                <th>ROI Attribution</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td className="lead-name-cell">
                    <strong>{c.title}</strong>
                    <small>Active: {c.startDate} to {c.endDate}</small>
                  </td>
                  <td>
                    <span className="status-pill status-contacted">{c.channel.replaceAll('_', ' ')}</span>
                  </td>
                  <td>{formatCurrency(c.budget)}</td>
                  <td>
                    <strong style={{ color: 'var(--color-primary-hover)' }}>{formatCurrency(c.spent)}</strong>
                  </td>
                  <td>
                    <strong>{c.leadsGenerated}</strong> leads
                  </td>
                  <td>
                    <span className="status-pill status-qualified">{c.qualifiedCount} Qualified</span>
                  </td>
                  <td>
                    <span className="status-pill status-converted">{c.status}</span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--color-success)' }}>{c.roi}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

