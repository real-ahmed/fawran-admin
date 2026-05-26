import { Languages, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useLanguagePreference } from '@/hooks/useLanguagePreference';

interface AppTopbarProps {
  onOpenSidebar: () => void;
}

export const AppTopbar = ({ onOpenSidebar }: AppTopbarProps) => {
  const { t } = useTranslation();
  const { languageLabel, toggleLanguage } = useLanguagePreference();

  return (
    <header className="sticky top-0 z-10 flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-background/80 px-5 backdrop-blur-md lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg border-border/60 lg:hidden"
          onClick={onOpenSidebar}
          aria-label={t('open_navigation')}
        >
          <Menu className="h-5 w-5 text-foreground" />
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={toggleLanguage}
        className="gap-2 rounded-full border-border/60 text-sm font-semibold shadow-sm ms-auto"
      >
        <Languages className="h-4 w-4" />
        {languageLabel}
      </Button>
    </header>
  );
};
