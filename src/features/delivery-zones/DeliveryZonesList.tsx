import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useDeliveryZonesList } from '@/features/delivery-zones/hooks/useDeliveryZonesList';
import { DeliveryZonesTable } from '@/features/delivery-zones/components/DeliveryZonesTable';
import { DeliveryZonesToolbar } from '@/features/delivery-zones/components/DeliveryZonesToolbar';
import type { DeliveryZone } from '@/types/delivery-zone';

export const DeliveryZonesList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

      <DeliveryZonesToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <DeliveryZonesTable
        zones={zones}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isDeleting={deleteMutation.isPending}
        loadMoreRef={loadMoreRef}
        onEdit={handleEdit}
        onDelete={setDeletingId}
      />

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
