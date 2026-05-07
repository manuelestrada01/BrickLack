import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'

i18next
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string) => import(`./locales/${language}.json`)))
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pt', 'de', 'fr'],
    defaultNS: 'translation',
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'bricklack_lang',
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18next
