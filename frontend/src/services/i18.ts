import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en_translation.json";
import pt from "../locales/pt_translation.json";
import fr from "../locales/fr_translation.json";

const browserLanguage = navigator.language.slice(0, 2);

i18next.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    pt: {
      translation: pt,
    },
    fr: {
      translation: fr,
    }
  },

  lng: ["en", "pt", "fr"].includes(browserLanguage) ? browserLanguage : "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
