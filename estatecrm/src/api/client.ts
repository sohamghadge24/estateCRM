import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create Centralized Axios Client
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Injects Auth Bearer Token & Tenant Context
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('propnexa_auth_token');
    const tenantId = localStorage.getItem('propnexa_tenant_id') || '1';

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.headers['X-Tenant-ID']) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extracts Enveloped Data & Handles Session Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend standard envelope is {"data": ..., "meta": ...}
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized Session Expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('propnexa_refresh_token');

      if (!refreshToken) {
        // Clear stored auth on hard expiry and emit event
        localStorage.removeItem('propnexa_auth_token');
        localStorage.removeItem('propnexa_user');
        window.dispatchEvent(new CustomEvent('estateos:unauthorized'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data?.data?.access_token || res.data?.access_token;
        const newRefreshToken = res.data?.data?.refresh_token || res.data?.refresh_token;

        if (newAccessToken) {
          localStorage.setItem('propnexa_auth_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('propnexa_refresh_token', newRefreshToken);
          }

          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('propnexa_auth_token');
        localStorage.removeItem('propnexa_refresh_token');
        localStorage.removeItem('propnexa_user');
        window.dispatchEvent(new CustomEvent('estateos:unauthorized'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract standardized backend error message
    const errorData = error.response?.data;
    let errorMessage = 'Network error or service unavailable.';

    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    } else if (errorData?.detail) {
      errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
    } else if (error.message) {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage);
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).data = errorData;

    return Promise.reject(enhancedError);
  }
);

// File upload helper
export const uploadFile = async (
  endpoint: string,
  file: File,
  additionalData: Record<string, any> = {}
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(additionalData).forEach(([k, v]) => {
    formData.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  });

  return apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default apiClient;

