import { create } from 'zustand';
import { 
  fetchNotifications, 
  fetchUnreadNotificationCount,
  markNotificationsAsRead,
} from '@/services/notificationService';
import type { AppNotification, NotificationPageParam } from '@/types/notification';
import {
  appendUniqueNotifications,
  countUnreadNotifications,
  prependNotificationIfMissing,
} from '@/utils/notifications';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Failed to load notifications';
};

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  cursor: NotificationPageParam;

  fetchInitial: () => Promise<void>;
  fetchMore: () => Promise<void>;
  markAsRead: (id?: string) => Promise<void>;
  addNotification: (notification: AppNotification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  cursor: null,

  fetchInitial: async () => {
    set({ isLoading: true, error: null });
    try {
      const [page, unreadCount] = await Promise.all([
        fetchNotifications(),
        fetchUnreadNotificationCount(),
      ]);
      const unreadCountFromCurrentPage = countUnreadNotifications(page.notifications);

      set({ 
        notifications: page.notifications,
        unreadCount: Math.max(unreadCount, unreadCountFromCurrentPage),
        cursor: page.nextCursor,
        isLoading: false 
      });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  fetchMore: async () => {
    const { cursor, isLoading } = get();
    if (!cursor || isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const params = typeof cursor === 'number' ? { page: cursor } : { cursor };
      const page = await fetchNotifications(params);

      set((state) => ({
        notifications: appendUniqueNotifications(state.notifications, page.notifications),
        cursor: page.nextCursor,
        isLoading: false
      }));
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  markAsRead: async (id?: string) => {
    try {
      await markNotificationsAsRead(id);
      if (id) {
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      } else {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read_at: new Date().toISOString() })),
          unreadCount: 0
        }));
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  },

  addNotification: (notification: AppNotification) => {
    set((state) => {
      const notifications = prependNotificationIfMissing(state.notifications, notification);

      if (notifications === state.notifications) {
        return state;
      }

      return {
        notifications,
        unreadCount: state.unreadCount + 1
      };
    });
  }
}));
