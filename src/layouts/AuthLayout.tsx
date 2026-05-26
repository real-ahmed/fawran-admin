import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/config/axios';
import { Languages } from 'lucide-react';

export const AuthLayout = () => {
  const { t, i18n } = useTranslation();
  const { appName, appLogoWhiteUrl, appLogoUrl, appIconUrl } = useAppConfig();
  const token = useAuthStore((state) => state.token);
  const authLogoUrl = appLogoWhiteUrl || appLogoUrl || appIconUrl;

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
    
    if (token) {
      apiClient.put('/admin/profile/settings', {
        settings: [{ key: 'language', value: nextLang }]
      }).catch(err => console.error('Failed to update language on backend', err));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-56 bg-primary" />
      <div className="absolute start-4 top-4 z-10">
        <Button
          variant="secondary"
          onClick={toggleLanguage}
          className="gap-2 bg-primary-foreground/95 text-sm font-medium text-primary hover:bg-primary-foreground"
        >
          <Languages className="h-4 w-4" />
          {i18n.language.startsWith('en') ? 'العربية' : 'English'}
        </Button>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center text-primary-foreground">
          {authLogoUrl ? (
            <img
              src={authLogoUrl}
              alt={appName}
              className="mx-auto mb-4 h-16 max-w-52 object-contain"
            />
          ) : (
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary-foreground/15 text-xl font-bold ring-1 ring-primary-foreground/25">
              {appName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <h1 className="text-3xl font-bold">{appName}</h1>
          <p className="mt-2 text-sm text-primary-foreground/75">{t('signin_desc')}</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
