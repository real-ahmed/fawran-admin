import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/config/axios';

export const AuthLayout = () => {
  const { i18n } = useTranslation();
  const { appName } = useAppConfig();
  const token = useAuthStore((state) => state.token);

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
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 relative">
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
        <Button variant="ghost" onClick={toggleLanguage} className="text-sm font-medium">
          {i18n.language.startsWith('en') ? 'العربية' : 'English'}
        </Button>
      </div>
      <div className="w-full max-w-md p-4">
        <div className="flex flex-col items-center mb-8">
          {/* Logo or Brand Name can be dynamic later */}
          <h1 className="text-3xl font-bold text-primary">{appName}</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
