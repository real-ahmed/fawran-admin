import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Can } from '@/components/Can';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PERMISSIONS } from '@/config/permissions';
import {
  approveBrand,
  deleteBrand,
  getBrands,
  rejectBrand,
} from '@/services/catalog/brandService';
import type { Brand, CatalogApprovalStatus } from '@/types/catalog';
import { useCatalogResourceList } from './hooks/useCatalogResourceList';
import { CatalogToolbar } from './components/CatalogToolbar';
import { CatalogTable, type CatalogTableColumn } from './components/CatalogTable';
import { BrandFormDialog } from './components/BrandFormDialog';
import { localizedName } from './utils';

export const BrandsPage = () => {
  const { t, i18n } = useTranslation();
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<CatalogApprovalStatus>('pending');
  const {
    items,
    isLoading,
    isError,
    hasNextPage,
    loadMoreRef,
    filters,
    setSearchTerm,
    setActiveFilter,
    clearFilters,
    deletingId,
    setDeletingId,
    deleteMutation,
    approveMutation,
    rejectMutation,
  } = useCatalogResourceList({
    resourceKey: 'brands',
    approvalStatus,
    fetchItems: getBrands,
    deleteItem: deleteBrand,
    approveItem: approveBrand,
    rejectItem: rejectBrand,
  });

  const columns = useMemo<CatalogTableColumn<Brand>[]>(() => [
    {
      key: 'name',
      header: t('brand_name'),
      render: (brand) => <span className="font-medium">{localizedName(brand.name, i18n.language)}</span>,
    },
  ], [i18n.language, t]);

  const openCreateForm = () => {
    setEditingBrand(null);
    setIsFormOpen(true);
  };

  const openEditForm = (brand: Brand) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('brands')} description={t('brands_desc')}>
        <Can permission={PERMISSIONS.CREATE_BRANDS}>
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('create_brand')}
          </Button>
        </Can>
      </PageHeader>

      <Tabs value={approvalStatus} onValueChange={(value) => setApprovalStatus(value as CatalogApprovalStatus)} className="w-full" dir={i18n.dir()}>
        <TabsList className="grid w-full max-w-[540px] grid-cols-3 p-1 bg-muted/50 rounded-lg mb-6">
          <TabsTrigger value="pending" className="py-2.5 rounded-md">{t('pending')}</TabsTrigger>
          <TabsTrigger value="approved" className="py-2.5 rounded-md">{t('approved')}</TabsTrigger>
          <TabsTrigger value="rejected" className="py-2.5 rounded-md">{t('rejected')}</TabsTrigger>
        </TabsList>

        <TabsContent value={approvalStatus} className="mt-0 outline-none">
          <div className="space-y-6">
            <CatalogToolbar
              searchTerm={filters.searchTerm}
              activeFilter={filters.activeFilter}
              searchPlaceholder={t('search_brands')}
              onSearchChange={setSearchTerm}
              onActiveChange={setActiveFilter}
              onClearFilters={clearFilters}
            />

            {isError ? (
              <div className="py-10 text-center text-destructive">{t('error_loading_brands')}</div>
            ) : (
              <CatalogTable
                items={items}
                columns={columns}
                isLoading={isLoading}
                approvalStatus={approvalStatus}
                hasNextPage={hasNextPage}
                isDeleting={deleteMutation.isPending}
                loadMoreRef={loadMoreRef}
                emptyTitle={t('brands_empty_title')}
                updatePermission={PERMISSIONS.UPDATE_BRANDS}
                deletePermission={PERMISSIONS.DELETE_BRANDS}
                approvePermission={PERMISSIONS.APPROVE_BRANDS}
                onEdit={openEditForm}
                onDelete={setDeletingId}
                onApprove={approveMutation.mutate}
                onReject={rejectMutation.mutate}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <BrandFormDialog
        brand={editingBrand}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        isLoading={deleteMutation.isPending}
        title={t('delete_brand')}
        description={t('delete_brand_desc')}
      />
    </div>
  );
};
