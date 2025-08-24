import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import translationCS from "./locales/cs/translation.json";
import translationEN from "./locales/en/translation.json";
import translationSK from "./locales/sk/translation.json";

const resources = {
  en: {
    translation: translationEN,
  },
  cs: {
    translation: translationCS,
  },
  sk: {
    translation: translationSK,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "cs", // default language
    fallbackLng: "en", // fallback language if translation is missing

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;