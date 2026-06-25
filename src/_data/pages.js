import {
  LOCALES,
  homePath,
  hreflangMap,
  legalNoticePath,
  loadLocale,
  pathFor,
  privacyPath,
} from './locales.js'

const PAGE_KIND = {
  home: { seoKey: 'home', hreflangKind: 'home', indexable: true },
  legal: { seoKey: 'legalNotice', hreflangKind: 'legalnotice', indexable: false },
  privacy: { seoKey: 'privacy', hreflangKind: 'privacypolicy', indexable: false },
}

function seoBlock(meta, locale, kind) {
  const { seoKey, hreflangKind, indexable } = PAGE_KIND[kind]

  return {
    title: locale.seo[seoKey].title,
    description: locale.seo[seoKey].description,
    keywords: locale.seo[seoKey].keywords,
    robots: indexable ? 'index, follow' : 'noindex, follow',
    ogType: 'website',
    ogLocale: meta.ogLocale,
    ogLocaleAlternates: LOCALES.filter((locale) => locale.id !== meta.id).map(
      (locale) => locale.ogLocale,
    ),
    hreflang: hreflangMap(hreflangKind),
    sitemap: indexable,
    priority: indexable ? 1 : undefined,
  }
}

function langLinks(meta, kind) {
  const { hreflangKind } = PAGE_KIND[kind]
  return LOCALES.filter((locale) => locale.id !== meta.id).map((locale) => ({
    href: pathFor(locale, hreflangKind),
    hreflang: locale.hreflang,
    name: locale.name,
  }))
}

function buildEntry(meta, locale, kind) {
  const permalink =
    kind === 'home' ? homePath(meta) : kind === 'legal' ? legalNoticePath(meta) : privacyPath(meta)

  const entry = {
    permalink,
    locale: meta,
    localeId: meta.id,
    htmlLang: meta.htmlLang,
    paths: {
      home: homePath(meta),
      legalNotice: legalNoticePath(meta),
      privacy: privacyPath(meta),
    },
    showDownloadCta: kind === 'home',
    seo: seoBlock(meta, locale, kind),
    langLinks: langLinks(meta, kind),
    t: locale.strings,
  }

  if (kind === 'home') {
    entry.home = locale.home
    entry.demo = locale.demo
  } else {
    entry.articleHtml = kind === 'legal' ? locale.legalArticle : locale.privacyArticle
  }

  return entry
}

let cache

export default function () {
  if (cache) return cache

  const home = []
  const legal = []
  const privacy = []

  for (const meta of LOCALES) {
    const locale = loadLocale(meta.id)
    home.push(buildEntry(meta, locale, 'home'))
    legal.push(buildEntry(meta, locale, 'legal'))
    privacy.push(buildEntry(meta, locale, 'privacy'))
  }

  cache = { home, legal, privacy }
  return cache
}
