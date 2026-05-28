import apiClient from '@/config/axios';
import { PaginatedResponse } from '@/types/api';

export interface LocalizedName {
  en?: string;
  ar?: string;
}

export interface PermissionRecord {
  id?: number;
  name: string;
  key?: string;
  display_name?: LocalizedName;
}

export interface Role {
  id: number;
  name: string;
  display_name?: LocalizedName;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions?: PermissionRecord[];
}

export interface RolePayload {
  display_name: LocalizedName;
  permissions: string[];
}

export interface FetchRolesParams {
  search?: string;
  page?: number;
}

export const fetchRoles = async (params?: FetchRolesParams): Promise<PaginatedResponse<Role>> => {
  const cleanParams = { ...params };
  if (cleanParams.search === '') {
    delete cleanParams.search;
  }
  const res = await apiClient.get('/admin/roles', { params: cleanParams });
  // Typical Laravel API returns data inside a top-level `data` or directly inside the response
  // If the resource uses API resources with pagination, it's usually res.data
  return res.data;
};

export const fetchRole = async (id: number): Promise<Role> => {
  const res = await apiClient.get(`/admin/roles/${id}`);
  return res.data.data;
};

export const createRole = async (data: RolePayload): Promise<Role> => {
  const res = await apiClient.post('/admin/roles', data);
  return res.data.data;
};

export const updateRole = async (id: number, data: RolePayload): Promise<Role> => {
  const res = await apiClient.put(`/admin/roles/${id}`, data);
  return res.data.data;
};

export const deleteRole = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/roles/${id}`);
};

export const fetchRoleById = async (id: number): Promise<Role> => {
  const res = await apiClient.get(`/admin/roles/${id}`);
  return res.data.data || res.data;
};

export type PermissionInput = PermissionRecord | string;
export type PermissionsResponse = Record<string, PermissionInput[]> | PermissionInput[];

export const fetchPermissions = async (): Promise<PermissionsResponse> => {
  const res = await apiClient.get('/admin/roles/permissions');
  // It usually returns a list of permission names or objects. Assuming names.
  return res.data.data;
};
