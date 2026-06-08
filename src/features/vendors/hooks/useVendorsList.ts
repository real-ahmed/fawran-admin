import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteVendor, fetchVendors } from '@/services/vendorService';
import type { VendorType } from '@/types/vendor';
import { useDebounce } from '@/hooks/useDebounce';
import { getNextCursorOrPageParam } from '@/utils/pagination';
import { parseApiError } from '@/utils/api';

const ALL_FILTER_VALUE = 'all';

export type VendorTypeFilter = typeof ALL_FILTER_VALUE | VendorType;

export interface VendorFilters {
  searchTerm: string;
  typeFilter: VendorTypeFilter;
}

export const useVendorsList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { ref: loadMoreRef, inView } = useInView();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<VendorTypeFilter>(ALL_FILTER_VALUE);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      type: typeFilter !== ALL_FILTER_VALUE ? typeFilter : undefined,
    }),
    [debouncedSearch, typeFilter]
  );

  const vendorsQuery = useInfiniteQuery({
    queryKey: ['vendors', queryParams],
    queryFn: async ({ pageParam = null }) => {
      return fetchVendors({
        cursor: pageParam ? String(pageParam) : null,
        ...queryParams,
      });
    },
    getNextPageParam: getNextCursorOrPageParam,
    initialPageParam: null as string | null,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = vendorsQuery;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVendor(id),
    onSuccess: () => {
      toast.success(t('deleted_successfully'));
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('delete_failed')));
      setDeletingId(null);
    },
  });

  return {
    vendors: vendorsQuery.data?.pages.flatMap((page) => page.data) || [],
    isLoading: vendorsQuery.isLoading,
    isError: vendorsQuery.isError,
    hasNextPage: vendorsQuery.hasNextPage,
    isFetchingNextPage: vendorsQuery.isFetchingNextPage,
    loadMoreRef,
    filters: {
      searchTerm,
      typeFilter,
    },
    setSearchTerm,
    setTypeFilter,
    deletingId,
    setDeletingId,
    deleteMutation,
  };
};
