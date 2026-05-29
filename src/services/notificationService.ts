import apiClient from '@/config/axios';
import type { AppNotification, FetchNotificationsParams, NotificationPage } from '@/types/notification';
import { getNextCursorOrPageParam } from '@/utils/pagination';

const unwrapPaginator = (response: unknown): unknown => {
  const wrapped = response as { data?: unknown };

  if (wrapped.data && !Array.isArray(wrapped.data)) {
    const nested = wrapped.data as { data?: unknown };
    if (Array.isArray(nested.data)) {
      return wrapped.data;
    }
  }

  return response;
};

const getNotificationItems = (response: unknown): AppNotification[] => {
  const paginator = unwrapPaginator(response) as { data?: unknown };
  return Array.isArray(paginator.data) ? (paginator.data as AppNotification[]) : [];
};

const getUnreadCount = (response: unknown): number => {
  const paginator = unwrapPaginator(response) as { meta?: { total?: unknown } };
  const total = Number(paginator.meta?.total);

  return Number.isFinite(total) ? total : getNotificationItems(response).length;
};

const normalizeNotificationPage = (response: unknown): NotificationPage => {
  const paginator = unwrapPaginator(response);

  return {
    notifications: getNotificationItems(response),
    nextCursor: getNextCursorOrPageParam(paginator as Parameters<typeof getNextCursorOrPageParam>[0]) ?? null,
  };
};

export const fetchNotifications = async (params?: FetchNotificationsParams): Promise<NotificationPage> => {
  const res = await apiClient.get('/admin/notifications', { params });
  return normalizeNotificationPage(res.data);
};

export const fetchUnreadNotificationCount = async (): Promise<number> => {
  const res = await apiClient.get('/admin/notifications/unread');
  return getUnreadCount(res.data);
};

export const markNotificationsAsRead = async (id?: string): Promise<void> => {
  await apiClient.post('/admin/notifications/mark-as-read', id ? { id } : {});
};
