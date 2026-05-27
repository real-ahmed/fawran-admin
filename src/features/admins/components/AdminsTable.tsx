import { Edit2, Trash2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Admin } from '@/services/adminService';
import { getLocalizedDisplayName } from '@/utils/displayName';
import { isProtectedAdminAccount } from '@/utils/access';
import { DataTableSkeletonRows } from '@/components/DataTableSkeletonRows';
import { TableActionButton } from '@/components/TableActionButton';

interface AdminsTableProps {
  admins: Admin[];
  isLoading: boolean;
  hasNextPage?: boolean;
  isDeleting: boolean;
  loadMoreRef: (node?: Element | null) => void;
  onEdit: (admin: Admin) => void;
  onDelete: (id: number) => void;
}

export const AdminsTable = ({
  admins,
  isLoading,
  hasNextPage,
  isDeleting,
  loadMoreRef,
  onEdit,
  onDelete,
}: AdminsTableProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{t('admin_name')}</TableHead>
              <TableHead>{t('admin_email')}</TableHead>
              <TableHead>{t('admin_roles')}</TableHead>
              <TableHead>{t('admin_status')}</TableHead>
              <TableHead className="w-[100px] text-end">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeletonRows columns={['w-36', 'w-48', 'w-40', 'w-20', 'w-24']} />
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="mb-2 h-8 w-8 opacity-20" />
                    <p>{t('admins_empty_title')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => {
                const isProtectedAdmin = isProtectedAdminAccount(admin);

                return (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium text-foreground">{admin.name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {admin.roles?.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            {getLocalizedDisplayName(role, i18n.language)}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${admin.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {admin.is_active ? t('active') : t('inactive')}
                      </span>
                    </TableCell>
                    <TableCell className="text-end">
                      {!isProtectedAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <Can permission={PERMISSIONS.UPDATE_ADMINS}>
                            <TableActionButton label={t('edit')} icon={Edit2} onClick={() => onEdit(admin)} />
                          </Can>
                          <Can permission={PERMISSIONS.DELETE_ADMINS}>
                            <TableActionButton
                              label={t('delete')}
                              icon={Trash2}
                              onClick={() => onDelete(admin.id)}
                              disabled={isDeleting}
                              tone="destructive"
                            />
                          </Can>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            {hasNextPage && (
              <DataTableSkeletonRows
                columns={['w-36', 'w-48', 'w-40', 'w-20', 'w-24']}
                rows={1}
                loadMoreRef={loadMoreRef}
              />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
