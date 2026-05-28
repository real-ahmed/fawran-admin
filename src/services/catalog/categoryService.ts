import apiClient from '@/config/axios';
import { PaginatedResponse } from '@/types/api';
import type { CatalogQuery, Category, CategoryPayload } from '@/types/catalog';
import { cleanCatalogQuery, toCatalogFormData } from './shared';

export const getCategories = async (params?: CatalogQuery): Promise<PaginatedResponse<Category>> => {
  const response = await apiClient.get('/admin/categories', { params: cleanCatalogQuery(params) });
  return response.data;
};

export const getCategory = async (id: number): Promise<Category> => {
  const response = await apiClient.get(`/admin/categories/${id}`);
  return response.data.data;
};

export const createCategory = async (payload: CategoryPayload): Promise<Category> => {
  const response = await apiClient.post('/admin/categories', toCatalogFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const updateCategory = async (id: number, payload: CategoryPayload): Promise<Category> => {
  const response = await apiClient.post(`/admin/categories/${id}`, toCatalogFormData(payload, true), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/categories/${id}`);
};

export const approveCategory = async (id: number): Promise<void> => {
  await apiClient.put(`/admin/categories/${id}/approve`);
};

export const rejectCategory = async (id: number): Promise<void> => {
  await apiClient.put(`/admin/categories/${id}/reject`);
};
