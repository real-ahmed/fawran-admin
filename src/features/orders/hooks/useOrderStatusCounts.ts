import { useQuery } from '@tanstack/react-query';
import { getOrderStatusCounts } from '@/services/ordersService';

export const useOrderStatusCounts = (params?: { date_from?: string; date_to?: string; vendor_id?: number; courier_id?: number }) => {
  return useQuery({
    queryKey: ['orders', 'status-counts', params],
    queryFn: () => getOrderStatusCounts(params),
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });
};
