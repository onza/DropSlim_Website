import { loadArticle, loadHome, loadSite } from '../lib/locale-content.js'

export const LOCALES = [
  {
    id: 'de',
    hreflang: 'de',
    htmlLang: 'de',
    prefix: '',
    label: 'DE',
    name: 'Deutsch',
    ogLocale: 'de_DE',
    languageMenuAria: 'Sprache wählen',
  },
  {
    id: 'en',
    hreflang: 'en',
    htmlLang: 'en',
    prefix: 'en',
    label: 'EN',
    name: 'English',
    ogLocale: 'en_US',
    languageMenuAria: 'Choose language',
  },
  {
    id: 'fr',
    hreflang: 'fr',
    htmlLang: 'fr',
    prefix: 'fr',
    label: 'FR',
    name: 'Français',
    ogLocale: 'fr_FR',
    languageMenuAria: 'Choisir la langue',
  },
  {
    id: 'es',
    hreflang: 'es',
    htmlLang: 'es',
    prefix: 'es',
    label: 'ES',
    name: 'Español',
    ogLocale: 'es_ES',
    languageMenuAria: 'Elegir idioma',
  },
  {
    id: 'it',
    hreflang: 'it',
    htmlLang: 'it',
    prefix: 'it',
    label: 'IT',
    name: 'Italiano',
    ogLocale: 'it_IT',
    languageMenuAria: 'Scegli la lingua',
  },
  {
    id: 'ja',
    hreflang: 'ja',
    htmlLang: 'ja',
    prefix: 'ja',
    label: 'JA',
    name: '日本語',
    ogLocale: 'ja_JP',
    languageMenuAria: '言語を選択',
  },
  {
    id: 'pt-br',
    hreflang: 'pt-BR',
    htmlLang: 'pt-BR',
    prefix: 'pt-br',
    label: 'PT',
    name: 'Português (Brasil)',
    ogLocale: 'pt_BR',
    languageMenuAria: 'Escolher idioma',
  },
]

export function loadLocale(id) {
  const locale = loadSite(id)
  locale.home = loadHome(id)
  locale.legalArticle = loadArticle(id, 'legal')
  locale.privacyArticle = loadArticle(id, 'privacy')
  return locale
}

export function homePath(locale) {
  return locale.prefix ? `/${locale.prefix}/` : '/'
}

export function legalNoticePath(locale) {
  return locale.id === 'de' ? '/impressum/' : `/${locale.prefix}/legalnotice/`
}

export function privacyPath(locale) {
  return locale.id === 'de' ? '/datenschutz/' : `/${locale.prefix}/privacypolicy/`
}

export function pathFor(locale, kind) {
  if (kind === 'home') return homePath(locale)
  if (kind === 'legalnotice') return legalNoticePath(locale)
  return privacyPath(locale)
}

export function hreflangMap(kind) {
  const map = {}
  for (const locale of LOCALES) {
    map[locale.hreflang] = pathFor(locale, kind)
  }
  if (kind === 'home') map['x-default'] = homePath(LOCALES[0])
  return map
}
