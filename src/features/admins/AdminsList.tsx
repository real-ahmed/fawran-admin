import { useEffect, useState } from 'react';
import { Plus, Users, Search, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { fetchAdmins, deleteAdmin, Admin } from '@/services/adminService';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { parseApiError } from '@/utils/api';

export const AdminsList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
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
    queryKey: ['admins', searchTerm],
    queryFn: ({ pageParam = 1 }) => fetchAdmins({ search: searchTerm, page: pageParam }),
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
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success(t('deleted'));
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('delete_failed')));
      setDeletingId(null);
    },
  });

  const handleEdit = (admin: Admin) => {
    navigate(`/admins/${admin.id}/edit`);
  };

  const handleCreate = () => {
    navigate('/admins/create');
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  const admins = data?.pages.flatMap((page) => page.data) || [];

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

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="ps-9"
              placeholder={t('search_admins')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Can permission={PERMISSIONS.VIEW_ROLES}>
            <Button variant="outline" className="gap-2" onClick={() => navigate('/roles')}>
              <ShieldCheck className="h-4 w-4" />
              {t('roles')}
            </Button>
          </Can>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
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
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t('loading')}
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="h-8 w-8 mb-2 opacity-20" />
                      <p>{t('admins_empty_title')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium text-foreground">
                      {admin.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {admin.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {admin.roles?.map((role: Role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            {i18n.language === 'ar' ? role.display_name?.ar : role.display_name?.en || role.name}
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
                      <Can permission={PERMISSIONS.UPDATE_ADMINS}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(admin)}
                          >
                            {t('edit')}
                          </Button>
                          {admin.id !== 1 && !admin.roles?.some(r => r.name === 'Super Admin') && (
                            <Can permission={PERMISSIONS.DELETE_ADMINS}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(admin.id)}
                                disabled={deleteMutation.isPending}
                              >
                                {t('delete')}
                              </Button>
                            </Can>
                          )}
                        </div>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {hasNextPage && (
                <TableRow ref={ref}>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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
        title={t('delete_admin')}
        description={t('delete_admin_desc')}
      />
    </div>
  );
};
