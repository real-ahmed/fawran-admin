import type { AppNotification, NotificationData } from '@/types/notification';

const toRecord = (value: unknown): Record<string, unknown> | null => {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
};

const readString = (record: Record<string, unknown>, key: string, fallback = '') => {
  const value = record[key];
  return typeof value === 'string' ? value : fallback;
};

export const countUnreadNotifications = (notifications: AppNotification[]) => {
  return notifications.filter((notification) => notification.read_at === null).length;
};

export const appendUniqueNotifications = (
  current: AppNotification[],
  incoming: AppNotification[]
) => {
  const existingIds = new Set(current.map((notification) => notification.id));
  const uniqueIncoming = incoming.filter((notification) => !existingIds.has(notification.id));

  return [...current, ...uniqueIncoming];
};

export const prependNotificationIfMissing = (
  current: AppNotification[],
  notification: AppNotification
) => {
  if (current.some((item) => item.id === notification.id)) {
    return current;
  }

  return [notification, ...current];
};

export const notificationFromBroadcast = (
  payload: unknown,
  adminId: number
): AppNotification | null => {
  const notification = toRecord(payload);
  if (!notification) return null;

  const id = readString(notification, 'id');
  if (!id) return null;

  const dataSource = toRecord(notification.data) ?? notification;
  const data: NotificationData = {
    ...dataSource,
    title: readString(dataSource, 'title'),
    body: readString(dataSource, 'body'),
    type: readString(dataSource, 'type', readString(notification, 'type')),
  };
  const now = new Date().toISOString();

  return {
    id,
    type: readString(notification, 'type', data.type || 'notification'),
    notifiable_type: readString(notification, 'notifiable_type', 'App\\Models\\Admin'),
    notifiable_id: typeof notification.notifiable_id === 'number' ? notification.notifiable_id : adminId,
    data,
    read_at: typeof notification.read_at === 'string' ? notification.read_at : null,
    created_at: readString(notification, 'created_at', now),
    updated_at: readString(notification, 'updated_at', now),
  };
};
