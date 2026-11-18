import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Team } from '../types';

export const teamsApi = {
  list: async (branch_id?: string): Promise<Team[]> => {
    return apiClient.get(ENDPOINTS.ORGANIZATION.TEAMS, { params: { branch_id } });
  },

  create: async (data: Partial<Team> & Record<string, any>): Promise<Team> => {
    return apiClient.post(ENDPOINTS.ORGANIZATION.CREATE_TEAM, data);
  },
};

