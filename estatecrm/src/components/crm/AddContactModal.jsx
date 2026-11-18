import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

export const AddContactModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    alternatePhone: '',
    type: 'BUYER',
    preferredProperty: '',
    budget: '',
    locality: '',
    preferredChannel: 'WHATSAPP',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createContact(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create contact');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <header>
          <div>
            <span className="eyebrow">CLIENT RELATIONSHIP MANAGEMENT</span>
            <h2>Create New Contact</h2>
            <small style={{ color: 'var(--color-muted)', display: 'block', marginTop: 4 }}>
              Register a buyer, seller, landlord, or tenant in your agency database.
            </small>
          </div>
          <button className="icon-action" onClick={onClose} aria-label="Close dialog">
            <Icon name="x" size={16} />
          </button>
        </header>

        {error && (
          <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Ratan Tata"
              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98200 12345"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@domain.com"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Contact Category
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13, background: 'white' }}
              >
                <option value="BUYER">Buyer</option>
                <option value="SELLER">Seller / Owner</option>
                <option value="LANDLORD">Landlord</option>
                <option value="TENANT">Tenant</option>
                <option value="INVESTOR">Investor / Institutional</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Budget / Range
              </label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g. ₹ 5 - 8 Cr"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Preferred Locality
              </label>
              <input
                type="text"
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                placeholder="e.g. Worli Sea Face"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Preferred Channel
              </label>
              <select
                value={formData.preferredChannel}
                onChange={(e) => setFormData({ ...formData, preferredChannel: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13, background: 'white' }}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PHONE">Direct Call</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              Internal Notes / Preferences
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Key specifications, family requirements, timeline..."
              style={{ width: '100%', padding: '8px 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ minHeight: 36, padding: '0 14px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontWeight: 600, fontSize: 12 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ minHeight: 36, padding: '0 16px', borderRadius: 7, background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: 12 }}
            >
              {submitting ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

