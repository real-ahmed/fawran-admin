import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { Admin } from '@/services/adminService';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAdminsList } from '@/features/admins/hooks/useAdminsList';
import { AdminsToolbar } from '@/features/admins/components/AdminsToolbar';
import { AdminsTable } from '@/features/admins/components/AdminsTable';

export const AdminsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    admins,
    isLoading,
    hasNextPage,
    loadMoreRef,
    searchTerm,
    setSearchTerm,
    deletingId,
    setDeletingId,
    deleteMutation,
  } = useAdminsList();

  const handleEdit = (admin: Admin) => {
    navigate(`/admins/${admin.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/admins/create');
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('admins')} description={t('admins_desc')}>
        <Can permission={PERMISSIONS.CREATE_ADMINS}>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('add_admin')}
          </Button>
        </Can>
      </PageHeader>

      <AdminsToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <AdminsTable
        admins={admins}
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
        title={t('delete_admin')}
        description={t('delete_admin_desc')}
      />
    </div>
  );
};
