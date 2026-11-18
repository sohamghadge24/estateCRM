import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

export const AuditPanel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["EventID,Actor,Action,Entity,EntityType,IPAddress,Timestamp"].join(",") + "\n" +
      logs.map(l => `"${l.id}","${l.actor}","${l.action}","${l.entity}","${l.entityType}","${l.ipAddress}","${l.timestamp}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EstateCRM_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = logs.filter(l => {
    const matchesSearch =
      (l.actor || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.entity || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || l.entityType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">GOVERNANCE & COMPLIANCE</span>
          <h1 className="dashboard-title">AUDIT LOGS & EVENT STREAM</h1>
          <p className="dashboard-subtitle">
            Tamper-evident record of all user authentications, record modifications, and privileged operations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleExport}
            style={{
              height: 38,
              padding: '0 16px',
              borderRadius: 8,
              background: 'white',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
              fontSize: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="download" size={16} />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
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
              placeholder="Search by actor, action, or entity..."
              style={{ width: '100%', height: 36, padding: '0 12px 0 32px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 12 }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ height: 36, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 12 }}
          >
            <option value="ALL">All Event Domains</option>
            <option value="AUTH">Authentication Events</option>
            <option value="PROPERTY">Property Operations</option>
            <option value="LEAD">Lead Mutations</option>
            <option value="DEAL">Deals & Settlements</option>
            <option value="COMM">Communications</option>
            <option value="ORGANIZATION">Organization & RBAC</option>
          </select>
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
          Showing <strong>{filtered.length}</strong> logged events
        </div>
      </div>

      {/* ── Audit Logs Table ── */}
      {loading ? (
        <div className="empty-panel">Loading audit stream...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-panel">No audit entries matching filter criteria.</div>
      ) : (
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Actor / User</th>
                <th>Action Performed</th>
                <th>Affected Entity</th>
                <th>Domain Category</th>
                <th>IP Context</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      {new Date(l.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td><strong>{l.actor}</strong></td>
                  <td>
                    <span className="status-pill status-contacted">{l.action}</span>
                  </td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong>{l.entity}</strong>
                  </td>
                  <td>
                    <span className="status-pill status-qualified">{l.entityType}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-muted)' }}>
                      {l.ipAddress}
                    </span>
                  </td>
                  <td>
                    <span className="status-pill status-converted">✓ {l.status}</span>
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

