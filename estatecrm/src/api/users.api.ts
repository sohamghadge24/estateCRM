import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Member } from '../types';

export const usersApi = {
  listMembers: async (): Promise<Member[]> => {
    return apiClient.get(ENDPOINTS.ORGANIZATION.MEMBERS);
  },

  inviteMember: async (data: { email: string; full_name?: string; role: string; branch_id?: string; team_id?: string }): Promise<any> => {
    return apiClient.post(ENDPOINTS.ORGANIZATION.INVITE, data);
  },
};

