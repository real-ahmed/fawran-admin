import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { fetchDeliveryZones, deleteDeliveryZone } from '@/services/deliveryZoneService';
import { useDebounce } from '@/hooks/useDebounce';

export const useDeliveryZonesList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { ref: loadMoreRef, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['delivery-zones', debouncedSearch],
    queryFn: ({ pageParam = 1 }) =>
      fetchDeliveryZones({
        page: pageParam,
        search: debouncedSearch,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeliveryZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
      toast.success(t('deleted_successfully'));
      setDeletingId(null);
    },
    onError: () => {
      toast.error(t('error_deleting'));
      setDeletingId(null);
    },
  });

  // Fetch next page when load more element is in view
  if (inView && hasNextPage) {
    fetchNextPage();
  }

  const zones = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    zones,
    isLoading,
    hasNextPage,
    loadMoreRef,
    searchTerm,
    setSearchTerm,
    deletingId,
    setDeletingId,
    deleteMutation,
  };
};
