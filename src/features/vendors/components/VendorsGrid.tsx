import { type Ref } from 'react';
import { Mail, MapPin, Phone, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionMenu } from '@/components/ActionMenu';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { getLocalizedDisplayName } from '@/utils/displayName';
import { VendorType, type Vendor } from '@/types/vendor';

interface VendorsGridProps {
  vendors: Vendor[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  loadMoreRef: Ref<HTMLDivElement>;
  canUpdate: boolean;
  canDelete: boolean;
  onCreate?: () => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: number) => void;
  onView?: (vendor: Vendor) => void;
}

const getTypeBadgeColor = (type: VendorType) => {
  switch (type) {
    case VendorType.RESTAURANT:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case VendorType.PHARMACY:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case VendorType.GROCERY:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const VendorsGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="h-48 rounded-lg border border-border/60 bg-card p-6 animate-pulse" />
    ))}
  </div>
);

export const VendorsGrid = ({
  vendors,
  isLoading,
  isError,
  isFetchingNextPage,
  loadMoreRef,
  canUpdate,
  canDelete,
  onCreate,
  onEdit,
  onDelete,
  onView,
}: VendorsGridProps) => {
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return <VendorsGridSkeleton />;
  }

  if (isError) {
    return <div className="py-10 text-center text-destructive">{t('error_loading_vendors')}</div>;
  }

  if (vendors.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title={t('no_vendors_found')}
        description={t('no_vendors_found_desc')}
        actionLabel={onCreate ? t('add_vendor') : undefined}
        onAction={onCreate}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="group relative flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-all hover:border-primary/20 hover:shadow-md">
            <div className="flex-1 space-y-4 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="line-clamp-1 text-base font-semibold">
                      {getLocalizedDisplayName(vendor, i18n.language, vendor.name?.en)}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTypeBadgeColor(vendor.type)}`}>
                        {t(`vendor_type_${vendor.type}`)}
                      </span>
                      <Badge variant={vendor.is_active ? 'default' : 'secondary'} className="px-1.5 py-0 text-[10px]">
                        {vendor.is_active ? t('active') : t('inactive')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <ActionMenu
                  onEdit={() => onEdit(vendor)}
                  onDelete={() => onDelete(vendor.id)}
                  onView={onView ? () => onView(vendor) : undefined}
                  showEdit={canUpdate}
                  showDelete={canDelete}
                  showView={!!onView}
                />
              </div>

              <div className="space-y-2 pt-2 text-sm text-muted-foreground">
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
                  <span dir="ltr">{vendor.phone}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFetchingNextPage && <VendorsGridSkeleton count={3} />}
      <div ref={loadMoreRef} className="h-4 w-full" />
    </>
  );
};
