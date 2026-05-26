import { useState } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
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
  Menu,
  X,
  Languages,
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
    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
  ].join(' ');

export const MainLayout = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { appName, appLogoWhiteUrl, appLogoUrl, appIconUrl } = useAppConfig();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarLogoUrl = appLogoWhiteUrl || appLogoUrl || appIconUrl;

  const currentPage = navigationItems
    .filter((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];

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

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border bg-primary px-4 text-primary-foreground">
        <div className="flex min-w-0 items-center gap-3">
          {sidebarLogoUrl ? (
            <img
              src={sidebarLogoUrl}
              alt={appName}
              className="h-10 max-w-36 shrink-0 object-contain"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-foreground/15 text-sm font-bold ring-1 ring-primary-foreground/20">
              {appName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">{appName}</h1>
            <p className="text-xs text-primary-foreground/75">{t('overview')}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden"
          onClick={closeSidebar}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigationItems.map(({ to, labelKey, icon: Icon, permission }) => {
            const item = (
              <li key={to}>
                <NavLink to={to} className={getNavLinkClassName} onClick={closeSidebar}>
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{t(labelKey)}</span>
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

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/70 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
            {(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user?.name || t('admins')}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {isSidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={closeSidebar}
          aria-label="Close navigation overlay"
        />
      )}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {sidebarContent}
      </aside>

      <aside
        className={[
          'fixed inset-y-0 start-0 z-40 flex w-72 max-w-[82vw] flex-col border-e border-border bg-card shadow-xl transition-transform duration-200 lg:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
        ].join(' ')}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">
                {t(currentPage?.labelKey || 'overview')}
              </h2>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {location.pathname}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={toggleLanguage} className="gap-2 text-sm font-medium">
              <Languages className="h-4 w-4" />
              {i18n.language.startsWith('en') ? 'العربية' : 'English'}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
