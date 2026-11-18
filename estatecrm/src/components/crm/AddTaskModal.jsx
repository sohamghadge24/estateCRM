import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

export const AddTaskModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: 'Alexander Wright',
    relatedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Task title is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createTask(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <header>
          <div>
            <span className="eyebrow">WORKFORCE & OPERATIONS</span>
            <h2>Create Operational Task</h2>
            <small style={{ color: 'var(--color-muted)' }}>
              Assign follow-ups, document verifications, and client calls to team members.
            </small>
          </div>
          <button className="icon-action" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </header>

        {error && (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Follow up with buyer regarding bank loan sanction"
              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Assigned Team Member
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 13 }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent / SLA Critical</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Associated Lead / Property / Deal
              </label>
              <input
                type="text"
                value={formData.relatedTo}
                onChange={(e) => setFormData({ ...formData, relatedTo: e.target.value })}
                placeholder="e.g. Devendra Ambani"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ height: 36, padding: '0 14px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontWeight: 600, fontSize: 12 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ height: 36, padding: '0 16px', borderRadius: 7, background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: 12 }}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

