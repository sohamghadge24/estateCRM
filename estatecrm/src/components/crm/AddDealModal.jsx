import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

export const AddDealModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    propertyTitle: '',
    dealValue: '',
    stage: 'OPPORTUNITY',
    probability: 30,
    expectedCloseDate: '',
    commissionRate: 2.0,
    bookingAmount: '',
    assignedAgent: 'Alexander Wright',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dealValue || !formData.clientName) {
      setError('Title, client name, and deal value are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createDeal({
        ...formData,
        dealValue: Number(formData.dealValue) || 0,
        bookingAmount: Number(formData.bookingAmount) || 0,
        commissionRate: Number(formData.commissionRate) || 2.0,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create deal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="lead-detail-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <header>
          <div>
            <span className="eyebrow">TRANSACTION PIPELINE</span>
            <h2>Create Real Estate Deal</h2>
            <small style={{ color: 'var(--color-muted)' }}>
              Track acquisition offers, counteroffers, bookings, and agreement milestones.
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
              Deal / Opportunity Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Bandra Penthouse - Ambani Acquisition"
              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Client / Buyer Name *
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
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Target Property
              </label>
              <input
                type="text"
                value={formData.propertyTitle}
                onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                placeholder="e.g. The Skybridge Penthouse"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Agreed / Estimated Value *
              </label>
              <input
                type="number"
                required
                value={formData.dealValue}
                onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                placeholder="e.g. 85000000"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Initial Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'white', fontSize: 13 }}
              >
                <option value="OPPORTUNITY">Opportunity Identified</option>
                <option value="OFFER_SUBMITTED">Offer Submitted</option>
                <option value="NEGOTIATION">Under Negotiation</option>
                <option value="BOOKING">Booking Confirmed</option>
                <option value="AGREEMENT">Agreement Drafted</option>
                <option value="CLOSED_WON">Closed Won</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Token / Booking Amount
              </label>
              <input
                type="number"
                value={formData.bookingAmount}
                onChange={(e) => setFormData({ ...formData, bookingAmount: e.target.value })}
                placeholder="e.g. 5000000"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Agency Brokerage Split (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                placeholder="2.0"
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Expected Closing Date
              </label>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Assigned Lead Broker
              </label>
              <input
                type="text"
                value={formData.assignedAgent}
                onChange={(e) => setFormData({ ...formData, assignedAgent: e.target.value })}
                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 7, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
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
              {submitting ? 'Creating Deal...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

