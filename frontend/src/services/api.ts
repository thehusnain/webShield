import axios, { type AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

console.log('[API] Initializing with URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CRITICAL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increase timeout for long-running scans
});

// Track if we're already refreshing token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (error?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  config => {
    // 🔥 ENSURE withCredentials on EVERY request
    config.withCredentials = true;
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    console.log('[API] Request headers:', config.headers);
    return config;
  },
  error => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log(`[API] Response ${response.status} from ${response.config.url}`);
    console.log('[API] Response headers:', response.headers);
    return response;
  },
  (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401) {
      console.log('[API] 401 detected');

      // Don't retry login/logout requests
      if (
        originalRequest?.url?.includes('/user/login') ||
        originalRequest?.url?.includes('/user/logout')
      ) {
        return Promise.reject(error);
      }

      // If we're not already refreshing
      if (!isRefreshing) {
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          // Try to refresh token
          api
            .post('/user/refresh-token')
            .then(({ data }) => {
              console.log('[API] Token refreshed');
              processQueue(null, data.token);
              resolve(api(originalRequest));
            })
            .catch(refreshError => {
              console.error('[API] Token refresh failed:', refreshError);
              processQueue(refreshError, null);
              reject(refreshError);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      } else {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
    }

    // Handle other errors
    if (error.response) {
      console.error(
        `[API] Error ${error.response.status} from ${error.config?.url}:`,
        error.response.data
      );
    } else if (error.request) {
      console.error('[API] No response received:', error.message);
    } else {
      console.error('[API] Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (data: { username: string; email: string; password: string }) => {
    const response = await api.post('/user/signup', data);
    return response.data;
  },
    acceptTerms: async () => {
    const response = await api.post('/user/accept-terms');
    return response. data;
  },


  login: async (data: { email: string; password: string }) => {
    console.log('[authAPI] Logging in with credentials:', { email: data.email });
    const response = await api.post('/user/login', data);
    console.log('[authAPI] Login response:', response.data);
    console.log('[authAPI] Response headers:', response.headers);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/user/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  refreshToken: async () => {
    
    try {
      const response = await api.post('/user/refresh-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    console.log('[authAPI] Forgot password request for:', email);
    const response = await api.post('/auth/forgot-password', { email });
    console.log('[authAPI] Forgot password response:', response.data);
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    console.log('[authAPI] Reset password request');
    const response = await api.post('/auth/reset-password', { token, newPassword });
    console.log('[authAPI] Reset password response:', response.data);
    return response.data;
  },
};

// Admin API
// Admin API - Updated to match your backend routes
export const adminAPI = {
  // Test if admin route is accessible
  testAdmin: async () => {
    console.log('[adminAPI] Testing admin access');
    try {
      const response = await api.get('/admin/');
      console.log('[adminAPI] Admin test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[adminAPI] Admin test failed:', error);
      throw error;
    }
  },

  getStats: async () => {
    console.log('[adminAPI] Getting admin stats');
    try {
      const response = await api.get('/admin/stats');
      console.log('[adminAPI] Stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[adminAPI] Get stats failed:', error);
      throw error;
    }
  },

  getAllHistory: async () => {
    console.log('[adminAPI] Getting all scan history');
    try {
      const response = await api.get('/admin/history');
      console.log('[adminAPI] All history response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[adminAPI] Get all history failed:', error);
      throw error;
    }
  },

  getUserHistory: async (userId: string) => {
    console.log('[adminAPI] Getting user scan history for:', userId);
    try {
      const response = await api.get(`/admin/users/${userId}/history`);
      console.log('[adminAPI] User history response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[adminAPI] Get user history failed:', error);
      throw error;
    }
  },

  updateUserLimit: async (userId: string, newLimit: number) => {
    console.log('[adminAPI] Updating user limit:', { userId, newLimit });
    try {
      const response = await api.post('/admin/update-limit', { userId, newLimit });
      console.log('[adminAPI] Update limit response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[adminAPI] Update limit failed:', error);
      throw error;
    }
  },

  removeScan: async (scanId: string) => {
    console.log('[adminAPI] Removing scan:', scanId);
    try {
      const response = await api.delete(`/admin/scan/${scanId}`);
      console.log('[adminAPI] Remove scan response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[adminAPI] Remove scan failed:', error);
      throw error;
    }
  },
};
// Scan API
export const scanAPI = {
  startScan: async (data: { targetUrl: string; scanType: string }) => {
    console.log('[scanAPI] Starting scan:', data);
    console.log('[scanAPI] Cookies before request:', document.cookie);

    const response = await api.post('/scan/start', data);

    console.log('[scanAPI] Start scan response:', response.data);
    console.log('[scanAPI] Response status:', response.status);
    console.log('[scanAPI] Response headers:', response.headers);

    return response.data;
  },

  getScan: async (scanId: string) => {
    const response = await api.get(`/scan/${scanId}`);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/scan/history');
    return response.data;
  },

    cancelScan: async (scanId: string) => {
    console.log('[scanAPI] Cancel scan request:', scanId);
    try {
      const response = await api.post(`/scan/${scanId}/cancel`);
      console.log('[scanAPI] Cancel scan response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[scanAPI] Cancel scan error:', error);
      throw error;
    }
  },


  generateReport: async (scanId: string) => {
    const response = await api.post(`/scan/${scanId}/report/generate`);
    return response.data;
  },
  

  downloadReport: (scanId: string) => {
    window.open(`${API_URL}/scan/${scanId}/report/download`, '_blank');
  },
};

export default api;
