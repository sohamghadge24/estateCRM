import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Enquiry, Lead } from '../types';

export const enquiriesApi = {
  list: async (params: { status?: string; skip?: number; limit?: number } = {}): Promise<Enquiry[]> => {
    return apiClient.get(ENDPOINTS.ENQUIRIES.LIST, { params });
  },

  get: async (id: string): Promise<Enquiry> => {
    return apiClient.get(ENDPOINTS.ENQUIRIES.GET(id));
  },

  create: async (data: Partial<Enquiry> & Record<string, any>): Promise<Enquiry> => {
    return apiClient.post(ENDPOINTS.ENQUIRIES.CREATE, data);
  },

  update: async (id: string, updates: Partial<Enquiry> & Record<string, any>): Promise<Enquiry> => {
    return apiClient.patch(ENDPOINTS.ENQUIRIES.UPDATE(id), updates);
  },

  convert: async (id: string, assigned_agent?: string): Promise<{ lead: Lead; message: string }> => {
    return apiClient.post(ENDPOINTS.ENQUIRIES.CONVERT(id), { assigned_agent, assignedAgent: assigned_agent });
  },
};

