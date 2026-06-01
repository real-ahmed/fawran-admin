import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Money } from '@/components/Money';
import { Badge } from '@/components/ui/badge';
import { Loader2, PackageOpen } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { useVendorItems } from '../hooks/useVendorItems';
import { getLocalizedDisplayName } from '@/utils/displayName';

interface VendorProductsListProps {
  vendorId: number;
}

export const VendorProductsList = ({ vendorId }: VendorProductsListProps) => {
  const { t, i18n } = useTranslation();
  const {
    items,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef
  } = useVendorItems(vendorId);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('image')}</TableHead>
            <TableHead>{t('product_name')}</TableHead>
            <TableHead>{t('price')}</TableHead>
            <TableHead>{t('status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell><div className="h-10 w-10 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-destructive">
                {t('error_loading_products')}
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32">
                <EmptyState icon={PackageOpen} title={t('no_products_found')} description={t('no_products_found_desc')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.master_product?.media ? (
                    <img
                      src={item.master_product.media}
                      alt={item.master_product?.name?.en || 'Product'}
                      className="h-10 w-10 rounded-md object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border">
                      <PackageOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {item.master_product ? getLocalizedDisplayName(item.master_product, i18n.language, item.master_product.name?.en) : t('unknown')}
                </TableCell>
                <TableCell className="font-medium">
                  <Money amount={item.price} />
                </TableCell>
                <TableCell>
                  <Badge variant={item.is_available ? 'default' : 'secondary'}>
                    {item.is_available ? t('available') : t('unavailable')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center border-t p-4 text-muted-foreground">
          {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        </div>
      )}
    </div>
  );
};
