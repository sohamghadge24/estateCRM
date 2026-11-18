import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { FinanceTransaction, Expense, Commission } from '../types';

export const financeApi = {
  listTransactions: async (params: { transaction_type?: string; skip?: number; limit?: number } = {}): Promise<FinanceTransaction[]> => {
    return apiClient.get(ENDPOINTS.FINANCE.TRANSACTIONS, { params });
  },

  createTransaction: async (data: Partial<FinanceTransaction> & Record<string, any>): Promise<FinanceTransaction> => {
    return apiClient.post(ENDPOINTS.FINANCE.CREATE_TRANSACTION, data);
  },

  listExpenses: async (params: { skip?: number; limit?: number } = {}): Promise<Expense[]> => {
    return apiClient.get(ENDPOINTS.FINANCE.EXPENSES, { params });
  },

  createExpense: async (data: Partial<Expense> & Record<string, any>): Promise<Expense> => {
    return apiClient.post(ENDPOINTS.FINANCE.CREATE_EXPENSE, data);
  },

  listCommissions: async (params: { status?: string } = {}): Promise<Commission[]> => {
    return apiClient.get(ENDPOINTS.FINANCE.COMMISSIONS, { params });
  },

  payoutCommission: async (id: string): Promise<Commission> => {
    return apiClient.post(ENDPOINTS.FINANCE.PAYOUT_COMMISSION(id));
  },
};

