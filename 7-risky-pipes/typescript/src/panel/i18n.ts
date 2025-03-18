import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {en, es} from "./locale/translations";
i18n.use(initReactI18next).init({
  resources: {
    en,
    es,
  },
  lng: "en",
});
