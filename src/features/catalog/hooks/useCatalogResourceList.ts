import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { parseApiError } from '@/utils/api';
import type { ActiveFilter, CatalogApprovalStatus, CatalogQuery } from '@/types/catalog';
import type { PaginatedResponse } from '@/types/api';
import { useCatalogRealtime } from './useCatalogRealtime';

interface UseCatalogResourceListParams<TItem> {
  resourceKey: 'brands' | 'categories' | 'master-products';
  approvalStatus: CatalogApprovalStatus;
  fetchItems: (params?: CatalogQuery) => Promise<PaginatedResponse<TItem>>;
  deleteItem: (id: number) => Promise<void>;
  approveItem: (id: number) => Promise<void>;
  rejectItem: (id: number) => Promise<void>;
  categoryId?: number;
  brandId?: number;
}

export const useCatalogResourceList = <TItem extends { id: number }>({
  resourceKey,
  approvalStatus,
  fetchItems,
  deleteItem,
  approveItem,
  rejectItem,
  categoryId,
  brandId,
}: UseCatalogResourceListParams<TItem>) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const queryParams = useMemo<CatalogQuery>(() => ({
    search: debouncedSearch,
    approval_status: approvalStatus,
    is_active: activeFilter === 'all' ? undefined : activeFilter === 'active' ? 1 : 0,
    category_id: categoryId,
    brand_id: brandId,
  }), [activeFilter, approvalStatus, brandId, categoryId, debouncedSearch]);

  const query = useInfiniteQuery({
    queryKey: ['catalog', resourceKey, queryParams],
    queryFn: ({ pageParam = 1 }) => fetchItems({ ...queryParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }

      return undefined;
    },
    initialPageParam: 1,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  useCatalogRealtime(true);

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      toast.success(t('deleted_successfully'));
      queryClient.invalidateQueries({ queryKey: ['catalog', resourceKey] });
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('error_deleting')));
      setDeletingId(null);
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveItem,
    onSuccess: () => {
      toast.success(t('catalog_item_approved'));
      queryClient.invalidateQueries({ queryKey: ['catalog', resourceKey] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('catalog_approval_failed')));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectItem,
    onSuccess: () => {
      toast.success(t('catalog_item_rejected'));
      queryClient.invalidateQueries({ queryKey: ['catalog', resourceKey] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('catalog_rejection_failed')));
    },
  });

  const clearFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
  };

  return {
    items: query.data?.pages.flatMap((page) => page.data) || [],
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMoreRef: ref,
    filters: {
      searchTerm,
      activeFilter,
    },
    setSearchTerm,
    setActiveFilter,
    clearFilters,
    deletingId,
    setDeletingId,
    deleteMutation,
    approveMutation,
    rejectMutation,
  };
};
