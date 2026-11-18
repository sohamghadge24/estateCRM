import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

export const AddAppointmentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'SITE_VISIT',
    clientName: '',
    propertyTitle: '',
    assignedAgent: 'Alexander Wright',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    location: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.clientName) {
      setError('Title and client name are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createAppointment(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to schedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <header>
          <div>
            <span className="eyebrow">ACTIVITY & WORKFORCE SCHEDULING</span>
            <h2>Schedule Appointment / Site Visit</h2>
            <small style={{ color: 'var(--color-muted)' }}>
              Coordinate private property viewings, legal consultations, and client meetings.
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
              Appointment Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Penthouse Site Viewing with Mr. Ambani"
              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Activity Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 13 }}
              >
                <option value="SITE_VISIT">Property Site Visit</option>
                <option value="CLIENT_MEETING">Client Meeting</option>
                <option value="OFFICE_MEETING">Office Meeting</option>
                <option value="FOLLOW_UP">Follow-up Call / Video</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Client / Prospect Name *
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Devendra Ambani"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Related Property
              </label>
              <input
                type="text"
                value={formData.propertyTitle}
                onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                placeholder="e.g. The Skybridge Penthouse"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Assigned Agent
              </label>
              <input
                type="text"
                value={formData.assignedAgent}
                onChange={(e) => setFormData({ ...formData, assignedAgent: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              Meeting Location / Address
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Hill Road, Bandra West (At Property Site)"
              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
            />
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
              {submitting ? 'Scheduling...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

