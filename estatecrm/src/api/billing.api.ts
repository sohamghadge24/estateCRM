import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Subscription, Invoice } from '../types';

export const billingApi = {
  getSubscription: async (): Promise<Subscription> => {
    return apiClient.get(ENDPOINTS.BILLING.SUBSCRIPTION);
  },

  listInvoices: async (): Promise<Invoice[]> => {
    return apiClient.get(ENDPOINTS.BILLING.INVOICES);
  },
};

