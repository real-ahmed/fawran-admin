import { NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { NAVIGATION_ITEMS } from '@/config/navigation';

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

export const AppSidebar = ({ appName, logoUrl, user, onClose, onLogout }: AppSidebarProps) => {
  const { t } = useTranslation();

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
          {NAVIGATION_ITEMS.map(({ to, labelKey, icon: Icon, permission }) => {
            const item = (
              <li key={to}>
                <NavLink to={to} className={getNavLinkClassName} onClick={onClose}>
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={[
                          'h-[18px] w-[18px] transition-colors',
                          isActive
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
                {item}
              </Can>
            ) : (
              item
            );
          })}
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
