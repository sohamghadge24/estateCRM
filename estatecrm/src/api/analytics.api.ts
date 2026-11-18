import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { DashboardKPIs } from '../types';

export const analyticsApi = {
  getKPIs: async (): Promise<{ metrics: DashboardKPIs; agency: Record<string, any> }> => {
    return apiClient.get(ENDPOINTS.DASHBOARD.ANALYTICS);
  },
};

