import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { isAxiosError } from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/axios';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AlertCircle, Loader2, Lock, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { applyApiValidationErrors } from '@/utils/api';
import { FormFieldError } from '@/components/FormFieldError';

const getLoginErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!isAxiosError(error)) return fallbackMessage;

  const data = error.response?.data;

  if (error.response?.status === 401 || error.response?.status === 422) {
    return data?.message || fallbackMessage;
  }

  if (data?.errors && typeof data.errors === 'object') {
    const firstError = Object.values(data.errors)[0];

    if (Array.isArray(firstError) && typeof firstError[0] === 'string') {
      return firstError[0];
    }
  }

  return data?.message || fallbackMessage;
};

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // We define the schema inside the component so we can use t() for messages
  const loginSchema = z.object({
    email: z.string().email(t('invalid_email')),
    password: z.string().min(6, t('invalid_password')),
  });

  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      // Make login request
      const response = await apiClient.post('/admin/login', data);
      
      const token = response.data?.data?.access_token;
      
      if (token) {
        setToken(token);
        
        // Fetch user profile and permissions
        const meResponse = await apiClient.get('/admin/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        
        const userData = meResponse.data?.data || meResponse.data;
        const permissions = meResponse.data?.data?.permissions || meResponse.data?.permissions || [];
        setUser(userData, permissions);
        
        toast.success(t('login_success'));
        navigate('/dashboard');
      } else {
        setError(t('login_failed'));
        toast.error(t('login_failed'));
      }
    } catch (err) {
      const hasFieldErrors = applyApiValidationErrors<LoginForm>(err, setFieldError);
      const errorMessage = getLoginErrorMessage(err, t('login_failed'));

      setError(hasFieldErrors ? '' : errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 lg:text-start text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">{t('signin')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('signin_desc')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive shadow-sm animate-in fade-in zoom-in-95">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">{t('email')}</Label>
          <div className="relative group">
            <Mail className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="email"
              type="email"
              dir="ltr"
              placeholder="admin@fawran.test"
              className="ps-11 h-12 bg-muted/40 focus:bg-background transition-colors rounded-xl border-border/60 hover:border-border"
              autoComplete="email"
              {...register('email')}
            />
          </div>
          <FormFieldError message={errors.email?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">{t('password')}</Label>
          <div className="relative group">
            <Lock className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              id="password"
              type="password"
              dir="ltr"
              className="ps-11 h-12 bg-muted/40 focus:bg-background transition-colors rounded-xl border-border/60 hover:border-border"
              autoComplete="current-password"
              {...register('password')}
            />
          </div>
          <FormFieldError message={errors.password?.message} />
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full h-12 mt-2 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading && <Loader2 className="me-2 h-5 w-5 animate-spin" />}
          {loading ? t('signing_in') : t('signin')}
        </Button>
      </form>
    </div>
  );
};
