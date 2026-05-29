export type NotificationPageParam = string | number | null;

export interface NotificationData {
  title?: string;
  body?: string;
  message?: string;
  type?: string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchNotificationsParams {
  page?: number;
  cursor?: string;
}

export interface NotificationPage {
  notifications: AppNotification[];
  nextCursor: Exclude<NotificationPageParam, null> | null;
}
