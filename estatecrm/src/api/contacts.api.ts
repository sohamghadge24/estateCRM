import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Contact } from '../types';

export const contactsApi = {
  list: async (params: { type?: string; skip?: number; limit?: number } = {}): Promise<Contact[]> => {
    return apiClient.get(ENDPOINTS.CONTACTS.LIST, { params });
  },

  get: async (id: string): Promise<Contact> => {
    return apiClient.get(ENDPOINTS.CONTACTS.GET(id));
  },

  create: async (data: Partial<Contact> & Record<string, any>): Promise<Contact> => {
    return apiClient.post(ENDPOINTS.CONTACTS.CREATE, data);
  },

  update: async (id: string, updates: Partial<Contact> & Record<string, any>): Promise<Contact> => {
    return apiClient.patch(ENDPOINTS.CONTACTS.UPDATE(id), updates);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(ENDPOINTS.CONTACTS.DELETE(id));
  },
};

