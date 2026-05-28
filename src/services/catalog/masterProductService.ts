import apiClient from '@/config/axios';
import { PaginatedResponse } from '@/types/api';
import type { CatalogQuery, MasterProduct, MasterProductPayload } from '@/types/catalog';
import { cleanCatalogQuery, toCatalogFormData } from './shared';

export const getMasterProducts = async (params?: CatalogQuery): Promise<PaginatedResponse<MasterProduct>> => {
  const response = await apiClient.get('/admin/master-products', { params: cleanCatalogQuery(params) });
  return response.data;
};

export const getMasterProduct = async (id: number): Promise<MasterProduct> => {
  const response = await apiClient.get(`/admin/master-products/${id}`);
  return response.data.data;
};

export const createMasterProduct = async (payload: MasterProductPayload): Promise<MasterProduct> => {
  const response = await apiClient.post('/admin/master-products', toCatalogFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const updateMasterProduct = async (id: number, payload: MasterProductPayload): Promise<MasterProduct> => {
  const response = await apiClient.post(`/admin/master-products/${id}`, toCatalogFormData(payload, true), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const deleteMasterProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/master-products/${id}`);
};

export const approveMasterProduct = async (id: number): Promise<void> => {
  await apiClient.put(`/admin/master-products/${id}/approve`);
};

export const rejectMasterProduct = async (id: number, reason?: string): Promise<void> => {
  await apiClient.put(`/admin/master-products/${id}/reject`, reason ? { reason } : {});
};
