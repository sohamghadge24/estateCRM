import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import { DashboardKPIs } from '../types';

export function useDashboard() {
  const [data, setData] = useState<{ metrics: DashboardKPIs; agency: Record<string, any> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getAgencyDashboard();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    metrics: data?.metrics,
    agency: data?.agency,
    loading,
    error,
    refresh: fetchDashboard,
  };
}

