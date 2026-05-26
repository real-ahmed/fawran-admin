import { useEffect, useState } from 'react';
import { Plus, Shield, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { fetchRoles, deleteRole, Role } from '@/services/roleService';
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
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { parseApiError } from '@/utils/api';

export const RolesList = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['roles', searchTerm],
    queryFn: ({ pageParam = 1 }) => fetchRoles({ search: searchTerm, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(t('deleted'));
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('delete_failed')));
      setDeletingId(null);
    },
  });

  const handleEdit = (role: Role) => {
    navigate(`/roles/${role.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/roles/create');
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  const roles = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="space-y-6">
      <PageHeader title={t('roles')} description={t('roles_desc')}>
        <Can permission={PERMISSIONS.MANAGE_ROLES}>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('add_role')}
          </Button>
        </Can>
      </PageHeader>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="ps-9"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
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
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {t('loading')}
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Shield className="h-8 w-8 mb-2 opacity-20" />
                      <p>{t('roles_empty_title')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium text-foreground">
                      {i18n.language === 'ar' ? role.display_name?.ar : role.display_name?.en || role.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.slice(0, 3).map((p: any, idx) => (
                          <span
                            key={p.name || idx}
                            className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            {i18n.language === 'ar' ? p.display_name?.ar : p.display_name?.en || p.name}
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
                      <Can permission={PERMISSIONS.MANAGE_ROLES}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(role)}
                          >
                            {t('edit')}
                          </Button>
                          {role.name !== 'Super Admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(role.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {t('delete')}
                            </Button>
                          )}
                        </div>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {hasNextPage && (
                <TableRow ref={ref}>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
