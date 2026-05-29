import { type Ref } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppNotification } from '@/types/notification';

interface NotificationListProps {
  notifications: AppNotification[];
  isLoading: boolean;
  hasMore: boolean;
  loadMoreRef: Ref<HTMLDivElement>;
  direction: 'ltr' | 'rtl';
  dateLocale: string;
  onNotificationClick: (id: string) => void;
}

interface NotificationListItemProps {
  notification: AppNotification;
  direction: 'ltr' | 'rtl';
  dateLocale: string;
  onClick: (id: string) => void;
}

const NotificationListItem = ({
  notification,
  direction,
  dateLocale,
  onClick,
}: NotificationListItemProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={`flex cursor-pointer flex-col items-stretch gap-1 border-b p-4 text-start text-sm transition-colors hover:bg-muted/50 ${
        !notification.read_at ? 'bg-primary/5' : ''
      }`}
      dir={direction}
      onClick={() => onClick(notification.id)}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="font-medium [unicode-bidi:plaintext]" dir="auto">
          {notification.data.title || t('notification')}
        </span>
        {!notification.read_at && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
        )}
      </div>
      {(notification.data.body || notification.data.message) && (
        <p className="line-clamp-2 text-start text-xs text-muted-foreground [unicode-bidi:plaintext]" dir="auto">
          {notification.data.body || notification.data.message}
        </p>
      )}
      <span className="mt-1 text-start text-[10px] text-muted-foreground/80">
        {new Date(notification.created_at).toLocaleString(dateLocale)}
      </span>
    </div>
  );
};

export const NotificationList = ({
  notifications,
  isLoading,
  hasMore,
  loadMoreRef,
  direction,
  dateLocale,
  onNotificationClick,
}: NotificationListProps) => {
  const { t } = useTranslation();

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
        <Bell className="mb-2 h-8 w-8 opacity-20" />
        {t('no_notifications')}
      </div>
    );
  }

  return (
    <div className="flex flex-col text-start" dir={direction}>
      {notifications.map((notification) => (
        <NotificationListItem
          key={notification.id}
          notification={notification}
          direction={direction}
          dateLocale={dateLocale}
          onClick={onNotificationClick}
        />
      ))}

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex min-h-12 items-center justify-center border-t py-4 text-xs text-muted-foreground"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        </div>
      )}
    </div>
  );
};
