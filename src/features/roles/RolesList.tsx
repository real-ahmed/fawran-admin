import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { Role } from '@/services/roleService';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useRolesList } from '@/features/roles/hooks/useRolesList';
import { RolesToolbar } from '@/features/roles/components/RolesToolbar';
import { RolesTable } from '@/features/roles/components/RolesTable';

export const RolesList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    roles,
    isLoading,
    hasNextPage,
    loadMoreRef,
    searchTerm,
    setSearchTerm,
    deletingId,
    setDeletingId,
    deleteMutation,
  } = useRolesList();

  const handleEdit = (role: Role) => {
    navigate(`/roles/${role.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/roles/create');
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('roles')} description={t('roles_desc')}>
        <Can permission={PERMISSIONS.CREATE_ROLES}>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('add_role')}
          </Button>
        </Can>
      </PageHeader>

      <RolesToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <RolesTable
        roles={roles}
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
        title={t('delete_role')}
        description={t('delete_role_desc')}
      />
    </div>
  );
};
