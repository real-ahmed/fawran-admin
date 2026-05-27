import { Edit2, Shield, Trash2 } from 'lucide-react';
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
import type { PermissionRecord, Role } from '@/services/roleService';
import { getLocalizedDisplayName } from '@/utils/displayName';
import { isSuperAdminRole } from '@/utils/access';
import { DataTableSkeletonRows } from '@/components/DataTableSkeletonRows';
import { TableActionButton } from '@/components/TableActionButton';

interface RolesTableProps {
  roles: Role[];
  isLoading: boolean;
  hasNextPage?: boolean;
  isDeleting: boolean;
  loadMoreRef: (node?: Element | null) => void;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

export const RolesTable = ({
  roles,
  isLoading,
  hasNextPage,
  isDeleting,
  loadMoreRef,
  onEdit,
  onDelete,
}: RolesTableProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{t('role_name')}</TableHead>
              <TableHead>{t('permissions')}</TableHead>
              <TableHead className="w-[100px] text-end">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeletonRows columns={['w-40', 'w-64', 'w-24']} />
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Shield className="mb-2 h-8 w-8 opacity-20" />
                    <p>{t('roles_empty_title')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                const protectedRole = isSuperAdminRole(role);

                return (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium text-foreground">
                      {getLocalizedDisplayName(role, i18n.language)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.slice(0, 3).map((permission: PermissionRecord, index) => (
                          <span
                            key={permission.name || index}
                            className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            {getLocalizedDisplayName(permission, i18n.language)}
                          </span>
                        ))}
                        {(role.permissions?.length || 0) > 3 && (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            +{(role.permissions?.length || 0) - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-end">
                      {!protectedRole && (
                        <div className="flex items-center justify-end gap-2">
                          <Can permission={PERMISSIONS.UPDATE_ROLES}>
                            <TableActionButton label={t('edit')} icon={Edit2} onClick={() => onEdit(role)} />
                          </Can>
                          <Can permission={PERMISSIONS.DELETE_ROLES}>
                            <TableActionButton
                              label={t('delete')}
                              icon={Trash2}
                              onClick={() => onDelete(role.id)}
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
                columns={['w-40', 'w-64', 'w-24']}
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
