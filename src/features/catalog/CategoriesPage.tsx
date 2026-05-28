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
  approveCategory,
  deleteCategory,
  getCategories,
  rejectCategory,
} from '@/services/catalog/categoryService';
import type { CatalogApprovalStatus, Category } from '@/types/catalog';
import { ApprovalStatus } from '@/types/enums';
import { useCatalogResourceList } from './hooks/useCatalogResourceList';
import { CatalogToolbar } from './components/CatalogToolbar';
import { CatalogTable, type CatalogTableColumn } from './components/CatalogTable';
import { CategoryFormDialog } from './components/CategoryFormDialog';
import { localizedName } from './utils';

export const CategoriesPage = () => {
  const { t, i18n } = useTranslation();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
    resourceKey: 'categories',
    approvalStatus,
    fetchItems: getCategories,
    deleteItem: deleteCategory,
    approveItem: approveCategory,
    rejectItem: rejectCategory,
  });

  const columns = useMemo<CatalogTableColumn<Category>[]>(() => [
    {
      key: 'name',
      header: t('category_name'),
      render: (category) => <span className="font-medium">{localizedName(category.name, i18n.language)}</span>,
    },
    {
      key: 'parent',
      header: t('parent_category'),
      render: (category) => category.parent ? <span className="text-muted-foreground">{localizedName(category.parent.name, i18n.language)}</span> : <span className="text-muted-foreground opacity-50">-</span>,
    },
    {
      key: 'icon',
      header: t('category_icon'),
      render: (category) => category.icon ? <img src={category.icon} alt="Icon" className="w-8 h-8 object-contain" /> : '-',
    },
  ], [i18n.language, t]);

  const openCreateForm = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('categories')} description={t('categories_desc')}>
        <Can permission={PERMISSIONS.CREATE_CATEGORIES}>
          <Button onClick={openCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('create_category')}
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
              searchPlaceholder={t('search_categories')}
              onSearchChange={setSearchTerm}
              onActiveChange={setActiveFilter}
              onClearFilters={clearFilters}
            />

            {isError ? (
              <div className="py-10 text-center text-destructive">{t('error_loading_categories')}</div>
            ) : (
              <CatalogTable
                items={items}
                columns={columns}
                isLoading={isLoading}
                approvalStatus={approvalStatus}
                hasNextPage={hasNextPage}
                isDeleting={deleteMutation.isPending}
                loadMoreRef={loadMoreRef}
                emptyTitle={t('categories_empty_title')}
                updatePermission={PERMISSIONS.UPDATE_CATEGORIES}
                deletePermission={PERMISSIONS.DELETE_CATEGORIES}
                approvePermission={PERMISSIONS.APPROVE_CATEGORIES}
                onEdit={openEditForm}
                onDelete={setDeletingId}
                onApprove={approveMutation.mutate}
                onReject={rejectMutation.mutate}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CategoryFormDialog
        category={editingCategory}
        categories={items}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        isLoading={deleteMutation.isPending}
        title={t('delete_category')}
        description={t('delete_category_desc')}
      />
    </div>
  );
};
