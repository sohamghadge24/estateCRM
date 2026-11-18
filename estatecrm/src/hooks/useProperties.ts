import { useState, useEffect, useCallback } from 'react';
import { propertiesApi } from '../api/properties.api';
import { Property } from '../types';

export function useProperties(filters: { city?: string; property_type?: string; status?: string } = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await propertiesApi.list(filters);
      setProperties(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [filters.city, filters.property_type, filters.status]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const createProperty = async (data: Partial<Property>) => {
    const created = await propertiesApi.create(data);
    setProperties((prev) => [created, ...prev]);
    return created;
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const updated = await propertiesApi.update(id, updates);
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProperty = async (id: string) => {
    await propertiesApi.delete(id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    properties,
    loading,
    error,
    refresh: fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}

