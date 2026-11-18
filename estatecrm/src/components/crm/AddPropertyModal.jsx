import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { api } from '../../services/api';

export const AddPropertyModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'APARTMENT',
    carpetAreaSqft: '',
    price: '',
    bedrooms: '3',
    bathrooms: '3',
    locality: '',
    city: '',
    reraRegistrationNo: '',
    status: 'AVAILABLE',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createProperty(formData);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert(`Error saving property: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-prop-surface border border-prop-border p-6 shadow-modal space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-prop-border">
          <div>
            <h3 className="font-display font-bold text-base text-prop-text">Add Property to Inventory</h3>
            <p className="text-[11px] text-prop-secondary">Spatial SRID 4326 Indexing & RERA Verification</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-prop-muted hover:text-prop-text">
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-prop-secondary font-medium mb-1">Property Title *</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Oberoi Sky City 3BHK Luxury Residence"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Property Type</label>
              <select 
                value={formData.propertyType}
                onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-2.5 py-2 text-prop-text focus:outline-none focus:border-prop-champagne"
              >
                <option value="APARTMENT">Residential Apartment</option>
                <option value="VILLA">Villa / Penthouse</option>
                <option value="COMMERCIAL_OFFICE">Commercial Office</option>
                <option value="RETAIL">Retail / Shop</option>
                <option value="LAND">Land / Plot</option>
              </select>
            </div>
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Carpet Area (sq.ft) *</label>
              <input 
                type="number" 
                required 
                placeholder="1650"
                value={formData.carpetAreaSqft}
                onChange={e => setFormData({ ...formData, carpetAreaSqft: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text font-mono focus:outline-none focus:border-prop-champagne"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Price *</label>
              <input 
                type="number" 
                required 
                placeholder="48500000"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text font-mono focus:outline-none focus:border-prop-champagne"
              />
            </div>
            <div>
              <label className="block text-prop-secondary font-medium mb-1">RERA Registration No.</label>
              <input 
                type="text" 
                placeholder="P51800001234"
                value={formData.reraRegistrationNo}
                onChange={e => setFormData({ ...formData, reraRegistrationNo: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text font-mono focus:outline-none focus:border-prop-champagne"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-prop-secondary font-medium mb-1">Locality</label>
              <input 
                type="text" 
                placeholder="e.g. Borivali East / Worli"
                value={formData.locality}
                onChange={e => setFormData({ ...formData, locality: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne"
              />
            </div>
            <div>
              <label className="block text-prop-secondary font-medium mb-1">City</label>
              <input 
                type="text" 
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-prop-bg border border-prop-border rounded-lg px-3 py-2 text-prop-text focus:outline-none focus:border-prop-champagne"
              />
            </div>
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
              {loading ? 'Adding Unit...' : 'Add Property'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

