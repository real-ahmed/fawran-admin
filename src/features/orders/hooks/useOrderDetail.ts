import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/services/ordersService';
import { OrderStatus } from '@/types/enums';

export const useOrderDetail = (id: number) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const order = query.state?.data;
      if (!order) return false;
      
      // If the order is active, poll every 10 seconds for live courier tracking
      if (order.status === OrderStatus.Processing || order.status === OrderStatus.OutForDelivery) {
        return 10000;
      }
      return false;
    },
  });
};

