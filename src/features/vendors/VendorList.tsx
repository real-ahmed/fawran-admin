import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { useVendorsList } from './hooks/useVendorsList';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';
import { VendorsToolbar } from './components/VendorsToolbar';
import { VendorsGrid } from './components/VendorsGrid';
import type { Vendor } from '@/types/vendor';
import { useHasPermission } from '@/hooks/useHasPermission';

export const VendorList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canCreateVendor = useHasPermission(PERMISSIONS.CREATE_VENDORS);
  const canUpdateVendor = useHasPermission(PERMISSIONS.UPDATE_VENDORS);
  const canDeleteVendor = useHasPermission(PERMISSIONS.DELETE_VENDORS);
  const {
    vendors,
    isLoading,
    isError,
    isFetchingNextPage,
    loadMoreRef,
    filters,
    setSearchTerm,
    setTypeFilter,
    deletingId,
    setDeletingId,
    deleteMutation,
  } = useVendorsList();

  const handleCreate = () => {
    navigate('/vendors/create');
  };

  const handleEdit = (vendor: Vendor) => {
    navigate(`/vendors/${vendor.id}/edit`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('vendors')}
        description={t('vendors_description')}
      >
        <Can permission={PERMISSIONS.CREATE_VENDORS}>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('add_vendor')}
          </Button>
        </Can>
      </PageHeader>

      <VendorsToolbar
        searchTerm={filters.searchTerm}
        typeFilter={filters.typeFilter}
        onSearchChange={setSearchTerm}
        onTypeChange={setTypeFilter}
      />
      <VendorsGrid
        vendors={vendors}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        loadMoreRef={loadMoreRef}
        canUpdate={canUpdateVendor}
        canDelete={canDeleteVendor}
        onCreate={canCreateVendor ? handleCreate : undefined}
        onEdit={handleEdit}
        onDelete={setDeletingId}
        onView={(vendor) => navigate(`/vendors/${vendor.id}`)}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId !== null && deleteMutation.mutate(deletingId)}
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
