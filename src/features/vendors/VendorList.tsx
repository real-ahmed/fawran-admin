import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Store, Settings, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { VendorType, VendorStatus } from '@/types/vendor';
import { useVendorsList } from './hooks/useVendorsList';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { useInView } from 'react-intersection-observer';
import { deleteVendor } from '@/services/vendorService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseApiError } from '@/utils/api';
import { ActionMenu } from '@/components/ActionMenu';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { getLocalizedDisplayName } from '@/utils/displayName';
import { Badge } from '@/components/ui/badge';

const ALL_FILTER_VALUE = 'all';

export const VendorList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<typeof ALL_FILTER_VALUE | VendorType>(ALL_FILTER_VALUE);

  const { ref, inView } = useInView();
  
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useVendorsList({
    search: searchTerm,
    type: typeFilter,
  });

  const vendors = data?.pages.flatMap(page => page.data) || [];

  const [vendorToDelete, setVendorToDelete] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVendor(id),
    onSuccess: () => {
      toast.success(t('deleted_successfully'));
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setVendorToDelete(null);
    },
    onError: (err) => {
      toast.error(parseApiError(err, t('delete_failed')));
      setVendorToDelete(null);
    }
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getTypeBadgeColor = (type: VendorType) => {
    switch (type) {
      case VendorType.RESTAURANT: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case VendorType.PHARMACY: return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case VendorType.GROCERY: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('vendors')}
        description={t('vendors_description')}
      >
        <Button onClick={() => navigate('/vendors/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('add_vendor')}
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search_vendors')}
            className="ps-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 w-full sm:w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof ALL_FILTER_VALUE | VendorType)}
        >
          <option value={ALL_FILTER_VALUE}>{t('all_types')}</option>
          {Object.values(VendorType).map((type) => (
            <option key={type} value={type}>{t(`vendor_type_${type}`)}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-destructive">{t('error_loading_vendors')}</div>
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title={t('no_vendors_found')}
          description={t('no_vendors_found_desc')}
          actionLabel={t('add_vendor')}
          onAction={() => navigate('/vendors/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map(vendor => (
            <div key={vendor.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-all hover:shadow-md hover:border-primary/20 flex flex-col">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base line-clamp-1">
                        {getLocalizedDisplayName(vendor, i18n.language, vendor.name?.en)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadgeColor(vendor.type)}`}>
                          {t(`vendor_type_${vendor.type}`)}
                        </span>
                        <Badge variant={vendor.is_active ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          {vendor.is_active ? t('active') : t('inactive')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ActionMenu
                    onEdit={() => navigate(`/vendors/${vendor.id}/edit`)}
                    onDelete={() => setVendorToDelete(vendor.id)}
                  />
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{vendor.formatted_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFetchingNextPage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-6 h-48 animate-pulse" />
          ))}
        </div>
      )}
      
      <div ref={ref} className="h-4 w-full" />

      <ConfirmDialog
        isOpen={vendorToDelete !== null}
        onClose={() => setVendorToDelete(null)}
        onConfirm={() => vendorToDelete !== null && deleteMutation.mutate(vendorToDelete)}
        title={t('delete_vendor')}
        description={t('delete_vendor_desc')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
