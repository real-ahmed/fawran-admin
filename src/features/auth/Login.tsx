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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="w-full border-border/80 shadow-xl shadow-foreground/5">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">{t('signin')}</CardTitle>
        <CardDescription>
          {t('signin_desc')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                dir="ltr"
                placeholder="admin@fawran.test"
                className="ps-9"
                autoComplete="email"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                dir="ltr"
                className="ps-9"
                autoComplete="current-password"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t('signing_in') : t('signin')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
