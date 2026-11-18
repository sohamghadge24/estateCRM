import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Lead, LeadActivity } from '../types';

export const leadsApi = {
  list: async (params: { status?: string; source?: string; skip?: number; limit?: number } = {}): Promise<Lead[]> => {
    return apiClient.get(ENDPOINTS.LEADS.LIST, { params });
  },

  get: async (id: string): Promise<Lead> => {
    return apiClient.get(ENDPOINTS.LEADS.GET(id));
  },

  create: async (data: Partial<Lead> & Record<string, any>): Promise<Lead> => {
    return apiClient.post(ENDPOINTS.LEADS.CREATE, data);
  },

  update: async (id: string, updates: Partial<Lead> & Record<string, any>): Promise<Lead> => {
    return apiClient.patch(ENDPOINTS.LEADS.UPDATE(id), updates);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(ENDPOINTS.LEADS.DELETE(id));
  },

  assign: async (id: string, assigned_agent: string): Promise<Lead> => {
    return apiClient.post(ENDPOINTS.LEADS.ASSIGN(id), { assigned_agent, assignedAgent: assigned_agent });
  },

  addActivity: async (id: string, activity: { activity_type: string; details: string; performed_by?: string }): Promise<LeadActivity> => {
    return apiClient.post(ENDPOINTS.LEADS.ACTIVITIES(id), activity);
  },
};

