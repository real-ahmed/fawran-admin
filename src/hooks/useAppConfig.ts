import { useQuery } from '@tanstack/react-query';
import apiClient from '@/config/axios';
import { useTranslation } from 'react-i18next';

interface AppConfig {
  app_name: string;
  app_icon: string;
  favicon: string;
}

export const useAppConfig = () => {
  const { i18n } = useTranslation();
  
  const query = useQuery({
    queryKey: ['appConfig'],
    queryFn: async () => {
      const { data } = await apiClient.get('/public/app-config');
      return data?.data as AppConfig;
    },
    staleTime: Infinity, // don't refetch often
  });

  // Helper to get localized name
  const getLocalizedAppName = (fallback = 'Fawran Admin') => {
    if (!query.data?.app_name) return fallback;
    
    try {
      const parsedName = JSON.parse(query.data.app_name);
      const currentLang = i18n.language.startsWith('ar') ? 'ar' : 'en';
      return parsedName[currentLang] || parsedName.en || fallback;
    } catch (e) {
      // If it's not JSON, just return the string
      return query.data.app_name || fallback;
    }
  };

  return {
    ...query,
    appName: getLocalizedAppName(),
  };
};
