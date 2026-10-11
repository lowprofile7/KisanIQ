import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import i18n, { i18nReady } from './i18n'
import './index.css'
import App from './App.jsx'

await i18nReady

document.documentElement.lang = i18n.resolvedLanguage || 'en'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
