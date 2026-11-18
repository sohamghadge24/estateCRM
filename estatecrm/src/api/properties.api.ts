import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Property } from '../types';

export const propertiesApi = {
  list: async (params: { city?: string; property_type?: string; status?: string; featured?: boolean; skip?: number; limit?: number } = {}): Promise<Property[]> => {
    return apiClient.get(ENDPOINTS.PROPERTIES.LIST, { params });
  },

  search: async (params: { q?: string; city?: string; property_type?: string; status?: string; skip?: number; limit?: number } = {}): Promise<Property[]> => {
    return apiClient.get(ENDPOINTS.PROPERTIES.SEARCH, { params });
  },

  get: async (id: string): Promise<Property> => {
    return apiClient.get(ENDPOINTS.PROPERTIES.GET(id));
  },

  create: async (data: Partial<Property> & Record<string, any>): Promise<Property> => {
    return apiClient.post(ENDPOINTS.PROPERTIES.CREATE, data);
  },

  update: async (id: string, updates: Partial<Property> & Record<string, any>): Promise<Property> => {
    return apiClient.patch(ENDPOINTS.PROPERTIES.UPDATE(id), updates);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(ENDPOINTS.PROPERTIES.DELETE(id));
  },
};

