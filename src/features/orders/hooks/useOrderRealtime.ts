import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import echo from '@/config/echo';

export const useOrderRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // We already have echo instance configured.
    // However, the channel name is specific to the admin user.
    // The auth store token has the user ID in the JWT, but Echo handles the auth endpoint.
    // Let's get the admin ID from the localStorage auth state to listen to the private channel.
    
    let adminId: number | null = null;
    try {
      const storage = localStorage.getItem('fawran-auth-storage');
      if (storage) {
        const parsed = JSON.parse(storage);
        adminId = parsed?.state?.user?.id;
      }
    } catch (e) {
      // ignore
    }

    if (!adminId) return;

    const channelName = `admin.${adminId}`;
    const channel = echo.private(channelName);

    // OrderStatusChanged triggers list refetch and specific detail refetch
    channel.listen('OrderStatusChanged', (e: any) => {
      // Refetch lists
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Refetch specific order
      if (e.order_id) {
        queryClient.invalidateQueries({ queryKey: ['orders', e.order_id] });
      }
    });

    return () => {
      channel.stopListening('OrderStatusChanged');
      // If we don't have other events on this channel, we could leave it
      // But typically Echo manages channel subscriptions cleanly.
    };
  }, [queryClient]);
};
