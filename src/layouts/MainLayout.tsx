import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  LayoutDashboard,
  Users,
  Store,
  Truck,
  Package,
  Settings,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@/hooks/useAppConfig';
import apiClient from '@/config/axios';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/config/permissions';
import type { PermissionRequirement } from '@/utils/access';

interface NavigationItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  permission?: PermissionRequirement;
}

const navigationItems: NavigationItem[] = [
  { to: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { to: '/admins', labelKey: 'admins', icon: Users, permission: PERMISSIONS.VIEW_ADMINS },
  { to: '/vendors', labelKey: 'vendors', icon: Store, permission: PERMISSIONS.VIEW_VENDORS },
  { to: '/couriers', labelKey: 'couriers', icon: Truck, permission: PERMISSIONS.VIEW_COURIERS },
  {
    to: '/catalog',
    labelKey: 'catalog',
    icon: Package,
    permission: [
      PERMISSIONS.VIEW_CATEGORIES,
      PERMISSIONS.VIEW_BRANDS,
      PERMISSIONS.VIEW_MASTER_PRODUCTS,
    ],
  },
  { to: '/finances', labelKey: 'finances', icon: CreditCard, permission: PERMISSIONS.VIEW_FINANCES },
  {
    to: '/settings',
    labelKey: 'settings',
    icon: Settings,
    permission: PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
  },
];

const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
    isActive
      ? 'bg-secondary text-foreground'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  ].join(' ');

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
            {navigationItems.map(({ to, labelKey, icon: Icon, permission }) => {
              const item = (
                <li key={to}>
                  <NavLink to={to} className={getNavLinkClassName}>
                    <Icon className="h-4 w-4" />
                    {t(labelKey)}
                  </NavLink>
                </li>
              );

              return permission ? (
                <Can key={to} permission={permission}>
                  {item}
                </Can>
              ) : (
                item
              );
            })}
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
