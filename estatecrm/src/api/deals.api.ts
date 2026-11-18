import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Deal } from '../types';

export const dealsApi = {
  list: async (params: { stage?: string; skip?: number; limit?: number } = {}): Promise<Deal[]> => {
    return apiClient.get(ENDPOINTS.DEALS.LIST, { params });
  },

  get: async (id: string): Promise<Deal> => {
    return apiClient.get(ENDPOINTS.DEALS.GET(id));
  },

  create: async (data: Partial<Deal> & Record<string, any>): Promise<Deal> => {
    return apiClient.post(ENDPOINTS.DEALS.CREATE, data);
  },

  update: async (id: string, updates: Partial<Deal> & Record<string, any>): Promise<Deal> => {
    return apiClient.patch(ENDPOINTS.DEALS.UPDATE(id), updates);
  },

  updateStage: async (id: string, stage: string): Promise<Deal> => {
    return apiClient.patch(ENDPOINTS.DEALS.UPDATE_STAGE(id), { stage });
  },

  recordPayment: async (id: string, payment: { amount: number; payment_type?: string; payment_method?: string; reference_no?: string }): Promise<any> => {
    return apiClient.post(ENDPOINTS.DEALS.PAYMENTS(id), payment);
  },

  createOffer: async (id: string, offer: { amount: number; offered_by?: string; status?: string }): Promise<any> => {
    return apiClient.post(ENDPOINTS.DEALS.OFFERS(id), offer);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(ENDPOINTS.DEALS.DELETE(id));
  },
};

