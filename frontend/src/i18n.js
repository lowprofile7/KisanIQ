import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hi from './locales/hi.json'
import mr from './locales/mr.json'

export const LANGUAGE_STORAGE_KEY = 'kisanIqLanguage'
export const supportedLanguages = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
]

const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
const initialLanguage = supportedLanguages.some(({ code }) => code === savedLanguage)
  ? savedLanguage
  : 'en'

export const i18nReady = i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, mr: { translation: mr } },
  lng: initialLanguage,
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: { escapeValue: false },
  returnNull: false,
})

export default i18n
