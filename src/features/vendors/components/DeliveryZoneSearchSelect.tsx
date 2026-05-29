import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { fetchDeliveryZones } from '@/services/deliveryZoneService';
import { getNextCursorOrPageParam } from '@/utils/pagination';
import { SearchableSelect } from '@/components/SearchableSelect';
import type { LocalizedText } from '@/utils/localizedText';

interface DeliveryZoneSearchSelectProps {
  value: number;
  onChange: (id: number) => void;
  error?: string;
  className?: string;
}

export function DeliveryZoneSearchSelect({ value, onChange, error, className = '' }: DeliveryZoneSearchSelectProps) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['deliveryZones', 'infinite', searchTerm],
    queryFn: ({ pageParam = null }) => {
      const pageParams =
        typeof pageParam === 'string'
          ? { cursor: pageParam }
          : { page: pageParam || 1 };

      return fetchDeliveryZones({
        search: searchTerm,
        is_active: 1,
        ...pageParams,
      });
    },
    initialPageParam: null as number | string | null,
    getNextPageParam: getNextCursorOrPageParam,
  });

  const { ref: inViewRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const zones = data?.pages.flatMap(page => page.data) || [];
  const selectedZone = zones.find(z => z.id === value);
  
  const getLocalizedName = (nameObj?: LocalizedText | null) => {
    if (!nameObj) return '';
    return nameObj[i18n.language as keyof LocalizedText] || nameObj.en || '';
  };

  const options = zones.map((zone) => ({
    value: String(zone.id),
    label: getLocalizedName(zone.name),
  }));

  if (selectedZone && !options.some((option) => option.value === String(selectedZone.id))) {
    options.unshift({
      value: String(selectedZone.id),
      label: getLocalizedName(selectedZone.name),
    });
  }

  return (
    <SearchableSelect
      value={value ? String(value) : ''}
      options={value && !selectedZone ? [{ value: String(value), label: `${t('delivery_zone')} #${value}` }, ...options] : options}
      onChange={(nextValue) => onChange(Number(nextValue))}
      placeholder={t('select_zone')}
      searchPlaceholder={t('search_delivery_zones')}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={Boolean(hasNextPage)}
      loadMoreRef={inViewRef}
      className={className}
      triggerClassName={error ? 'border-destructive focus:ring-destructive' : undefined}
    />
  );
}
