import apiClient from '@/config/axios';
import { Order, OrdersQuery, OrderStatusCounts, LatLng } from '@/types/order';
import { PaginatedResponse } from '@/types/api';

export const getOrders = async (params?: OrdersQuery): Promise<PaginatedResponse<Order>> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== '')
  );

  const response = await apiClient.get('/admin/orders', { params: cleanParams });
  return response.data;
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await apiClient.get(`/admin/orders/${id}`);
  return response.data.data;
};

export const getOrderStatusCounts = async (params?: { date_from?: string; date_to?: string; vendor_id?: number; courier_id?: number }): Promise<OrderStatusCounts> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== '')
  );

  const response = await apiClient.get('/admin/orders/status-counts', { params: cleanParams });
  return response.data.data;
};

export const updateOrderStatus = async (id: number, status: string): Promise<void> => {
  await apiClient.put(`/admin/orders/${id}/status`, { status });
};

export const assignCourierToOrder = async (orderId: number, courierId: number): Promise<void> => {
  await apiClient.post(`/admin/orders/${orderId}/assign-courier`, { courier_id: courierId });
};

export const cancelOrder = async (id: number): Promise<void> => {
  await apiClient.put(`/admin/orders/${id}/cancel`);
};

export const getDeliveryPath = async (id: number): Promise<LatLng[]> => {
  const response = await apiClient.get(`/admin/orders/${id}/delivery-path`);
  return response.data.data;
};
