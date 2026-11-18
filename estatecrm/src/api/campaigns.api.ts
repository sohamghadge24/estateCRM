import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Campaign } from '../types';

export const campaignsApi = {
  list: async (): Promise<Campaign[]> => {
    return apiClient.get(ENDPOINTS.CAMPAIGNS.LIST);
  },

  create: async (data: Partial<Campaign> & Record<string, any>): Promise<Campaign> => {
    return apiClient.post(ENDPOINTS.CAMPAIGNS.CREATE, data);
  },

  update: async (id: string, updates: Partial<Campaign> & Record<string, any>): Promise<Campaign> => {
    return apiClient.patch(ENDPOINTS.CAMPAIGNS.UPDATE(id), updates);
  },
};

