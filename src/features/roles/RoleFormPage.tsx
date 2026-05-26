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
import { createRole, updateRole, fetchPermissions, fetchRoleById, RolePayload } from '@/services/roleService';
import { parseApiError } from '@/utils/api';

interface RoleForm {
  name: string;
}

export const RoleFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const roleSchema = z.object({
    name: z.string().min(2, t('validation_min_chars', { count: 2 })),
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
          reset({ name: role.name });
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
      name: data.name,
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
      const grouped: Record<string, string[]> = {};
      Object.entries(allPermissions).forEach(([group, perms]: [string, any]) => {
        const groupKey = group.toUpperCase().replace(/\s+/g, '_');
        grouped[groupKey] = perms.map((p: any) => typeof p === 'string' ? p : (p.key || p.name));
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
        acc[entity].push(permissionStr);
        return acc;
      }, {} as Record<string, string[]>);
    }
    
    return {};
  };

  const groupedPermissions = getGroupedPermissions();
  const formatPermissionAction = (permission: string) => {
    const action = permission.split('_')[0].toLowerCase();
    return t(`permission_action_${action}`);
  };

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
          
          <div className="grid gap-2 max-w-md">
            <Label htmlFor="name" className="text-sm font-medium">
              {t('role_name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              className="w-full bg-muted/40"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
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
                    {perms.map(permission => (
                      <div key={permission} className="flex items-start space-x-2 space-x-reverse rtl:space-x-reverse">
                        <Checkbox
                          id={permission}
                          checked={selectedPermissions.includes(permission)}
                          onCheckedChange={() => togglePermission(permission)}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={permission}
                          className="text-sm leading-tight cursor-pointer font-normal"
                        >
                          {formatPermissionAction(permission)}
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
