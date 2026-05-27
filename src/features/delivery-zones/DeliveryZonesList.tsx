import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useDeliveryZonesList } from '@/features/delivery-zones/hooks/useDeliveryZonesList';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { DeliveryZone } from '@/types/delivery-zone';

export const DeliveryZonesList = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    zones,
    isLoading,
    hasNextPage,
    loadMoreRef,
    searchTerm,
    setSearchTerm,
    deletingId,
    setDeletingId,
    deleteMutation,
  } = useDeliveryZonesList();

  const handleEdit = (zone: DeliveryZone) => {
    navigate(`/delivery-zones/${zone.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/delivery-zones/create');
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className="space-y-6">
      <PageHeader title={t('delivery_zones')} description={t('delivery_zones_desc')}>
        <Can permission={PERMISSIONS.CREATE_DELIVERY_ZONES}>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('create_delivery_zone')}
          </Button>
        </Can>
      </PageHeader>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rtl:pl-3 rtl:pr-9"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">#</th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">{t('name')}</th>
                <th className="h-12 px-4 text-start align-middle font-medium text-muted-foreground">{t('status')}</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading && zones.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    {t('no_results')}
                  </td>
                </tr>
              ) : (
                zones.map((zone) => (
                  <tr key={zone.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{zone.id}</td>
                    <td className="p-4 align-middle">
                      {isRtl ? (zone.name as any).ar : (zone.name as any).en}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                        {zone.is_active ? t('active') : t('inactive')}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <Can permission={PERMISSIONS.UPDATE_DELIVERY_ZONES}>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(zone as any)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Can>
                        <Can permission={PERMISSIONS.DELETE_DELIVERY_ZONES}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingId(zone.id as any)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        isLoading={deleteMutation.isPending}
        title={t('delete_delivery_zone')}
        description={t('delete_delivery_zone_desc')}
      />
    </div>
  );
};
