import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';

const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('medora-app-language');
    if (saved && ['en', 'ta', 'te', 'ml', 'kn', 'hi'].includes(saved)) {
      return saved;
    }
  }
  return 'en';
};

const initialLang = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
      kn: { translation: kn },
      ml: { translation: ml },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
