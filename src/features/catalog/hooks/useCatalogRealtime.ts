import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import echo from '@/config/echo';
import { useAuthStore } from '@/store/authStore';
import type {
  BrandSubmittedEvent,
  CategorySubmittedEvent,
  CatalogResourceKey,
  MasterProductSubmittedEvent,
} from '@/types/catalog';

export const useCatalogRealtime = (enabled: boolean) => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const { t } = useTranslation();

  useEffect(() => {
    if (!enabled || !userId) return undefined;

    const invalidate = (resource: CatalogResourceKey, message?: string) => {
      toast.success(message || t('catalog_submission_received'));
      queryClient.invalidateQueries({ queryKey: ['catalog', resource] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const channel = echo.private(`admin.${userId}`);

    channel.listen('.BrandSubmitted', (payload: BrandSubmittedEvent) => {
      invalidate('brands', payload.message);
    });

    channel.listen('.CategorySubmitted', (payload: CategorySubmittedEvent) => {
      invalidate('categories', payload.message);
    });

    channel.listen('.MasterProductSubmitted', (payload: MasterProductSubmittedEvent) => {
      invalidate('master-products', payload.message);
    });

    return () => {
      channel.stopListening('.BrandSubmitted');
      channel.stopListening('.CategorySubmitted');
      channel.stopListening('.MasterProductSubmitted');
    };
  }, [enabled, queryClient, t, userId]);
};
