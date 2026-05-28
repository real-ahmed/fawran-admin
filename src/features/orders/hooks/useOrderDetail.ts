import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/services/ordersService';

export const useOrderDetail = (id: number) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
};
