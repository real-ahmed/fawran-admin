import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { updateAdminProfile, UpdateAdminProfilePayload } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { parseApiError, applyApiValidationErrors } from '@/utils/api';
import { FormFieldError } from '@/components/FormFieldError';

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();

  const profileSchema = z.object({
    name: z.string().min(2, t('validation_min_chars', { count: 2 })),
    email: z.string().email(t('invalid_email')),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  }).refine((data) => {
    if (data.password && data.password !== data.password_confirmation) {
      return false;
    }
    return true;
  }, {
    message: t('passwords_do_not_match', 'Passwords do not match'),
    path: ['password_confirmation'],
  });

  type ProfileForm = z.infer<typeof profileSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      password_confirmation: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateAdminProfilePayload) => {
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }
      return updateAdminProfile(payload);
    },
    onSuccess: (response) => {
      setUser(response.user, response.permissions);
      toast.success(t('profile_updated_successfully', 'Profile updated successfully'));
      reset({
        name: response.user.name,
        email: response.user.email,
        password: '',
        password_confirmation: '',
      });
    },
    onError: (error) => {
      applyApiValidationErrors<ProfileForm>(error, setError);
      toast.error(parseApiError(error, t('save_failed')));
    },
  });

  const onSubmit = (data: ProfileForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t('edit_profile', 'Edit Profile')}
        description={t('edit_profile_desc', 'Update your personal information and password')}
      />

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t('name', 'Name')} <span className="text-destructive">*</span>
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
                {t('email', 'Email')} <span className="text-destructive">*</span>
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

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t('password', 'Password')} <span className="text-muted-foreground font-normal">({t('optional')})</span>
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

            <div className="grid gap-2">
              <Label htmlFor="password_confirmation" className="text-sm font-medium">
                {t('confirm_password', 'Confirm Password')} <span className="text-muted-foreground font-normal">({t('optional')})</span>
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                {...register('password_confirmation')}
                className="w-full bg-muted/40"
                dir="ltr"
              />
              <FormFieldError message={errors.password_confirmation?.message} />
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-3">
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
