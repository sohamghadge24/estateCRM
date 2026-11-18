import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../common/Icons';

export const PropertiesPanel = ({ onOpenAddProperty }) => {
  const { formatCurrency } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const pageSize = 9;

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProperties();
      setProperties(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('Cannot connect to backend service (http://localhost:8000). Please ensure the FastAPI backend server is active.');
      } else {
        setError(msg || 'Unable to load properties.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this property record? This cannot be undone.')) {
      try {
        setError('');
        await api.deleteProperty(id);
        if (selectedProperty?.id === id) {
          setSelectedProperty(null);
        }
        await loadProperties();
      } catch (err) {
        setError(err.message || 'Unable to delete this property.');
      }
    }
  };

  const propertyTypes = [...new Set(properties.map(property => property.propertyType).filter(Boolean))].sort();
  const statuses = [...new Set(properties.map(property => property.status).filter(Boolean))].sort();
  const filtered = properties.filter(p => {
    const q = searchQuery.toLowerCase();
    const searchable = [p.title, p.locality, p.city, p.reraRegistrationNo, p.propertyType, p.status]
      .filter(Boolean).join(' ').toLowerCase();
    return searchable.includes(q)
      && (typeFilter === 'all' || p.propertyType === typeFilter)
      && (statusFilter === 'all' || p.status === statusFilter);
  }).sort((left, right) => {
    const leftValue = left[sortBy] ?? '';
    const rightValue = right[sortBy] ?? '';
    const comparison = ['price', 'carpetAreaSqft'].includes(sortBy)
      ? (Number(leftValue) || 0) - (Number(rightValue) || 0)
      : String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: 'base' });
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageProperties = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, typeFilter, statusFilter, viewMode]);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const renderStatus = property => (
    <span className={`status-pill ${property.status ? `status-${property.status.toLowerCase().replaceAll('_', '-')}` : 'status-neutral'}`}>
      {property.status || 'Unspecified'}
    </span>
  );

  const renderDeleteButton = property => (
    <button
      onClick={(e) => handleDelete(e, property.id)}
      className="property-delete-button"
      title="Delete property"
      aria-label={`Delete ${property.title || 'property'}`}
    >
      <Icon name="x" size={14} />
    </button>
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-prop-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-2xl text-prop-text">Properties</h1>
          </div>
          <p className="text-xs text-prop-secondary mt-0.5">
            Keep your property inventory organized and up to date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenAddProperty}
            className="px-3.5 py-1.5 rounded-lg bg-prop-champagne hover:bg-prop-champagneDark text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <Icon name="plus" size={14} />
            <span>Add property</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="property-toolbar">
        <div className="property-filter-controls">
          <div className="lead-search">
            <Icon name="search" size={14} className="text-prop-muted" />
            <input 
              type="text" 
              placeholder="Search title, location, registration..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="lead-search-input"
            />
          </div>
          <select aria-label="Filter by property type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            {propertyTypes.map(type => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
          </select>
          <select aria-label="Filter by listing status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
          <select aria-label="Sort properties" value={sortBy} onChange={e => { setSortBy(e.target.value); setSortDirection(e.target.value === 'createdAt' ? 'desc' : 'asc'); }}>
            <option value="createdAt">Recently added</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="carpetAreaSqft">Area</option>
          </select>
          <button className="sort-direction-button" onClick={() => setSortDirection(direction => direction === 'asc' ? 'desc' : 'asc')} aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`} title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
          {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && <button className="text-action" onClick={clearFilters}>Clear filters</button>}
        </div>
        <div className="property-toolbar-meta">
          <span>{filtered.length} {filtered.length === 1 ? 'property' : 'properties'}</span>
          <div className="view-toggle" role="group" aria-label="Property view">
            <button className={viewMode === 'grid' ? 'is-selected' : ''} onClick={() => setViewMode('grid')}>Grid</button>
            <button className={viewMode === 'list' ? 'is-selected' : ''} onClick={() => setViewMode('list')}>List</button>
          </div>
        </div>
      </div>

      {/* Content Grid or Genuine Empty State */}
      {loading ? (
        <div className="empty-panel" role="status">
          Loading properties...
        </div>
      ) : error ? (
        <div className="empty-panel api-error-state" role="alert">
          <Icon name="alertCircle" size={20} />
          <p>Properties could not be loaded: {error}</p>
          <button onClick={loadProperties}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-prop-surface border border-prop-border text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-prop-bg text-prop-muted flex items-center justify-center mx-auto">
            <Icon name="building" size={20} />
          </div>
          <h3 className="font-bold text-sm text-prop-text">No Properties in Inventory</h3>
          <p className="text-xs text-prop-secondary max-w-sm mx-auto">
            {properties.length === 0 
              ? 'Your property inventory is empty. Add a property to begin.'
              : 'No properties match the selected search and filters.'}
          </p>
          {properties.length === 0 && (
            <button 
              onClick={onOpenAddProperty}
              className="mt-2 px-4 py-2 rounded-lg bg-prop-champagne text-white text-xs font-semibold"
            >
              + Add property
            </button>
          )}
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="property-grid">
            {pageProperties.map(property => (
              <article 
                key={property.id} 
                className="property-card cursor-pointer hover:border-prop-champagne transition-all"
                onClick={() => setSelectedProperty(property)}
              >
                <div className="property-card-heading">
                  {renderStatus(property)}
                  {renderDeleteButton(property)}
                </div>
                <div className="property-card-price">{property.price ? formatCurrency(property.price) : 'Price not provided'}</div>
                <h2 className="hover:text-prop-champagne transition-colors">{property.title || 'Untitled property'}</h2>
                <p className="property-card-location">{[property.locality, property.city].filter(Boolean).join(', ') || 'Location not provided'}</p>
                <div className="property-card-footer">
                  <span>{(property.propertyType || 'Type not provided').replaceAll('_', ' ')}</span>
                  <span>{property.carpetAreaSqft ? `${Number(property.carpetAreaSqft).toLocaleString()} sq.ft` : 'Area not provided'}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="property-table-wrap">
            <table className="property-table">
              <thead><tr><th>Property</th><th>Type</th><th>Location</th><th>Price</th><th>Area</th><th>Status</th><th aria-label="Actions" /></tr></thead>
              <tbody>{pageProperties.map(property => (
                <tr 
                  key={property.id} 
                  className="cursor-pointer hover:bg-prop-card"
                  onClick={() => setSelectedProperty(property)}
                >
                  <td><strong>{property.title || 'Untitled property'}</strong><small>{property.id}</small></td>
                  <td>{(property.propertyType || '—').replaceAll('_', ' ')}</td>
                  <td>{[property.locality, property.city].filter(Boolean).join(', ') || '—'}</td>
                  <td>{property.price ? formatCurrency(property.price) : '—'}</td>
                  <td>{property.carpetAreaSqft ? `${Number(property.carpetAreaSqft).toLocaleString()} sq.ft` : '—'}</td>
                  <td>{renderStatus(property)}</td>
                  <td>{renderDeleteButton(property)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )
      )}

      {!loading && !error && filtered.length > 0 && <div className="lead-pagination">
        <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
        <div>
          <button disabled={page <= 1} onClick={() => setPage(current => current - 1)}>Previous</button>
          <span>Page {page} of {pageCount}</span>
          <button disabled={page >= pageCount} onClick={() => setPage(current => current + 1)}>Next</button>
        </div>
      </div>}

      {/* Property Details Modal */}
      {selectedProperty && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedProperty(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-prop-border p-6 space-y-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-prop-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-prop-bg text-prop-secondary font-semibold">
                    {selectedProperty.id}
                  </span>
                  {renderStatus(selectedProperty)}
                  {selectedProperty.reraRegistrationNo && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      RERA: {selectedProperty.reraRegistrationNo}
                    </span>
                  )}
                </div>
                <h2 className="font-display font-bold text-xl text-prop-text">
                  {selectedProperty.title}
                </h2>
                <p className="text-xs text-prop-secondary mt-0.5 flex items-center gap-1">
                  <Icon name="mapPin" size={12} className="text-prop-champagne" />
                  {[selectedProperty.locality, selectedProperty.city].filter(Boolean).join(', ')}
                </p>
              </div>

              <button 
                onClick={() => setSelectedProperty(null)}
                className="w-8 h-8 rounded-full bg-prop-bg hover:bg-neutral-200 text-prop-secondary flex items-center justify-center transition-colors"
                aria-label="Close property detail"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            {/* Price & Primary Specs Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-prop-card border border-prop-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-prop-muted">List Price</span>
                <p className="font-display font-bold text-lg text-prop-text mt-0.5">
                  {selectedProperty.price ? formatCurrency(selectedProperty.price) : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-prop-muted">Carpet Area</span>
                <p className="font-display font-semibold text-sm text-prop-text mt-1">
                  {selectedProperty.carpetAreaSqft ? `${Number(selectedProperty.carpetAreaSqft).toLocaleString()} sq.ft` : '—'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-prop-muted">Configuration</span>
                <p className="font-display font-semibold text-sm text-prop-text mt-1">
                  {selectedProperty.bedrooms ? `${selectedProperty.bedrooms} BHK` : selectedProperty.propertyType?.replaceAll('_', ' ')}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-prop-muted">Type / Purpose</span>
                <p className="font-display font-semibold text-sm text-prop-text mt-1">
                  {selectedProperty.saleOrRent || 'SALE'}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedProperty.description && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-prop-secondary mb-2">Description</h4>
                <p className="text-xs text-prop-body leading-relaxed bg-prop-bg/50 p-3 rounded-lg border border-prop-border">
                  {selectedProperty.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-prop-secondary mb-2">Key Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities.map(amenity => (
                    <span 
                      key={amenity}
                      className="text-xs px-2.5 py-1 rounded-md bg-prop-bg text-prop-text font-medium border border-prop-border"
                    >
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner & Assigned Representative */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-prop-border">
              <div className="p-3 rounded-lg bg-prop-bg/50 border border-prop-border">
                <span className="text-[10px] uppercase font-bold text-prop-muted">Property Owner</span>
                <p className="text-xs font-bold text-prop-text mt-1">{selectedProperty.ownerName || 'Confidential'}</p>
                <p className="text-xs text-prop-secondary mt-0.5">{selectedProperty.ownerPhone || 'No contact on file'}</p>
              </div>
              <div className="p-3 rounded-lg bg-prop-bg/50 border border-prop-border">
                <span className="text-[10px] uppercase font-bold text-prop-muted">Assigned Listing Agent</span>
                <p className="text-xs font-bold text-prop-text mt-1">{selectedProperty.assignedAgent || 'Unassigned'}</p>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold mt-1">
                  Exclusive Representation
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-prop-border">
              <button 
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-2 rounded-lg border border-prop-border text-xs font-semibold text-prop-text hover:bg-prop-bg transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Property dossier link copied to clipboard!');
                }}
                className="px-4 py-2 rounded-lg bg-prop-champagne text-white text-xs font-semibold hover:bg-prop-champagneDark transition-colors shadow-sm"
              >
                Share Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


