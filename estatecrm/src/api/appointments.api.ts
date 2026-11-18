import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Appointment } from '../types';

export const appointmentsApi = {
  list: async (params: { status?: string; skip?: number; limit?: number } = {}): Promise<Appointment[]> => {
    return apiClient.get(ENDPOINTS.APPOINTMENTS.LIST, { params });
  },

  get: async (id: string): Promise<Appointment> => {
    return apiClient.get(ENDPOINTS.APPOINTMENTS.GET(id));
  },

  create: async (data: Partial<Appointment> & Record<string, any>): Promise<Appointment> => {
    return apiClient.post(ENDPOINTS.APPOINTMENTS.CREATE, data);
  },

  update: async (id: string, updates: Partial<Appointment> & Record<string, any>): Promise<Appointment> => {
    return apiClient.patch(ENDPOINTS.APPOINTMENTS.UPDATE(id), updates);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(ENDPOINTS.APPOINTMENTS.DELETE(id));
  },
};

