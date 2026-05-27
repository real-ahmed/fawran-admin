import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import i18n from './i18n';
import { extractAccessToken } from '@/utils/auth';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_PREFIX;
let refreshTokenRequest: Promise<string> | null = null;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const refreshAdminToken = async (token: string): Promise<string> => {
  const response = await axios.post(
    `${apiBaseUrl}/admin/refresh`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': i18n.language,
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const refreshedToken = extractAccessToken(response.data);

  if (!refreshedToken) {
    throw new Error('Refresh response did not include an access token.');
  }

  return refreshedToken;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Accept-Language'] = i18n.language;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/admin/login') ||
      originalRequest?.url?.includes('/admin/refresh');
    const token = useAuthStore.getState().token;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint && token) {
      originalRequest._retry = true;
      try {
        refreshTokenRequest = refreshTokenRequest || refreshAdminToken(token);
        const refreshedToken = await refreshTokenRequest;
        useAuthStore.getState().setToken(refreshedToken);
        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      } finally {
        refreshTokenRequest = null;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
