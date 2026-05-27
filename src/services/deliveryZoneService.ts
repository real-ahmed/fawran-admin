import apiClient from '@/config/axios';
import type { PaginatedResponse } from '@/types/api';
import type { DeliveryZone, CreateDeliveryZonePayload, UpdateDeliveryZonePayload } from '@/types/delivery-zone';

export interface FetchDeliveryZonesParams {
  search?: string;
  is_active?: boolean | string;
  page?: number;
  per_page?: number;
}

export const fetchDeliveryZones = async (params?: FetchDeliveryZonesParams): Promise<PaginatedResponse<DeliveryZone>> => {
  const cleanParams = { ...params };
  if (cleanParams.search === '') {
    delete cleanParams.search;
  }
  const res = await apiClient.get('/admin/delivery-zones', { params: cleanParams });
  return res.data;
};

export const getDeliveryZone = async (id: number | string): Promise<DeliveryZone> => {
  const res = await apiClient.get(`/admin/delivery-zones/${id}`);
  return res.data.data;
};

export const createDeliveryZone = async (data: CreateDeliveryZonePayload): Promise<DeliveryZone> => {
  const res = await apiClient.post('/admin/delivery-zones', data);
  return res.data.data;
};

export const updateDeliveryZone = async (id: number | string, data: UpdateDeliveryZonePayload): Promise<DeliveryZone> => {
  const res = await apiClient.put(`/admin/delivery-zones/${id}`, data);
  return res.data.data;
};

export const deleteDeliveryZone = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/admin/delivery-zones/${id}`);
};
