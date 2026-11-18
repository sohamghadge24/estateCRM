import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { User, Tenant, AuthSession } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthSession> => {
    const data: any = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
    if (data.access_token) {
      localStorage.setItem('propnexa_auth_token', data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem('propnexa_refresh_token', data.refresh_token);
    }
    if (data.tenant_id) {
      localStorage.setItem('propnexa_tenant_id', data.tenant_id);
    }
    if (data.user) {
      localStorage.setItem('propnexa_user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (payload: {
    agency_name: string;
    subdomain: string;
    admin_name: string;
    email: string;
    password: string;
    plan?: string;
  }): Promise<AuthSession> => {
    const data: any = await apiClient.post(ENDPOINTS.AUTH.REGISTER, payload);
    if (data.access_token) {
      localStorage.setItem('propnexa_auth_token', data.access_token);
    }
    if (data.tenant_id) {
      localStorage.setItem('propnexa_tenant_id', data.tenant_id);
    }
    if (data.user) {
      localStorage.setItem('propnexa_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Continue cleanup on local client regardless
    } finally {
      localStorage.removeItem('propnexa_auth_token');
      localStorage.removeItem('propnexa_refresh_token');
      localStorage.removeItem('propnexa_user');
    }
  },

  getMe: async (): Promise<{ user: User; active_tenant: Tenant }> => {
    return apiClient.get(ENDPOINTS.AUTH.ME);
  },

  refreshToken: async (refresh_token: string): Promise<{ access_token: string; refresh_token: string }> => {
    return apiClient.post(ENDPOINTS.AUTH.REFRESH, { refresh_token });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (token: string, new_password: string): Promise<{ message: string }> => {
    return apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, new_password });
  },

  switchTenant: async (tenant_id: string): Promise<{ access_token: string; tenant_id: string; role: string }> => {
    const data: any = await apiClient.post(ENDPOINTS.AUTH.SWITCH_TENANT, { tenant_id });
    if (data.access_token) {
      localStorage.setItem('propnexa_auth_token', data.access_token);
      localStorage.setItem('propnexa_tenant_id', tenant_id);
    }
    return data;
  },
};

