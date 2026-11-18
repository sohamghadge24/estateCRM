import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { DashboardKPIs } from '../types';

export const dashboardApi = {
  getOverview: async (): Promise<{ metrics: DashboardKPIs; agency: Record<string, any> }> => {
    return apiClient.get(ENDPOINTS.DASHBOARD.OVERVIEW);
  },

  getAgencyDashboard: async (): Promise<{ metrics: DashboardKPIs; agency: Record<string, any> }> => {
    return apiClient.get(ENDPOINTS.DASHBOARD.AGENCY);
  },

  getAnalytics: async (): Promise<{ metrics: DashboardKPIs; agency: Record<string, any> }> => {
    return apiClient.get(ENDPOINTS.DASHBOARD.ANALYTICS);
  },
};

