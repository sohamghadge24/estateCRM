import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { CommunicationLog } from '../types';

export const communicationsApi = {
  list: async (): Promise<CommunicationLog[]> => {
    return apiClient.get(ENDPOINTS.COMMUNICATIONS.LIST);
  },

  send: async (data: {
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
    recipient_name: string;
    recipient_contact: string;
    subject?: string;
    content: string;
  }): Promise<CommunicationLog> => {
    return apiClient.post(ENDPOINTS.COMMUNICATIONS.SEND, data);
  },
};

