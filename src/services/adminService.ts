import apiClient from '@/config/axios';
import { PaginatedResponse } from '@/types/api';
import { Role } from './roleService';

export interface Admin {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: string[];
}

export interface AdminPayload {
  name: string;
  email: string;
  password?: string;
  is_active: boolean;
  roles: string[]; // names of roles
}

export interface FetchAdminsParams {
  search?: string;
  is_active?: boolean | string;
  page?: number;
  per_page?: number;
}

export const fetchAdmins = async (params?: FetchAdminsParams): Promise<PaginatedResponse<Admin>> => {
  const cleanParams = { ...params };
  if (cleanParams.search === '') {
    delete cleanParams.search;
  }
  const res = await apiClient.get('/admin/admins', { params: cleanParams });
  return res.data;
};

export const fetchAdmin = async (id: number): Promise<Admin> => {
  const res = await apiClient.get(`/admin/admins/${id}`);
  return res.data.data;
};

export const createAdmin = async (data: AdminPayload): Promise<Admin> => {
  const res = await apiClient.post('/admin/admins', data);
  return res.data.data;
};

export const updateAdmin = async (id: number, data: AdminPayload): Promise<Admin> => {
  const res = await apiClient.put(`/admin/admins/${id}`, data);
  return res.data.data;
};

export const deleteAdmin = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/admins/${id}`);
};

export const fetchAdminById = async (id: number): Promise<Admin> => {
  const res = await apiClient.get(`/admin/admins/${id}`);
  return res.data.data || res.data;
};
