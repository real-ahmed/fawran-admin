import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { createAdmin, updateAdmin, fetchAdminById, AdminPayload } from '@/services/adminService';
import { fetchRoles } from '@/services/roleService';
import { parseApiError } from '@/utils/api';

interface AdminForm {
  name: string;
  email: string;
  password?: string;
  is_active: boolean;
  roles: string[];
}

export const AdminFormPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const adminSchema = z.object({
    name: z.string().min(2, t('validation_min_chars', { count: 2 })),
    email: z.string().email(t('invalid_email')),
    password: z.string().optional(),
    is_active: z.boolean(),
    roles: z.array(z.string()).min(1, t('validation_required_selection')),
  });

  const [isLoading, setIsLoading] = useState(isEditing);

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => fetchRoles({ per_page: 100 }),
  });

  const allRoles = rolesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      is_active: true,
      roles: [],
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      fetchAdminById(Number(id))
        .then((admin) => {
          reset({
            name: admin.name,
            email: admin.email,
            password: '',
            is_active: admin.is_active,
            roles: admin.roles?.map(r => r.name) || [],
          });
        })
        .catch((err) => {
          toast.error(parseApiError(err, t('error_loading_admin')));
          navigate('/admins');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isEditing, id, reset, t, navigate]);

  const mutation = useMutation({
    mutationFn: (data: AdminPayload) => {
      if (isEditing && id) {
        const payload = { ...data };
        if (!payload.password) delete payload.password;
        return updateAdmin(Number(id), payload);
      }
      return createAdmin(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success(t('saved'));
      navigate('/admins');
    },
    onError: (error) => {
      toast.error(parseApiError(error, t('save_failed')));
    },
  });

  const onSubmit = (data: AdminForm) => {
    mutation.mutate(data);
  };

  if (isLoading || rolesLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <PageHeader
        title={isEditing ? t('edit_admin') : t('create_admin')}
        description={isEditing ? t('edit_admin_desc') : t('create_admin_desc')}
      >
        <Button variant="outline" onClick={() => navigate('/admins')} className="gap-2">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('back')}
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <form id="admin-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t('admin_name')} <span className="text-destructive">*</span>
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

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t('admin_email')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="w-full bg-muted/40"
                dir="ltr"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2 max-w-xl">
            <Label htmlFor="password" className="text-sm font-medium">
              {t('admin_password')} {!isEditing && <span className="text-muted-foreground font-normal">({t('optional')})</span>}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className="w-full bg-muted/40"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              {isEditing ? t('admin_password_hint_edit') : t('admin_password_hint')}
            </p>
          </div>

          <div className="grid gap-4">
            <Label className="text-sm font-medium">{t('admin_roles')} <span className="text-destructive">*</span></Label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 border border-border/60 rounded-xl bg-muted/10">
              <Controller
                control={control}
                name="roles"
                render={({ field }) => (
                  <>
                    {allRoles.map(role => (
                      <div key={role.id} className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={field.value.includes(role.name)}
                          onCheckedChange={(checked) => {
                            const current = field.value;
                            const updated = checked
                              ? [...current, role.name]
                              : current.filter(r => r !== role.name);
                            field.onChange(updated);
                          }}
                        />
                        <Label
                          htmlFor={`role-${role.id}`}
                          className="text-sm cursor-pointer font-medium"
                        >
                          {i18n.language === 'ar' ? role.display_name?.ar : role.display_name?.en || role.name}
                        </Label>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.roles && (
              <p className="text-xs text-destructive">{errors.roles.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse pt-2">
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <Checkbox
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              {t('active')}
            </Label>
          </div>

          <div className="pt-6 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/admins')} type="button">
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
