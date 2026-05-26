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
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group',
    isActive
      ? 'bg-primary/10 text-primary shadow-sm'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  ].join(' ');

export const MainLayout = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { appName, appLogoUrl, appLogoWhiteUrl, appIconUrl } = useAppConfig();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Prefer normal logo on light sidebar background
  const sidebarLogoUrl = appLogoUrl || appLogoWhiteUrl || appIconUrl;

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
      <div className="flex h-[72px] items-center justify-between border-b border-border/40 bg-card px-5">
        <div className="flex min-w-0 items-center gap-3">
          {sidebarLogoUrl ? (
            <img
              src={sidebarLogoUrl}
              alt={appName}
              className="h-8 max-w-36 shrink-0 object-contain drop-shadow-sm"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20">
              {appName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground">{appName}</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-secondary lg:hidden"
          onClick={closeSidebar}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1.5">
          {navigationItems.map(({ to, labelKey, icon: Icon, permission }) => {
            const item = (
              <li key={to}>
                <NavLink to={to} className={getNavLinkClassName} onClick={closeSidebar}>
                  {({ isActive }) => (
                    <>
                      <Icon className={['h-[18px] w-[18px] transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'].join(' ')} />
                      <span className="truncate">{t(labelKey)}</span>
                    </>
                  )}
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

      <div className="border-t border-border/40 p-5 bg-card/50">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border/50 bg-secondary/40 p-3 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary ring-1 ring-primary/20">
            {(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{user?.name || t('admins')}</p>
            <p className="truncate text-xs font-medium text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2.5 rounded-xl border-border/60 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200 shadow-sm" 
          onClick={handleLogout}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {t('logout')}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-background">
      {isSidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden transition-all"
          onClick={closeSidebar}
          aria-label="Close navigation overlay"
        />
      )}

      <aside className="hidden w-[280px] shrink-0 flex-col border-e border-border/60 bg-card shadow-sm lg:flex z-20">
        {sidebarContent}
      </aside>

      <aside
        className={[
          'fixed inset-y-0 start-0 z-40 flex w-[280px] max-w-[85vw] flex-col border-e border-border/60 bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
        ].join(' ')}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-background/80 px-5 lg:px-8 backdrop-blur-md sticky top-0 z-10">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden rounded-lg border-border/60"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </Button>
            <div className="min-w-0 hidden sm:block">
              <h2 className="truncate text-xl font-bold tracking-tight text-foreground">
                {t(currentPage?.labelKey || 'overview')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={toggleLanguage} 
              className="gap-2 text-sm font-semibold rounded-full border-border/60 shadow-sm"
            >
              <Languages className="h-4 w-4" />
              {i18n.language.startsWith('en') ? 'العربية' : 'English'}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {/* For mobile screens, show the title here since we hide it in header */}
            <div className="sm:hidden mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {t(currentPage?.labelKey || 'overview')}
              </h2>
            </div>
            
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
