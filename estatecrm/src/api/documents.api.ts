import apiClient, { uploadFile } from './client';
import { ENDPOINTS } from './endpoints';
import { DocumentVaultItem } from '../types';

export const documentsApi = {
  list: async (): Promise<DocumentVaultItem[]> => {
    return apiClient.get(ENDPOINTS.DOCUMENTS.LIST);
  },

  create: async (data: Partial<DocumentVaultItem> & Record<string, any>): Promise<DocumentVaultItem> => {
    return apiClient.post(ENDPOINTS.DOCUMENTS.CREATE, data);
  },

  upload: async (file: File, meta: { category?: string; title?: string } = {}): Promise<any> => {
    return uploadFile(ENDPOINTS.DOCUMENTS.CREATE, file, meta);
  },

  getDownloadUrl: async (id: string): Promise<{ download_url: string }> => {
    return apiClient.get(ENDPOINTS.DOCUMENTS.DOWNLOAD(id));
  },
};

