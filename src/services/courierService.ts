import apiClient from '@/config/axios';
import { Courier, CouriersQuery } from '@/types/courier';
import { PaginatedResponse } from '@/types/api';

export const getCouriers = async (params?: CouriersQuery): Promise<PaginatedResponse<Courier>> => {
  const response = await apiClient.get('/admin/couriers', { params });
  return response.data;
};

export const getCourier = async (id: number): Promise<Courier> => {
  const response = await apiClient.get(`/admin/couriers/${id}`);
  return response.data.data;
};

export const approveCourier = async (id: number): Promise<void> => {
  await apiClient.put(`/admin/couriers/${id}/approve`);
};

export const rejectCourier = async (id: number): Promise<void> => {
  await apiClient.put(`/admin/couriers/${id}/reject`);
};

export const getCourierLocation = async (id: number): Promise<{ latitude: number; longitude: number; located_at: string }> => {
  const response = await apiClient.get(`/admin/couriers/${id}/location`);
  return response.data.data;
};
