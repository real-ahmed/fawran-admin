import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAppConfig } from '@/hooks/useAppConfig';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/config/axios';
import { Languages, ShieldCheck } from 'lucide-react';

export const AuthLayout = () => {
  const { t, i18n } = useTranslation();
  const { appName, appLogoWhiteUrl, appLogoUrl, appIconUrl } = useAppConfig();
  const token = useAuthStore((state) => state.token);
  
  // Prefer white logo for the dark primary left panel
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
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left panel - Branding (Hidden on mobile, 50% on lg) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-primary relative overflow-hidden p-12 text-primary-foreground shadow-2xl z-20">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
           <div className="absolute -start-10 -top-10 h-64 w-64 rounded-full bg-white blur-[80px]"></div>
           <div className="absolute -bottom-20 -end-20 h-96 w-96 rounded-full bg-white blur-[100px]"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          {authLogoUrl ? (
            <img src={authLogoUrl} alt={appName} className="h-10 object-contain drop-shadow-md" />
          ) : (
            <ShieldCheck className="h-10 w-10" />
          )}
          <span className="text-xl font-bold tracking-tight">{appName}</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            {t('welcome_desc', { appName: appName })}
          </h1>
          <p className="text-lg opacity-85 leading-relaxed">
            {t('dashboard_subtitle')}
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-60 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} {appName}. All rights reserved.
        </div>
      </div>

      {/* Right panel - Form (100% on mobile, 50% on lg) */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 relative bg-card z-10">
        
        {/* Language switcher top right */}
        <div className="absolute top-6 end-6">
          <Button
            variant="ghost"
            onClick={toggleLanguage}
            className="gap-2 text-muted-foreground hover:text-foreground font-medium rounded-full"
          >
            <Languages className="h-4 w-4" />
            {i18n.language.startsWith('en') ? 'العربية' : 'English'}
          </Button>
        </div>

        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            {appLogoUrl || authLogoUrl ? (
              <img src={appLogoUrl || authLogoUrl || ''} alt={appName} className="h-14 object-contain drop-shadow-sm" />
            ) : (
              <ShieldCheck className="h-12 w-12 text-primary" />
            )}
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};
