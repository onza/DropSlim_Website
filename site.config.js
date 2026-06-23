/** Production URL — override via SITE_URL env at build time (no trailing slash). */
export const siteUrl = process.env.SITE_URL ?? 'https://dropslim.app'

export const site = {
  name: 'DropSlim',
  author: 'Martin Farkas',
  ogImage: 'dropslim-icon.png',
  twitterCard: 'summary',
}

/** DropSlim app repo — download URL resolved at build time via GitHub API. */
export const app = {
  repo: 'onza/DropSlim',
  fallback: {
    tag: 'v1.2.1',
    version: '1.2.1',
    url: 'https://github.com/onza/DropSlim/releases/download/v1.2.1/DropSlim_1.2.1_aarch64.dmg',
  },
}

/** @type {Record<string, import('./vite-plugins/seo.js').PageSeo>} */
export const pages = {
  'index.html': {
    lang: 'de',
    file: 'index.html',
    title: 'DropSlim — Bilder klein machen auf dem Mac',
    description:
      'DropSlim komprimiert Bilder auf dem Mac — lokal, schnell, per Drag & Drop. Kein Account, kein Server, kostenlos und Open Source.',
    keywords:
      'DropSlim, Bildkompression, macOS, JPEG, PNG, WebP, HEIC, AVIF, Drag and Drop, Bilder verkleinern, Open Source',
    robots: 'index, follow',
    ogType: 'website',
    ogLocale: 'de_DE',
    ogLocaleAlternate: 'en_US',
    hreflang: {
      de: 'index.html',
      en: 'en/index.html',
      'x-default': 'index.html',
    },
    sitemap: true,
    priority: 1,
  },
  'en/index.html': {
    lang: 'en',
    file: 'en/index.html',
    title: 'DropSlim — Shrink Images on Your Mac',
    description:
      'DropSlim compresses images on your Mac — local, fast, drag & drop. No account, no server, free and open source.',
    keywords:
      'DropSlim, image compression, macOS, JPEG, PNG, WebP, HEIC, AVIF, drag and drop, shrink images, open source',
    robots: 'index, follow',
    ogType: 'website',
    ogLocale: 'en_US',
    ogLocaleAlternate: 'de_DE',
    hreflang: {
      de: 'index.html',
      en: 'en/index.html',
      'x-default': 'index.html',
    },
    sitemap: true,
    priority: 1,
  },
  'impressum/index.html': {
    lang: 'de',
    file: 'impressum/index.html',
    title: 'Impressum · DropSlim',
    description: 'Impressum und Anbieterkennzeichnung der DropSlim Website.',
    keywords: 'DropSlim, Impressum',
    robots: 'noindex, follow',
    ogType: 'website',
    ogLocale: 'de_DE',
    hreflang: {
      de: 'impressum/index.html',
      en: 'legalnotice/index.html',
    },
    sitemap: false,
  },
  'legalnotice/index.html': {
    lang: 'en',
    file: 'legalnotice/index.html',
    title: 'Legal Notice · DropSlim',
    description: 'Legal notice and provider information for the DropSlim website.',
    keywords: 'DropSlim, legal notice',
    robots: 'noindex, follow',
    ogType: 'website',
    ogLocale: 'en_US',
    hreflang: {
      de: 'impressum/index.html',
      en: 'legalnotice/index.html',
    },
    sitemap: false,
  },
  'datenschutz/index.html': {
    lang: 'de',
    file: 'datenschutz/index.html',
    title: 'Datenschutz · DropSlim',
    description: 'Datenschutzerklärung der DropSlim Website.',
    keywords: 'DropSlim, Datenschutz, DSGVO',
    robots: 'noindex, follow',
    ogType: 'website',
    ogLocale: 'de_DE',
    hreflang: {
      de: 'datenschutz/index.html',
      en: 'privacypolicy/index.html',
    },
    sitemap: false,
  },
  'privacypolicy/index.html': {
    lang: 'en',
    file: 'privacypolicy/index.html',
    title: 'Privacy Policy · DropSlim',
    description: 'Privacy policy for the DropSlim website.',
    keywords: 'DropSlim, privacy policy, GDPR',
    robots: 'noindex, follow',
    ogType: 'website',
    ogLocale: 'en_US',
    hreflang: {
      de: 'datenschutz/index.html',
      en: 'privacypolicy/index.html',
    },
    sitemap: false,
  },
}
