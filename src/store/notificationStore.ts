import { create } from 'zustand';
import { 
  fetchNotifications, 
  fetchUnreadNotifications, 
  markAsRead, 
  AppNotification 
} from '@/services/notificationService';
import { getNextCursorOrPageParam } from '@/utils/pagination';

type NotificationPageParam = string | number | null;

const unwrapPaginator = (response: unknown): any => {
  const maybeWrapped = response as { data?: unknown };

  if (maybeWrapped.data && !Array.isArray(maybeWrapped.data)) {
    const nested = maybeWrapped.data as { data?: unknown };
    if (Array.isArray(nested.data)) {
      return maybeWrapped.data;
    }
  }

  return response;
};

const getNotificationItems = (response: unknown): AppNotification[] => {
  const paginator = unwrapPaginator(response);

  if (Array.isArray(paginator?.data)) {
    return paginator.data;
  }

  return [];
};

const getNextNotificationPageParam = (response: unknown): Exclude<NotificationPageParam, null> | null => {
  const paginator = unwrapPaginator(response);
  return getNextCursorOrPageParam(paginator) ?? null;
};

const getUnreadCount = (response: unknown): number => {
  const paginator = unwrapPaginator(response);
  return Number(paginator?.meta?.total) || getNotificationItems(response).length;
};

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  cursor: NotificationPageParam;

  // Actions
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
      // Fetch recent notifications
      const res = await fetchNotifications();
      
      // Laravel wrapped response format: res.data contains the paginator, which contains the data array
      const unreadRes = await fetchUnreadNotifications();
      const notificationsData = getNotificationItems(res);
      const unreadCount = getUnreadCount(unreadRes);
      const nextCursor = getNextNotificationPageParam(res);

      set({ 
        notifications: notificationsData,
        unreadCount: unreadCount,
        cursor: nextCursor,
        isLoading: false 
      });
      
      // Let's ensure unreadCount is calculated properly. Since we cursorPaginate, we might not get total.
      // We will count unread in the current list, but if there are more, we might miss them.
      // For now, let's just count from what we loaded or rely on a specific endpoint if needed.
      const unreadsInList = notificationsData.filter((n: AppNotification) => n.read_at === null).length;
      set((state) => ({ unreadCount: Math.max(state.unreadCount, unreadsInList) }));

    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchMore: async () => {
    const { cursor, isLoading } = get();
    if (!cursor || isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const params = typeof cursor === 'number' ? { page: cursor } : { cursor };
      const res = await fetchNotifications(params);
      const moreData = getNotificationItems(res);
      const nextCursor = getNextNotificationPageParam(res);

      set((state) => {
        const uniqueMore = moreData.filter((newItem: AppNotification) => 
          !state.notifications.some(existing => existing.id === newItem.id)
        );
        return {
          notifications: [...state.notifications, ...uniqueMore],
          cursor: nextCursor,
          isLoading: false
        };
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  markAsRead: async (id?: string) => {
    try {
      await markAsRead(id);
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
      if (state.notifications.some(n => n.id === notification.id)) return state;
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    });
  }
}));
