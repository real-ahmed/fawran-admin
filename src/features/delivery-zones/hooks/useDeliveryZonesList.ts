import { useState, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { fetchDeliveryZones, deleteDeliveryZone } from '@/services/deliveryZoneService';
import { useDebounce } from '@/hooks/useDebounce';
import { getNextCursorOrPageParam } from '@/utils/pagination';

export const useDeliveryZonesList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { ref: loadMoreRef, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['delivery-zones', debouncedSearch],
    queryFn: ({ pageParam = null }) =>
      fetchDeliveryZones({
        cursor: pageParam ? String(pageParam) : null,
        search: debouncedSearch,
      }),
    getNextPageParam: getNextCursorOrPageParam,
    initialPageParam: null as string | null,
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
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const zones = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    zones,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef,
    searchTerm,
    setSearchTerm,
    deletingId,
    setDeletingId,
    deleteMutation,
  };
};
