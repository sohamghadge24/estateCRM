import { useState, useEffect, useCallback } from 'react';
import { leadsApi } from '../api/leads.api';
import { Lead } from '../types';

export function useLeads(filters: { status?: string; source?: string } = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadsApi.list(filters);
      setLeads(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.source]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const createLead = async (leadData: Partial<Lead>) => {
    const created = await leadsApi.create(leadData);
    setLeads((prev) => [created, ...prev]);
    return created;
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const updated = await leadsApi.update(id, updates);
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    return updated;
  };

  const deleteLead = async (id: string) => {
    await leadsApi.delete(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  return {
    leads,
    loading,
    error,
    refresh: fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
}

