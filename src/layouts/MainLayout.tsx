import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Users, Store, Truck, Package, Settings, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@/hooks/useAppConfig';
import apiClient from '@/config/axios';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';

export const MainLayout = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { appName } = useAppConfig();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
    
    // Save to backend settings
    apiClient.put('/admin/profile/settings', {
      settings: [{ key: 'language', value: nextLang }]
    }).catch(err => console.error('Failed to update language on backend', err));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary/10">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border bg-primary text-primary-foreground">
          <h1 className="text-xl font-bold truncate">{appName}</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary text-foreground">
                <LayoutDashboard className="h-4 w-4" />
                {t('dashboard')}
              </Link>
            </li>
            <Can permission={PERMISSIONS.VIEW_ADMINS}>
              <li>
                <Link to="/admins" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {t('admins')}
                </Link>
              </li>
            </Can>
            <Can permission={PERMISSIONS.VIEW_VENDORS}>
              <li>
                <Link to="/vendors" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary text-muted-foreground">
                  <Store className="h-4 w-4" />
                  {t('vendors')}
                </Link>
              </li>
            </Can>
            <Can permission={PERMISSIONS.VIEW_COURIERS}>
              <li>
                <Link to="/couriers" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  {t('couriers')}
                </Link>
              </li>
            </Can>
            <Can permission={[PERMISSIONS.VIEW_CATEGORIES, PERMISSIONS.VIEW_BRANDS, PERMISSIONS.VIEW_MASTER_PRODUCTS]}>
              <li>
                <Link to="/catalog" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {t('catalog')}
                </Link>
              </li>
            </Can>
            <Can permission={PERMISSIONS.VIEW_FINANCES}>
              <li>
                <Link to="/finances" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  {t('finances')}
                </Link>
              </li>
            </Can>
            <Can permission={PERMISSIONS.MANAGE_SYSTEM_SETTINGS}>
              <li>
                <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary text-muted-foreground">
                  <Settings className="h-4 w-4" />
                  {t('settings')}
                </Link>
              </li>
            </Can>
          </ul>
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">{t('overview')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={toggleLanguage} className="text-sm font-medium text-muted-foreground">
              {i18n.language.startsWith('en') ? 'العربية' : 'English'}
            </Button>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
