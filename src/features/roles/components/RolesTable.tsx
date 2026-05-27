import { Loader2, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
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
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  {t('loading')}
                </TableCell>
              </TableRow>
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
              roles.map((role) => (
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
                    <div className="flex items-center justify-end gap-2">
                      <Can permission={PERMISSIONS.UPDATE_ROLES}>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
                          {t('edit')}
                        </Button>
                      </Can>
                      {role.name !== 'Super Admin' && (
                        <Can permission={PERMISSIONS.DELETE_ROLES}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(role.id)}
                            disabled={isDeleting}
                          >
                            {t('delete')}
                          </Button>
                        </Can>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            {hasNextPage && (
              <TableRow ref={loadMoreRef}>
                <TableCell colSpan={3} className="py-4 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
