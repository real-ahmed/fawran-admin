import apiClient from '@/config/axios';
import { PaginatedResponse } from '@/types/api';

export interface AppNotification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    title: string;
    body: string;
    type: string;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchNotificationsParams {
  page?: number;
  cursor?: string;
}

export const fetchNotifications = async (params?: FetchNotificationsParams): Promise<PaginatedResponse<AppNotification>> => {
  const res = await apiClient.get('/admin/notifications', { params });
  return res.data;
};

export const fetchUnreadNotifications = async (params?: FetchNotificationsParams): Promise<PaginatedResponse<AppNotification>> => {
  const res = await apiClient.get('/admin/notifications/unread', { params });
  return res.data;
};

export const markAsRead = async (id?: string): Promise<void> => {
  await apiClient.post('/admin/notifications/mark-as-read', { id });
};
