import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationList } from './NotificationList';

export const NotificationBell = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const direction = i18n.dir();
  const { ref: loadMoreRef, inView } = useInView();
  
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchMore,
    markAsRead,
    cursor
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen && inView && cursor && !isLoading) {
      fetchMore();
    }
  }, [cursor, fetchMore, inView, isLoading, isOpen]);

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead();
  };

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} dir={direction}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full border-border/60 shadow-sm"
          aria-label={t('notifications')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)] p-0 text-start" align="end" dir={direction}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">{t('notifications')}</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Check className="me-1 h-3 w-3" />
              {t('mark_all_read')}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]" dir={direction}>
          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            hasMore={Boolean(cursor)}
            loadMoreRef={loadMoreRef}
            direction={direction}
            onNotificationClick={handleNotificationClick}
          />
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
