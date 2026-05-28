import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Can } from '@/components/Can';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PERMISSIONS } from '@/config/permissions';
import {
  approveMasterProduct,
  deleteMasterProduct,
  getMasterProducts,
  rejectMasterProduct,
} from '@/services/catalog/masterProductService';
import { getBrands } from '@/services/catalog/brandService';
import { getCategories } from '@/services/catalog/categoryService';
import type { Brand, CatalogApprovalStatus, MasterProduct } from '@/types/catalog';
import { ApprovalStatus } from '@/types/enums';
import { useCatalogResourceList } from './hooks/useCatalogResourceList';
import { CatalogToolbar } from './components/CatalogToolbar';
import { CatalogTable, type CatalogTableColumn } from './components/CatalogTable';
import { localizedName } from './utils';

export const MasterProductsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState<CatalogApprovalStatus>(ApprovalStatus.Pending);
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
    resourceKey: 'master-products',
    approvalStatus,
    fetchItems: getMasterProducts,
    deleteItem: deleteMasterProduct,
    approveItem: approveMasterProduct,
    rejectItem: rejectMasterProduct,
  });

  const categoriesQuery = useQuery({
    queryKey: ['catalog', 'categories', 'options'],
    queryFn: () => getCategories({ per_page: 100 }),
  });

  const brandsQuery = useQuery({
    queryKey: ['catalog', 'brands', 'options'],
    queryFn: () => getBrands({ per_page: 100 }),
  });

  const categories = categoriesQuery.data?.data || [];
  const brands = brandsQuery.data?.data || [];

  const brandNameById = useMemo(() => {
    const names = new Map<number, string>();
    brands.forEach((brand: Brand) => {
      names.set(brand.id, localizedName(brand.name, i18n.language));
    });
    return names;
  }, [brands, i18n.language]);

  const columns = useMemo<CatalogTableColumn<MasterProduct>[]>(() => [
    {
      key: 'name',
      header: t('master_product_name'),
      render: (product) => <span className="font-medium">{localizedName(product.name, i18n.language)}</span>,
    },
    {
      key: 'category',
      header: t('category'),
      render: (product) => product.category ? localizedName(product.category.name, i18n.language) : '-',
    },
    {
      key: 'brand',
      header: t('brand'),
      render: (product) => product.retail_detail?.brand_id ? brandNameById.get(product.retail_detail.brand_id) || product.retail_detail.brand_id : '-',
    },
    {
      key: 'unit',
      header: t('unit_type'),
      render: (product) => product.unit_type ? t(`unit_${product.unit_type}`) : '-',
    },
    {
      key: 'sku',
      header: t('sku_barcode'),
      render: (product) => product.retail_detail?.sku_barcode || '-',
    },
  ], [brandNameById, i18n.language, t]);

  const openCreateForm = () => {
    navigate('/catalog/products/create');
  };

  const openEditForm = (product: MasterProduct) => {
    navigate(`/catalog/products/${product.id}/edit`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('master_products')} description={t('master_products_desc')}>
        <Can permission={PERMISSIONS.CREATE_MASTER_PRODUCTS}>
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('create_master_product')}
          </Button>
        </Can>
      </PageHeader>

      <Tabs value={approvalStatus} onValueChange={(value) => setApprovalStatus(value as CatalogApprovalStatus)} className="w-full" dir={i18n.dir()}>
        <TabsList className="grid w-full max-w-[540px] grid-cols-3 p-1 bg-muted/50 rounded-lg mb-6">
          <TabsTrigger value={ApprovalStatus.Pending} className="py-2.5 rounded-md">{t('pending')}</TabsTrigger>
          <TabsTrigger value={ApprovalStatus.Approved} className="py-2.5 rounded-md">{t('approved')}</TabsTrigger>
          <TabsTrigger value={ApprovalStatus.Rejected} className="py-2.5 rounded-md">{t('rejected')}</TabsTrigger>
        </TabsList>

        <TabsContent value={approvalStatus} className="mt-0 outline-none">
          <div className="space-y-6">
            <CatalogToolbar
              searchTerm={filters.searchTerm}
              activeFilter={filters.activeFilter}
              searchPlaceholder={t('search_master_products')}
              onSearchChange={setSearchTerm}
              onActiveChange={setActiveFilter}
              onClearFilters={clearFilters}
            />

            {isError ? (
              <div className="py-10 text-center text-destructive">{t('error_loading_master_products')}</div>
            ) : (
              <CatalogTable
                items={items}
                columns={columns}
                isLoading={isLoading}
                approvalStatus={approvalStatus}
                hasNextPage={hasNextPage}
                isDeleting={deleteMutation.isPending}
                loadMoreRef={loadMoreRef}
                emptyTitle={t('master_products_empty_title')}
                updatePermission={PERMISSIONS.UPDATE_MASTER_PRODUCTS}
                deletePermission={PERMISSIONS.DELETE_MASTER_PRODUCTS}
                approvePermission={PERMISSIONS.APPROVE_MASTER_PRODUCTS}
                onEdit={openEditForm}
                onDelete={setDeletingId}
                onApprove={approveMutation.mutate}
                onReject={rejectMutation.mutate}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        isLoading={deleteMutation.isPending}
        title={t('delete_master_product')}
        description={t('delete_master_product_desc')}
      />
    </div>
  );
};
