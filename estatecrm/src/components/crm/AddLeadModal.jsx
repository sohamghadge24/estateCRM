import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

export const AddLeadModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneE164: '',
    email: '',
    budgetMin: '',
    budgetMax: '',
    propertyTypePreference: 'APARTMENT',
    preferredLocality: '',
    source: 'WEBSITE_PORTAL',
    status: 'NEW',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (formData.budgetMin && formData.budgetMax && Number(formData.budgetMin) > Number(formData.budgetMax)) {
      setFormError('Minimum budget must be less than or equal to maximum budget.');
      return;
    }
    const normalizedPhone = formData.phoneE164.replace(/[^\d+]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setFormError('Enter a valid international phone number, such as +919820100000.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.getLeads();
      const existingLeads = Array.isArray(response) ? response : response?.items || [];
      const normalizePhone = value => String(value || '').replace(/\D/g, '');
      const normalizedEmail = formData.email.trim().toLowerCase();
      const duplicate = existingLeads.find(lead =>
        (normalizePhone(normalizedPhone) && normalizePhone(lead.phoneE164) === normalizePhone(normalizedPhone))
        || (normalizedEmail && String(lead.email || '').trim().toLowerCase() === normalizedEmail)
      );
      if (duplicate && !window.confirm(`A lead with this phone number or email already exists (${duplicate.firstName || ''} ${duplicate.lastName || ''}). Create another record anyway?`)) {
        setLoading(false);
        return;
      }
      const leadPayload = { ...formData, phoneE164: normalizedPhone };
      ['budgetMin', 'budgetMax'].forEach(field => {
        if (formData[field] === '') delete leadPayload[field];
        else leadPayload[field] = Number(formData[field]);
      });
      await api.createLead(leadPayload);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setFormError(`Unable to save lead: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-prop-surface border border-prop-border p-6 shadow-modal space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-prop-border">
          <div>
            <h3 className="font-display font-bold text-base text-prop-text">Create lead</h3>
            <p className="text-[11px] text-prop-secondary">Add a buyer or renter inquiry to your workspace.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-prop-muted hover:text-prop-text">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-prop-secondary font-medium mb-1">First Name *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Ananya"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne"
              />
            </div>
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Last Name *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Verma"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Phone Number (E.164) *</label>
              <input 
                type="tel" 
                required 
                placeholder="+91 98201 00000"
                value={formData.phoneE164}
                onChange={e => setFormData({ ...formData, phoneE164: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne font-mono"
              />
            </div>
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="client@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Minimum Budget</label>
              <input 
                type="number" 
                min="0"
                placeholder="Optional"
                value={formData.budgetMin}
                onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne font-mono"
              />
            </div>
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Maximum Budget</label>
              <input 
                type="number" 
                min="0"
                placeholder="e.g. 50000000"
                value={formData.budgetMax}
                onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne font-mono"
              />
            </div>
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Property Type</label>
              <select 
                value={formData.propertyTypePreference}
                onChange={e => setFormData({ ...formData, propertyTypePreference: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-2.5 py-2 text-prop-text focus:outline-none focus:border-prop-champagne"
              >
                <option value="APARTMENT">Residential Apartment</option>
                <option value="VILLA">Villa / Penthouse</option>
                <option value="COMMERCIAL_OFFICE">Commercial Office</option>
                <option value="RETAIL">Retail / Shop</option>
                <option value="LAND">Land / Plot</option>
              </select>
            </div>
          </div>

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <div>
            <label className="block text-prop-secondary font-medium mb-1">Preferred Locality / City</label>
            <input 
              type="text" 
              placeholder="e.g. Worli Promenade, South Mumbai"
              value={formData.preferredLocality}
              onChange={e => setFormData({ ...formData, preferredLocality: e.target.value })}
              className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-prop-border">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg border border-prop-border text-prop-secondary hover:text-prop-text text-xs font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-prop-champagne hover:bg-prop-champagneDark text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {loading ? 'Creating...' : 'Save Lead'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

