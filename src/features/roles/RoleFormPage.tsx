import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import {
  createRole,
  updateRole,
  fetchPermissions,
  fetchRoleById,
  type PermissionRecord,
  type RolePayload,
} from '@/services/roleService';
import { applyApiValidationErrors, parseApiError } from '@/utils/api';
import { FormFieldError } from '@/components/FormFieldError';
import { isSuperAdminRole } from '@/utils/access';

interface RoleForm {
  display_name_en: string;
  display_name_ar: string;
  permissions?: string[];
}

export const RoleFormPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const roleSchema = z.object({
    display_name_en: z.string().min(2, t('validation_min_chars', { count: 2 })),
    display_name_ar: z.string().min(2, t('validation_min_chars', { count: 2 })),
  });

  const [isLoading, setIsLoading] = useState(isEditing);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: allPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      fetchRoleById(Number(id))
        .then((role) => {
          if (isSuperAdminRole(role)) {
            toast.error(t('super_admin_role_protected'));
            navigate('/roles');
            return;
          }

          reset({ 
            display_name_en: role.display_name?.en || role.name,
            display_name_ar: role.display_name?.ar || role.name,
          });
          setSelectedPermissions(role.permissions?.map(p => p.name) || []);
        })
        .catch((err) => {
          toast.error(parseApiError(err, t('error_loading_role')));
          navigate('/roles');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isEditing, id, reset, navigate, t]);

  const mutation = useMutation({
    mutationFn: (data: RolePayload) => {
      if (isEditing && id) {
        return updateRole(Number(id), data);
      }
      return createRole(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(t('saved'));
      navigate('/roles');
    },
    onError: (error) => {
      applyApiValidationErrors<RoleForm>(error, setError, {
        'display_name.en': 'display_name_en',
        'display_name.ar': 'display_name_ar',
        name: 'display_name_en',
        permissions: 'permissions',
      });
      toast.error(parseApiError(error, t('save_failed')));
    },
  });

  const onSubmit = (data: RoleForm) => {
    mutation.mutate({
      display_name: {
        en: data.display_name_en,
        ar: data.display_name_ar,
      },
      permissions: selectedPermissions,
    });
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const getPermissionName = (permission: PermissionRecord) => permission.name || permission.key || '';

  const getPermissionLabel = (permission: PermissionRecord) => {
    if (i18n.language.startsWith('ar') && permission.display_name?.ar) {
      return permission.display_name.ar;
    }

    if (permission.display_name?.en) {
      return permission.display_name.en;
    }

    const action = getPermissionName(permission).split('_')[0]?.toLowerCase();
    const translationKey = `permission_action_${action}`;
    const translated = t(translationKey);

    return translated === translationKey ? getPermissionName(permission) : translated;
  };

  const getPermissionGroupLabel = (groupKey: string) => {
    const translationKey = `permission_group_${groupKey.toLowerCase()}`;
    const translated = t(translationKey);

    return translated === translationKey ? groupKey.replace(/_/g, ' ') : translated;
  };

  const getPermissionNames = (permissions: PermissionRecord[]) =>
    permissions.map(getPermissionName).filter(Boolean);

  const selectGroupPermissions = (permissions: PermissionRecord[]) => {
    const permissionNames = getPermissionNames(permissions);

    setSelectedPermissions((current) => Array.from(new Set([...current, ...permissionNames])));
  };

  const clearGroupPermissions = (permissions: PermissionRecord[]) => {
    const permissionNames = new Set(getPermissionNames(permissions));

    setSelectedPermissions((current) => current.filter((permission) => !permissionNames.has(permission)));
  };

  const getGroupedPermissions = () => {
    if (!allPermissions) return {};
    
    if (!Array.isArray(allPermissions) && typeof allPermissions === 'object') {
      const grouped: Record<string, PermissionRecord[]> = {};
      Object.entries(allPermissions).forEach(([group, perms]) => {
        const groupKey = group.toUpperCase().replace(/\s+/g, '_');
        grouped[groupKey] = perms.map((permission) =>
          typeof permission === 'string' ? { name: permission } : permission
        );
      });
      return grouped;
    }

    if (Array.isArray(allPermissions)) {
      return allPermissions.reduce((acc, p) => {
        const permissionStr = typeof p === 'string' ? p : (p.key || p.name);
        if (!permissionStr) return acc;
        
        const parts = permissionStr.split('_');
        const entity = parts.length > 1 ? parts.slice(1).join('_') : 'GENERAL';
        
        if (!acc[entity]) acc[entity] = [];
        acc[entity].push(typeof p === 'string' ? { name: p } : p);
        return acc;
      }, {} as Record<string, PermissionRecord[]>);
    }
    
    return {};
  };

  const groupedPermissions = getGroupedPermissions();

  if (isLoading || permissionsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={isEditing ? t('edit_role') : t('create_role')}
        description={isEditing ? t('edit_role_desc') : t('create_role_desc')}
      >
        <Button variant="outline" onClick={() => navigate('/roles')} className="gap-2">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('back')}
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-5 border-b border-border p-6 sm:p-8">
            <div>
              <h2 className="text-base font-semibold text-foreground">{t('role_details')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('role_details_desc')}</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="display_name_en" className="text-sm font-medium">
                  {t('role_name_en')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="display_name_en"
                  {...register('display_name_en')}
                  className="h-11 w-full bg-muted/40"
                  dir="ltr"
                />
                <FormFieldError message={errors.display_name_en?.message} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="display_name_ar" className="text-sm font-medium">
                  {t('role_name_ar')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="display_name_ar"
                  {...register('display_name_ar')}
                  className="h-11 w-full bg-muted/40"
                  dir="rtl"
                />
                <FormFieldError message={errors.display_name_ar?.message} />
              </div>
            </div>
          </section>

          <section className="space-y-5 px-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {t('permissions')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('permissions_desc')}</p>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {t('selected_permissions_count', { count: selectedPermissions.length })}
              </Badge>
            </div>

            <div className="grid gap-4">
              {Object.entries(groupedPermissions).map(([entity, perms]) => (
                <div key={entity} className="rounded-xl border border-border/70 bg-muted/10 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {getPermissionGroupLabel(entity)}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('permission_group_selected_count', {
                          selected: getPermissionNames(perms).filter((permission) =>
                            selectedPermissions.includes(permission)
                          ).length,
                          total: perms.length,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectGroupPermissions(perms)}
                      >
                        {t('select_all')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => clearGroupPermissions(perms)}
                      >
                        {t('clear')}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {perms.map((p) => (
                      <div
                        key={getPermissionName(p)}
                        className="flex min-h-11 items-center gap-3 rounded-lg border border-border/50 bg-background px-3 py-2"
                      >
                        <Checkbox
                          id={getPermissionName(p)}
                          checked={selectedPermissions.includes(getPermissionName(p))}
                          onCheckedChange={() => togglePermission(getPermissionName(p))}
                        />
                        <Label
                          htmlFor={getPermissionName(p)}
                          className="min-w-0 cursor-pointer text-sm font-medium leading-tight text-foreground"
                        >
                          {getPermissionLabel(p)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <FormFieldError message={errors.permissions?.message} />
          </section>

          <div className="flex justify-end gap-3 border-t px-6 py-5 sm:px-8">
            <Button variant="outline" onClick={() => navigate('/roles')} type="button">
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
