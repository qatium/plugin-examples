import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, es, pt } from "./locale/translations";
const localeLang = navigator.language.split("-")[0];
const supportedLanguages = ["en", "es", "pt"];
const defaultLanguage = supportedLanguages.includes(localeLang)
  ? localeLang
  : "en";

i18n.use(initReactI18next).init({
  resources: {
    en,
    es,
    pt
  },
  lng: defaultLanguage
});
