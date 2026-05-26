import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { NAVIGATION_ITEMS, type NavigationItem } from '@/config/navigation';

interface AppSidebarProps {
  appName: string;
  logoUrl?: string;
  user?: {
    name?: string;
    email?: string;
  } | null;
  onClose: () => void;
  onLogout: () => void;
}

const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-primary/10 text-primary shadow-sm'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  ].join(' ');

const isNavigationItemActive = (pathname: string, item: NavigationItem) =>
  pathname === item.to ||
  pathname.startsWith(`${item.to}/`) ||
  Boolean(item.children?.some((child) => isNavigationItemActive(pathname, child)));

export const AppSidebar = ({ appName, logoUrl, user, onClose, onLogout }: AppSidebarProps) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const activeGroups = NAVIGATION_ITEMS.reduce<Record<string, boolean>>((acc, item) => {
      if (item.children?.some((child) => isNavigationItemActive(pathname, child))) {
        acc[item.to] = true;
      }

      return acc;
    }, {});

    setOpenGroups((current) => ({ ...current, ...activeGroups }));
  }, [pathname]);

  const toggleGroup = (to: string) => {
    setOpenGroups((current) => ({ ...current, [to]: !current[to] }));
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const { to, labelKey, icon: Icon, permission, children } = item;
    const isGroup = Boolean(children?.length);
    const isActive = isNavigationItemActive(pathname, item);
    const isOpen = openGroups[to] || isActive;

    const content = isGroup ? (
      <li key={to}>
        <button
          type="button"
          className={[
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
            isActive
              ? 'bg-primary/10 text-primary shadow-sm'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          ].join(' ')}
          onClick={() => toggleGroup(to)}
          aria-expanded={isOpen}
          aria-label={t('toggle_menu_group', { item: t(labelKey) })}
        >
          <Icon
            className={[
              'h-[18px] w-[18px] transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
            ].join(' ')}
          />
          <span className="min-w-0 flex-1 truncate text-start">{t(labelKey)}</span>
          <ChevronDown
            className={[
              'h-4 w-4 shrink-0 transition-transform',
              isOpen ? 'rotate-180' : 'rotate-0',
            ].join(' ')}
          />
        </button>
        {isOpen && (
          <ul className="ms-5 mt-1.5 space-y-1 border-s border-border/60 ps-3">
            {children?.map((child) => renderNavigationItem(child))}
          </ul>
        )}
      </li>
    ) : (
      <li key={to}>
        <NavLink to={to} className={getNavLinkClassName} onClick={onClose}>
          {({ isActive: isLinkActive }) => (
            <>
              <Icon
                className={[
                  'h-[18px] w-[18px] transition-colors',
                  isLinkActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground',
                ].join(' ')}
              />
              <span className="truncate">{t(labelKey)}</span>
            </>
          )}
        </NavLink>
      </li>
    );

    return permission ? (
      <Can key={to} permission={permission}>
        {content}
      </Can>
    ) : (
      content
    );
  };

  return (
    <>
      <div className="flex h-[72px] items-center justify-between border-b border-border/40 bg-card px-5">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo
            appName={appName}
            logoUrl={logoUrl}
            className="h-8 max-w-36 shrink-0 object-contain drop-shadow-sm"
            fallbackClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20"
          />
          <h1 className="min-w-0 truncate text-lg font-bold tracking-tight text-foreground">
            {appName}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-secondary lg:hidden"
          onClick={onClose}
          aria-label={t('close_navigation')}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1.5">
          {NAVIGATION_ITEMS.map((item) => renderNavigationItem(item))}
        </ul>
      </nav>

      <div className="border-t border-border/40 bg-card/50 p-5">
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border/50 bg-secondary/40 p-3 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary ring-1 ring-primary/20">
            {(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.name || t('admins')}
            </p>
            <p className="truncate text-xs font-medium text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2.5 rounded-xl border-border/60 text-muted-foreground shadow-sm transition-all duration-200 hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {t('logout')}
        </Button>
      </div>
    </>
  );
};
