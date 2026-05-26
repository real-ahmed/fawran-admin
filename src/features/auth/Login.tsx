import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/axios';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';

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
        
        navigate('/dashboard');
      } else {
        setError(t('login_failed'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">{t('signin')}</CardTitle>
        <CardDescription>
          {t('signin_desc')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              dir="ltr" // emails are always LTR
              placeholder="admin@fawran.test"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              dir="ltr" // passwords are LTR
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? t('signing_in') : t('signin')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
