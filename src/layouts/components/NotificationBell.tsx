import { useEffect, useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
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
import { useAuthStore } from '@/store/authStore';
import echo from '@/config/echo';

export const NotificationBell = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const direction = i18n.dir();
  const dateLocale = i18n.language.startsWith('ar') ? 'ar-EG' : 'en-US';
  const { ref: loadMoreRef, inView } = useInView();
  
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchInitial,
    fetchMore,
    markAsRead,
    addNotification,
    cursor
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen && inView && cursor && !isLoading) {
      fetchMore();
    }
  }, [cursor, fetchMore, inView, isLoading, isOpen]);

  useEffect(() => {
    if (user) {
      fetchInitial();

      // Listen for notifications
      const channelName = `admin.${user.id}`;
      echo.private(channelName)
        .notification((notification: any) => {
          addNotification({
            id: notification.id,
            type: notification.type,
            notifiable_type: 'App\\Models\\Admin',
            notifiable_id: user.id,
            data: notification,
            read_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        });

      return () => {
        echo.leave(channelName);
      };
    }
  }, [user]);

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead();
  };

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    setIsOpen(false);
    // Add routing logic here if notifications contain links or relate to specific entities
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
          {isLoading && notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-20" />
              {t('no_notifications')}
            </div>
          ) : (
            <div className="flex flex-col text-start" dir={direction}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex cursor-pointer flex-col items-stretch gap-1 border-b p-4 text-start text-sm transition-colors hover:bg-muted/50 ${
                    !notification.read_at ? 'bg-primary/5' : ''
                  }`}
                  dir={direction}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="font-medium [unicode-bidi:plaintext]" dir="auto">
                      {notification.data.title || t('notification')}
                    </span>
                    {!notification.read_at && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="line-clamp-2 text-start text-xs text-muted-foreground [unicode-bidi:plaintext]" dir="auto">
                    {notification.data.body}
                  </p>
                  <span className="mt-1 text-start text-[10px] text-muted-foreground/80">
                    {new Date(notification.created_at).toLocaleString(dateLocale)}
                  </span>
                </div>
              ))}
              
              {cursor && (
                <div
                  ref={loadMoreRef}
                  className="flex min-h-12 items-center justify-center border-t py-4 text-xs text-muted-foreground"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
