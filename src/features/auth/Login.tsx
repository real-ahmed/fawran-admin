import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
        
        toast.success(t('login_success') || 'Login successful');
        navigate('/dashboard');
      } else {
        setError(t('login_failed'));
        toast.error(t('login_failed'));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('login_failed');
      setError(errorMessage);
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
          {errors.email && (
            <p className="text-sm font-medium text-destructive mt-1.5">{errors.email.message}</p>
          )}
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
          {errors.password && (
            <p className="text-sm font-medium text-destructive mt-1.5">{errors.password.message}</p>
          )}
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
