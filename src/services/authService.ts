import apiClient from '@/config/axios';
import { extractAccessToken } from '@/utils/auth';

export interface LoginAdminPayload {
  email: string;
  password: string;
  recaptcha_token?: string;
}

export interface CurrentAdmin {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface CurrentAdminResponse {
  user: CurrentAdmin;
  permissions: string[];
}

export const loginAdmin = async (data: LoginAdminPayload): Promise<string | null> => {
  const response = await apiClient.post('/admin/login', data);
  return extractAccessToken(response.data);
};

export const fetchCurrentAdmin = async (token?: string): Promise<CurrentAdminResponse> => {
  const response = await apiClient.get('/admin/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const user = response.data?.data || response.data;
  const permissions = response.data?.data?.permissions || response.data?.permissions || [];

  return { user, permissions };
};
