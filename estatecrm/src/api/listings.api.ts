import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Listing } from '../types';

export const listingsApi = {
  list: async (params: { published_only?: boolean; skip?: number; limit?: number } = {}): Promise<Listing[]> => {
    return apiClient.get(ENDPOINTS.LISTINGS.LIST, { params });
  },

  get: async (id: string): Promise<Listing> => {
    return apiClient.get(ENDPOINTS.LISTINGS.GET(id));
  },

  create: async (data: Partial<Listing> & Record<string, any>): Promise<Listing> => {
    return apiClient.post(ENDPOINTS.LISTINGS.CREATE, data);
  },

  update: async (id: string, updates: Partial<Listing> & Record<string, any>): Promise<Listing> => {
    return apiClient.patch(ENDPOINTS.LISTINGS.UPDATE(id), updates);
  },

  updateStatus: async (id: string, status: string): Promise<Listing> => {
    return apiClient.patch(ENDPOINTS.LISTINGS.UPDATE_STATUS(id), { status });
  },

  publish: async (id: string): Promise<Listing> => {
    return apiClient.post(ENDPOINTS.LISTINGS.PUBLISH(id));
  },

  unpublish: async (id: string): Promise<Listing> => {
    return apiClient.post(ENDPOINTS.LISTINGS.UNPUBLISH(id));
  },

  getPublicListings: async (params: { city?: string; min_price?: number; max_price?: number; skip?: number; limit?: number } = {}): Promise<Listing[]> => {
    return apiClient.get(ENDPOINTS.LISTINGS.PUBLIC_LIST, { params });
  },

  getPublicBySlug: async (slug: string): Promise<Listing> => {
    return apiClient.get(ENDPOINTS.LISTINGS.PUBLIC_GET(slug));
  },
};

