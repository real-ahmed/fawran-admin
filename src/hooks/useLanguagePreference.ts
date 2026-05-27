import { useTranslation } from 'react-i18next';
import apiClient from '@/config/axios';
import { useAuthStore } from '@/store/authStore';

export const useLanguagePreference = () => {
  const { t, i18n } = useTranslation();
  const token = useAuthStore((state) => state.token);

  const isEnglish = i18n.language.startsWith('en');
  const nextLanguage = isEnglish ? 'ar' : 'en';

  const toggleLanguage = () => {
    void i18n.changeLanguage(nextLanguage);

    if (!token) return;

    apiClient
      .put('/admin/profile/settings', {
        settings: [{ key: 'locale', value: nextLanguage }],
      })
      .catch((err) => console.error('Failed to update language on backend', err));
  };

  return {
    language: i18n.language,
    languageLabel: t(isEnglish ? 'language_ar' : 'language_en'),
    toggleLanguage,
  };
};
