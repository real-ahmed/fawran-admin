import apiClient from '@/config/axios';
import { PaginatedResponse } from '@/types/api';
import type { Brand, BrandPayload, CatalogQuery } from '@/types/catalog';
import { cleanCatalogQuery, toCatalogFormData } from './shared';

export const getBrands = async (params?: CatalogQuery): Promise<PaginatedResponse<Brand>> => {
  const response = await apiClient.get('/admin/brands', { params: cleanCatalogQuery(params) });
  return response.data;
};

export const getBrand = async (id: number): Promise<Brand> => {
  const response = await apiClient.get(`/admin/brands/${id}`);
  return response.data.data;
};

export const createBrand = async (payload: BrandPayload): Promise<Brand> => {
  const response = await apiClient.post('/admin/brands', toCatalogFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const updateBrand = async (id: number, payload: BrandPayload): Promise<Brand> => {
  const response = await apiClient.post(`/admin/brands/${id}`, toCatalogFormData(payload, true), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const deleteBrand = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/brands/${id}`);
};

export const approveBrand = async (id: number): Promise<void> => {
  await apiClient.put(`/admin/brands/${id}/approve`);
};

export const rejectBrand = async (id: number): Promise<void> => {
  await apiClient.put(`/admin/brands/${id}/reject`);
};
