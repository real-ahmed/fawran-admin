import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@/hooks/useAppConfig';
import { AppSidebar } from '@/layouts/components/AppSidebar';
import { AppTopbar } from '@/layouts/components/AppTopbar';
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';

export const MainLayout = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { appName, appLogoUrl, appLogoWhiteUrl, appIconUrl } = useAppConfig();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useGlobalNotifications();

  const sidebarLogoUrl = appLogoUrl || appLogoWhiteUrl || appIconUrl;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebar = (
    <AppSidebar
      appName={appName}
      logoUrl={sidebarLogoUrl}
      user={user}
      onClose={closeSidebar}
      onLogout={handleLogout}
    />
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-background">
      {isSidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden transition-all"
          onClick={closeSidebar}
          aria-label={t('close_navigation')}
        />
      )}

      <aside className="hidden w-[280px] shrink-0 flex-col border-e border-border/60 bg-card shadow-sm lg:flex z-20">
        {sidebar}
      </aside>

      <aside
        className={[
          'fixed inset-y-0 start-0 z-40 flex w-[280px] max-w-[85vw] flex-col border-e border-border/60 bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
        ].join(' ')}
      >
        {sidebar}
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AppTopbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
