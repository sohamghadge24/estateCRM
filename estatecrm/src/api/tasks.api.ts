import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Task } from '../types';

export const tasksApi = {
  list: async (params: { status?: string; priority?: string; skip?: number; limit?: number } = {}): Promise<Task[]> => {
    return apiClient.get(ENDPOINTS.TASKS.LIST, { params });
  },

  listMyTasks: async (): Promise<Task[]> => {
    return apiClient.get(ENDPOINTS.TASKS.MY_TASKS);
  },

  create: async (data: Partial<Task> & Record<string, any>): Promise<Task> => {
    return apiClient.post(ENDPOINTS.TASKS.CREATE, data);
  },

  update: async (id: string, updates: Partial<Task> & Record<string, any>): Promise<Task> => {
    return apiClient.put(ENDPOINTS.TASKS.UPDATE(id), updates);
  },

  toggle: async (id: string): Promise<Task> => {
    return apiClient.patch(ENDPOINTS.TASKS.TOGGLE(id));
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(ENDPOINTS.TASKS.DELETE(id));
  },
};

