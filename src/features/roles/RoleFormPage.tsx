import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { parseApiError } from '@/utils/api';

interface RoleForm {
  display_name_en: string;
  display_name_ar: string;
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
    formState: { errors },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      fetchRoleById(Number(id))
        .then((role) => {
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
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader
        title={isEditing ? t('edit_role') : t('create_role')}
        description={isEditing ? t('edit_role_desc') : t('create_role_desc')}
      >
        <Button variant="outline" onClick={() => navigate('/roles')} className="gap-2">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('back')}
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
            <div className="grid gap-2">
              <Label htmlFor="display_name_en" className="text-sm font-medium">
                {t('role_name_en')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="display_name_en"
                {...register('display_name_en')}
                className="w-full bg-muted/40"
                dir="ltr"
              />
              {errors.display_name_en && (
                <p className="text-xs text-destructive">{errors.display_name_en.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="display_name_ar" className="text-sm font-medium">
                {t('role_name_ar')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="display_name_ar"
                {...register('display_name_ar')}
                className="w-full bg-muted/40"
                dir="rtl"
              />
              {errors.display_name_ar && (
                <p className="text-xs text-destructive">{errors.display_name_ar.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">{t('permissions')}</Label>
            
            <div className="grid gap-6 p-6 border border-border/60 rounded-xl bg-muted/10">
              {Object.entries(groupedPermissions).map(([entity, perms]) => (
                <div key={entity} className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground bg-background px-4 py-2 rounded-lg border shadow-sm inline-block">
                    {entity.replace(/_/g, ' ')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
                    {perms.map((p) => (
                      <div key={p.name} className="flex items-start space-x-2 space-x-reverse rtl:space-x-reverse">
                        <Checkbox
                          id={p.name}
                          checked={selectedPermissions.includes(p.name)}
                          onCheckedChange={() => togglePermission(p.name)}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={p.name}
                          className="text-sm leading-tight cursor-pointer font-normal"
                        >
                          {i18n.language === 'ar' ? p.display_name?.ar : p.display_name?.en || p.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-border/40 mt-4 last:hidden" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-3">
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
