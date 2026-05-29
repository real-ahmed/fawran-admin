import { useEffect } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import echo, { setEchoAuthToken } from '@/config/echo';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { notificationFromBroadcast } from '@/utils/notifications';

const REALTIME_QUERY_KEYS = [
  ['dashboard-metrics'],
  ['dashboard-pending'],
  ['orders'],
  ['couriers'],
  ['vendors'],
  ['catalog'],
] as const;

const invalidateRealtimeQueries = (queryClient: QueryClient) => {
  REALTIME_QUERY_KEYS.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
};

const getEventMessage = (event: unknown) => {
  if (!event || typeof event !== 'object') return undefined;

  const message = (event as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
};

const getEventOrderId = (event: unknown) => {
  if (!event || typeof event !== 'object') return undefined;

  const orderId = (event as { order_id?: unknown }).order_id;
  return typeof orderId === 'number' || typeof orderId === 'string' ? Number(orderId) : undefined;
};

export const useGlobalNotifications = () => {
  const fetchInitial = useNotificationStore(state => state.fetchInitial);
  const addNotification = useNotificationStore(state => state.addNotification);
  const userId = useAuthStore(state => state.user?.id);
  const token = useAuthStore(state => state.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !token) return;

    setEchoAuthToken(token);
    fetchInitial();

    const channelName = `admin.${userId}`;
    const channel = echo.private(channelName);

    const handleUpdate = (message?: string) => {
      fetchInitial();
      invalidateRealtimeQueries(queryClient);

      if (message) {
        toast.info(message);
      }
    };

    channel.notification((payload: unknown) => {
      const notification = notificationFromBroadcast(payload, userId);
      if (notification) {
        addNotification(notification);
      }

      handleUpdate();
    });

    channel.listen('NewOrderCreated', (event: unknown) => handleUpdate(getEventMessage(event)));
    channel.listen('OrderStatusChanged', (event: unknown) => {
      handleUpdate(getEventMessage(event));

      const orderId = getEventOrderId(event);
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      }
    });
    channel.listen('CourierApplicationSubmitted', (event: unknown) => handleUpdate(getEventMessage(event)));
    channel.listen('.BrandSubmitted', (event: unknown) => handleUpdate(getEventMessage(event)));
    channel.listen('.CategorySubmitted', (event: unknown) => handleUpdate(getEventMessage(event)));
    channel.listen('.MasterProductSubmitted', (event: unknown) => handleUpdate(getEventMessage(event)));

    return () => {
      channel.stopListening('NewOrderCreated');
      channel.stopListening('OrderStatusChanged');
      channel.stopListening('CourierApplicationSubmitted');
      channel.stopListening('.BrandSubmitted');
      channel.stopListening('.CategorySubmitted');
      channel.stopListening('.MasterProductSubmitted');
      echo.leave(channelName);
    };
  }, [addNotification, fetchInitial, queryClient, token, userId]);
};
