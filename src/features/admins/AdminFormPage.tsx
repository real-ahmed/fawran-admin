import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { createAdmin, updateAdmin, fetchAdminById, AdminPayload } from '@/services/adminService';
import type { Role } from '@/services/roleService';
import type { DeliveryZone } from '@/types/delivery-zone';
import { applyApiValidationErrors, parseApiError } from '@/utils/api';
import { FormFieldError } from '@/components/FormFieldError';
import { SUPER_ADMIN_ROLE, isProtectedAdminAccount, isSuperAdminRole } from '@/utils/access';
import { FormPageSkeleton } from '@/components/FormPageSkeleton';
import { useAdminFormOptions } from '@/features/admins/hooks/useAdminFormOptions';
import { getLocalizedDisplayName } from '@/utils/displayName';
import { AdminOptionsSection } from '@/features/admins/components/AdminOptionsSection';

interface AdminForm {
  name: string;
  email: string;
  password?: string;
  is_active: boolean;
  roles: string[];
  delivery_zones: Array<number | string>;
}

const mergeByKey = <T,>(primary: T[], secondary: T[], getKey: (item: T) => string) => {
  const options = [...primary];
  const existingKeys = new Set(primary.map(getKey));

  secondary.forEach((item) => {
    const key = getKey(item);
    if (!existingKeys.has(key)) {
      options.push(item);
      existingKeys.add(key);
    }
  });

  return options;
};

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
    delivery_zones: z.array(z.union([z.number(), z.string()])).optional().default([]),
  });

  const [isLoading, setIsLoading] = useState(isEditing);
  const [selectedRoleOptions, setSelectedRoleOptions] = useState<Role[]>([]);
  const [selectedZoneOptions, setSelectedZoneOptions] = useState<DeliveryZone[]>([]);
  const {
    roles,
    rolesSearchTerm,
    setRolesSearchTerm,
    rolesLoading,
    rolesFetching,
    rolesFetchingNextPage,
    rolesHasNextPage,
    loadMoreRoles,
    zones,
    zonesSearchTerm,
    setZonesSearchTerm,
    zonesLoading,
    zonesFetching,
    zonesFetchingNextPage,
    zonesHasNextPage,
    loadMoreZones,
  } = useAdminFormOptions();

  const allRoles = useMemo(
    () => mergeByKey(roles, selectedRoleOptions, (role) => role.name),
    [roles, selectedRoleOptions]
  );
  const allZones = useMemo(
    () => mergeByKey(zones, selectedZoneOptions, (zone) => String(zone.id)),
    [zones, selectedZoneOptions]
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      is_active: true,
      roles: [],
      delivery_zones: [],
    },
  });
  const selectedRoles = useWatch({ control, name: 'roles' }) ?? [];
  const selectedZones = useWatch({ control, name: 'delivery_zones' }) ?? [];

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      fetchAdminById(Number(id))
        .then((admin) => {
          if (isProtectedAdminAccount(admin)) {
            toast.error(t('super_admin_account_protected'));
            navigate('/admins');
            return;
          }

          reset({
            name: admin.name,
            email: admin.email,
            password: '',
            is_active: admin.is_active,
            roles: admin.roles?.map(r => r.name) || [],
            delivery_zones: admin.delivery_zones?.map((zone) => zone.id) || [],
          });
          setSelectedRoleOptions(admin.roles || []);
          setSelectedZoneOptions(admin.delivery_zones || []);
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
      applyApiValidationErrors<AdminForm>(error, setError, {
        role: 'roles',
        role_id: 'roles',
        role_ids: 'roles',
        delivery_zones: 'delivery_zones',
        delivery_zone_ids: 'delivery_zones'
      });
      toast.error(parseApiError(error, t('save_failed')));
    },
  });

  const onSubmit = (data: AdminForm) => {
    mutation.mutate(data);
  };

  const getUpdatedRoleSelection = (
    currentRoles: string[],
    roleName: string,
    checked: boolean | 'indeterminate'
  ) => {
    if (!checked) {
      return currentRoles.filter((currentRole) => currentRole !== roleName);
    }

    if (roleName === SUPER_ADMIN_ROLE) {
      toast.info(t('super_admin_exclusive_role'));
      return [SUPER_ADMIN_ROLE];
    }

    return Array.from(
      new Set([...currentRoles.filter((currentRole) => currentRole !== SUPER_ADMIN_ROLE), roleName])
    );
  };

  if (isLoading || rolesLoading || zonesLoading) {
    return <FormPageSkeleton sections={2} />;
  }

  return (
    <div className="space-y-6 pb-10">
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
              <FormFieldError message={errors.name?.message} />
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
              <FormFieldError message={errors.email?.message} />
            </div>
          </div>

          {isEditing && (
            <div className="grid max-w-2xl gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t('admin_password')} <span className="text-muted-foreground font-normal">({t('optional')})</span>
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="w-full bg-muted/40"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                {t('admin_password_hint_edit')}
              </p>
              <FormFieldError message={errors.password?.message} />
            </div>
          )}

          <AdminOptionsSection
            label={<>{t('admin_roles')} <span className="text-destructive">*</span></>}
            searchTerm={rolesSearchTerm}
            searchPlaceholder={t('search_roles')}
            clearSearchLabel={t('clear')}
            onSearchChange={setRolesSearchTerm}
            selectedLabel={
              selectedRoles.length > 0
                ? t('selected_permissions_count', { count: selectedRoles.length })
                : undefined
            }
            isEmpty={allRoles.length === 0}
            isFetching={rolesFetching}
            emptyMessage={t('roles_empty_title')}
            loadingMessage={t('loading')}
            hasNextPage={Boolean(rolesHasNextPage)}
            isFetchingNextPage={rolesFetchingNextPage}
            loadMoreLabel={t('load_more')}
            onLoadMore={() => void loadMoreRoles()}
            errorMessage={errors.roles?.message}
          >
            <Controller
              control={control}
              name="roles"
              render={({ field }) => (
                <>
                  {allRoles.map(role => (
                    <div
                      key={role.id}
                      className="flex min-h-12 items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40"
                    >
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={field.value.includes(role.name)}
                        onCheckedChange={(checked) => {
                          if (checked && !isSuperAdminRole(role) && field.value.includes(SUPER_ADMIN_ROLE)) {
                            toast.info(t('super_admin_exclusive_role'));
                          }

                          const updatedRoles = getUpdatedRoleSelection(field.value, role.name, checked);
                          field.onChange(updatedRoles);
                          setSelectedRoleOptions(
                            allRoles.filter((currentRole) => updatedRoles.includes(currentRole.name))
                          );
                        }}
                      />
                      <Label
                        htmlFor={`role-${role.id}`}
                        className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium"
                      >
                        {getLocalizedDisplayName(role, i18n.language, role.name)}
                      </Label>
                    </div>
                  ))}
                </>
              )}
            />
          </AdminOptionsSection>

          <AdminOptionsSection
            label={<>{t('delivery_zones')} <span className="text-muted-foreground font-normal">({t('optional')})</span></>}
            searchTerm={zonesSearchTerm}
            searchPlaceholder={t('search_delivery_zones')}
            clearSearchLabel={t('clear')}
            onSearchChange={setZonesSearchTerm}
            selectedLabel={
              selectedZones.length > 0
                ? t('selected_permissions_count', { count: selectedZones.length })
                : undefined
            }
            isEmpty={allZones.length === 0}
            isFetching={zonesFetching}
            emptyMessage={t('delivery_zones_empty_title')}
            loadingMessage={t('loading')}
            hasNextPage={Boolean(zonesHasNextPage)}
            isFetchingNextPage={zonesFetchingNextPage}
            loadMoreLabel={t('load_more')}
            onLoadMore={() => void loadMoreZones()}
            errorMessage={errors.delivery_zones?.message}
          >
            <Controller
              control={control}
              name="delivery_zones"
              render={({ field }) => (
                <>
                  {allZones.map(zone => (
                    <div
                      key={zone.id}
                      className="flex min-h-12 items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40"
                    >
                      <Checkbox
                        id={`zone-${zone.id}`}
                        checked={field.value?.some((selectedId) => String(selectedId) === String(zone.id))}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          const updated = checked
                            ? [...current, zone.id]
                            : current.filter(id => String(id) !== String(zone.id));
                          field.onChange(updated);
                          setSelectedZoneOptions(
                            allZones.filter((currentZone) =>
                              updated.some((selectedId) => String(selectedId) === String(currentZone.id))
                            )
                          );
                        }}
                      />
                      <Label
                        htmlFor={`zone-${zone.id}`}
                        className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium"
                      >
                        {i18n.language === 'ar' ? zone.name?.ar : zone.name?.en}
                      </Label>
                    </div>
                  ))}
                </>
              )}
            />
          </AdminOptionsSection>

          <div className="flex items-center gap-2 pt-2">
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
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
