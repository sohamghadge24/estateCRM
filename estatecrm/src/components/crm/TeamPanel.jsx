import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const TeamPanel = () => {
  const { activeTenant } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('MEMBERS'); // 'MEMBERS' | 'ROLES' | 'BRANCHES'
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('SALES_AGENT');
  const [inviteBranch, setInviteBranch] = useState('Mumbai Flagship (Bandra)');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await api.getMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    await api.inviteMember({
      fullName: inviteName || inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      branch: inviteBranch,
      team: 'Prime Residential Luxury',
      phone: '+91 98200 ' + Math.floor(10000 + Math.random() * 90000),
    });
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
    fetchMembers();
  };

  const rolesMatrix = [
    { role: 'Agency Admin', leads: 'Full CRUD', properties: 'Full CRUD', deals: 'All Deals & Payouts', team: 'Manage All', settings: 'Full Config' },
    { role: 'Branch Manager', leads: 'Branch Scope', properties: 'Branch Scope', deals: 'Branch Scope', team: 'View & Assign', settings: 'Branch Only' },
    { role: 'Sales Agent', leads: 'Own + Shared', properties: 'View & Create', deals: 'Own Deals', team: 'View Directory', settings: 'Profile Only' },
    { role: 'Property Manager', leads: 'Enquiry Scope', properties: 'Full Inventory', deals: 'Read Only', team: 'Read Only', settings: 'None' },
    { role: 'Accountant', leads: 'Read Only', properties: 'Read Only', deals: 'Settlement & Audit', team: 'Read Only', settings: 'Finance Only' },
  ];

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">ENTERPRISE STRUCTURE & RBAC</span>
          <h1 className="dashboard-title">ORGANIZATION & TEAM MANAGEMENT</h1>
          <p className="dashboard-subtitle">
            Manage multi-branch hierarchy, employee rosters, agent roles, and granular data access scopes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setShowInviteModal(true)}
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
            <Icon name="userCheck" size={16} />
            <span>Invite Employee</span>
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'MEMBERS', label: `Team Members (${members.length})` },
          { id: 'ROLES', label: 'Roles & Permission Matrix' },
          { id: 'BRANCHES', label: 'Agency Branches & Desks' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 6,
              background: activeTab === tab.id ? 'var(--color-text-primary)' : 'white',
              color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Members Table ── */}
      {activeTab === 'MEMBERS' && (
        loading ? (
          <div className="empty-panel">Loading team directory...</div>
        ) : (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Assigned Role</th>
                  <th>Branch Location</th>
                  <th>Assigned Desk</th>
                  <th>Direct Phone</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td className="lead-name-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: '#f0ede7',
                          color: 'var(--color-primary)',
                          fontWeight: 700,
                          fontSize: 12,
                          display: 'grid',
                          placeItems: 'center'
                        }}>
                          {m.fullName.charAt(0)}
                        </div>
                        <div>
                          <strong>{m.fullName}</strong>
                          <small>{m.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${
                        m.role === 'AGENCY_ADMIN' ? 'status-lost' :
                        m.role === 'BRANCH_MANAGER' ? 'status-qualified' : 'status-contacted'
                      }`}>
                        {m.role.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td>{m.branch}</td>
                    <td>{m.team}</td>
                    <td><span style={{ fontFamily: 'monospace' }}>{m.phone}</span></td>
                    <td>
                      <span className="status-pill status-converted">✓ Active</span>
                    </td>
                    <td>{m.joinedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Tab 2: Permission Matrix ── */}
      {activeTab === 'ROLES' && (
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Security Role</th>
                <th>CRM Leads Scope</th>
                <th>Property Inventory</th>
                <th>Deals & Settlements</th>
                <th>Team Roster</th>
                <th>Agency Configuration</th>
              </tr>
            </thead>
            <tbody>
              {rolesMatrix.map((rm, idx) => (
                <tr key={idx}>
                  <td><strong>{rm.role}</strong></td>
                  <td><span className="status-pill status-qualified">{rm.leads}</span></td>
                  <td><span className="status-pill status-contacted">{rm.properties}</span></td>
                  <td><span className="status-pill status-converted">{rm.deals}</span></td>
                  <td>{rm.team}</td>
                  <td>{rm.settings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 3: Branches ── */}
      {activeTab === 'BRANCHES' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { name: 'Mumbai Flagship (Bandra)', address: 'Level 4, Horizon Towers, Hill Road, Bandra West', manager: 'Alexander Wright', activeAgents: 5 },
            { name: 'BKC Financial Center', address: 'Suite 1802, Prestige Tower, G Block BKC', manager: 'Marcus Sterling', activeAgents: 3 },
          ].map((b, idx) => (
            <div key={idx} style={{
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              padding: 20,
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{b.name}</h3>
                <span className="status-pill status-converted">Active Branch</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 12 }}>{b.address}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderTop: '1px solid #f0ede7', paddingTop: 10 }}>
                <span>Branch Lead: <strong>{b.manager}</strong></span>
                <span>Active Brokers: <strong>{b.activeAgents}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="dialog-backdrop" onClick={() => setShowInviteModal(false)}>
          <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <header>
              <div>
                <span className="eyebrow">EMPLOYEE ACCESS PROVISIONING</span>
                <h2>Invite Agency Member</h2>
                <small style={{ color: 'var(--color-muted)' }}>Send an encrypted onboarding invitation link via email.</small>
              </div>
              <button className="icon-action" onClick={() => setShowInviteModal(false)}>
                <Icon name="x" size={16} />
              </button>
            </header>

            <form onSubmit={handleInviteSubmit} style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="vikram@agency.com"
                  style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Role Assignment
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 13 }}
                  >
                    <option value="SALES_AGENT">Sales Agent / Broker</option>
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="PROPERTY_MANAGER">Property Manager</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="AGENCY_ADMIN">Agency Admin</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    Assigned Branch
                  </label>
                  <select
                    value={inviteBranch}
                    onChange={(e) => setInviteBranch(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 13 }}
                  >
                    <option value="Mumbai Flagship (Bandra)">Mumbai Flagship (Bandra)</option>
                    <option value="BKC Financial Center">BKC Financial Center</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  style={{ height: 36, padding: '0 14px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 12, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ height: 36, padding: '0 16px', borderRadius: 7, background: 'var(--color-primary)', color: 'white', fontSize: 12, fontWeight: 700 }}
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

