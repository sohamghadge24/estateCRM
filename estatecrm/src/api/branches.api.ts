import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Branch } from '../types';

export const branchesApi = {
  list: async (): Promise<Branch[]> => {
    return apiClient.get(ENDPOINTS.ORGANIZATION.BRANCHES);
  },

  create: async (data: Partial<Branch> & Record<string, any>): Promise<Branch> => {
    return apiClient.post(ENDPOINTS.ORGANIZATION.CREATE_BRANCH, data);
  },
};

