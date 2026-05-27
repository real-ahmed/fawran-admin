import { useState, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { fetchDeliveryZones } from '@/services/deliveryZoneService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DeliveryZoneSearchSelectProps {
  value: number;
  onChange: (id: number) => void;
  error?: string;
  className?: string;
}

export function DeliveryZoneSearchSelect({ value, onChange, error, className = '' }: DeliveryZoneSearchSelectProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple click away handling since we might not have the hook
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['deliveryZones', 'infinite', searchTerm],
    queryFn: ({ pageParam = null }) => fetchDeliveryZones({ search: searchTerm, cursor: pageParam as string | null, per_page: 15, is_active: 1 }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: any) => {
      // Handle both cursor and standard pagination meta formats defensively
      if (lastPage.meta?.next_cursor) {
        return lastPage.meta.next_cursor;
      }
      return undefined;
    },
  });

  const { ref: inViewRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Flatten pages into a single array
  const zones = data?.pages.flatMap(page => page.data) || [];
  const selectedZone = zones.find(z => z.id === value);

  // If a zone is selected but not in the current search results (e.g. initial load), we might want to fetch it individually, but for now we'll just display its ID or wait for it to load.
  // We'll display "Selected Zone" if we have a value but haven't found it in the list yet.
  
  const getLocalizedName = (nameObj: any) => {
    if (!nameObj) return '';
    return nameObj[i18n.language] || nameObj.en || '';
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={`w-full justify-between font-normal bg-background ${!value ? 'text-muted-foreground' : ''} ${error ? 'border-destructive focus:ring-destructive' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {value
          ? selectedZone 
            ? getLocalizedName(selectedZone.name) 
            : `${t('delivery_zone')} #${value}`
          : t('select_zone')}
        <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md outline-none animate-in fade-in-80 zoom-in-95">
          <div className="flex items-center border-b px-3">
            <Input 
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none shadow-none focus-visible:ring-0 px-0"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto p-1">
            {isLoading && zones.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('loading')}
              </div>
            ) : zones.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t('no_results_found')}
              </div>
            ) : (
              <div className="flex flex-col">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 ps-8 pe-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${value === zone.id ? 'bg-accent/50 text-accent-foreground' : ''}`}
                    onClick={() => {
                      onChange(zone.id);
                      setOpen(false);
                    }}
                  >
                    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
                      {value === zone.id && <Check className="h-4 w-4" />}
                    </span>
                    {getLocalizedName(zone.name)}
                  </div>
                ))}
                
                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <div ref={inViewRef} className="py-4 flex justify-center text-muted-foreground">
                    {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
