import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from "../locales/en/translation.json";
import arTranslations from "../locales/ar/translation.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

// Set initial direction
document.documentElement.dir = i18n.dir(i18n.language);
document.documentElement.lang = i18n.language;

// Handle RTL/LTR direction based on language
i18n.on("languageChanged", (lng) => {
  document.documentElement.dir = i18n.dir(lng);
  document.documentElement.lang = lng;
});

export default i18n;
