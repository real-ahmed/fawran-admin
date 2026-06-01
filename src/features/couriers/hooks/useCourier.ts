import { useQuery } from '@tanstack/react-query';
import { getCourier } from '@/services/courierService';

export const useCourier = (id: number) => {
  return useQuery({
    queryKey: ['courier', id],
    queryFn: () => getCourier(id),
    enabled: !!id,
  });
};
