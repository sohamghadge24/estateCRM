import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';
import { AddTaskModal } from './AddTaskModal';

export const TasksPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED' | 'URGENT'
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (id) => {
    await api.toggleTask(id);
    fetchTasks();
  };

  const filtered = tasks.filter(t => {
    if (filter === 'PENDING') return !t.completed;
    if (filter === 'COMPLETED') return t.completed;
    if (filter === 'URGENT') return t.priority === 'URGENT' || t.priority === 'HIGH';
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="crm-panel-container">
      {/* ── Page Header ── */}
      <div className="dashboard-header-block" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">WORKFORCE EXECUTION & FOLLOW-UPS</span>
          <h1 className="dashboard-title">TASKS & ACTIVITIES</h1>
          <p className="dashboard-subtitle">
            Agent task queues, client follow-up commitments, and operational milestones.
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
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* ── Stat Highlights ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">PENDING FOLLOW-UPS</span>
            <div className="dashboard-stat-icon stat-icon-neutral">
              <Icon name="checkSquare" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">{pendingCount}</p>
          <p className="dashboard-stat-description">Requires broker action</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">HIGH & URGENT PRIORITY</span>
            <div className="dashboard-stat-icon stat-icon-danger">
              <Icon name="alertCircle" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value" style={{ color: 'var(--color-danger)' }}>
            {tasks.filter(t => !t.completed && (t.priority === 'URGENT' || t.priority === 'HIGH')).length}
          </p>
          <p className="dashboard-stat-description">SLA sensitive follow-ups</p>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-top">
            <span className="dashboard-stat-label">COMPLETED MILESTONES</span>
            <div className="dashboard-stat-icon stat-icon-success">
              <Icon name="userCheck" size={18} />
            </div>
          </div>
          <p className="dashboard-stat-value">{completedCount}</p>
          <p className="dashboard-stat-description">Logged in agency record</p>
        </div>
      </div>

      {/* ── Filter Buttons ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'ALL', label: `All Tasks (${tasks.length})` },
          { id: 'PENDING', label: `Pending Action (${pendingCount})` },
          { id: 'URGENT', label: 'Urgent & High Priority' },
          { id: 'COMPLETED', label: `Completed (${completedCount})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 6,
              background: filter === tab.id ? 'var(--color-text-primary)' : 'white',
              color: filter === tab.id ? 'white' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tasks Table ── */}
      {loading ? (
        <div className="empty-panel">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-panel">No tasks found for this view.</div>
      ) : (
        <div className="lead-table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>Done</th>
                <th>Task Objective</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assigned Agent</th>
                <th>Linked Record</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ opacity: t.completed ? 0.6 : 1 }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggle(t.id)}
                      style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                    />
                  </td>
                  <td className="lead-name-cell">
                    <strong style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
                      {t.title}
                    </strong>
                    <small>Task ID: {t.id}</small>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      t.priority === 'URGENT' ? 'status-lost' :
                      t.priority === 'HIGH' ? 'status-qualified' : 'status-contacted'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {t.dueDate || 'Today'}
                    </span>
                  </td>
                  <td>{t.assignedTo || 'Alexander Wright'}</td>
                  <td>
                    <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                      {t.relatedTo || 'General Agency Task'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${t.completed ? 'status-converted' : 'status-site-visit'}`}>
                      {t.completed ? 'COMPLETED' : 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); fetchTasks(); }}
      />
    </div>
  );
};

