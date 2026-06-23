import { writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { pageAbsUrl } from '../lib/page-path.js'
import { pages, site, siteUrl } from '../site.config.js'

const SEO_MARKER = '<!-- seo -->'

/**
 * @typedef {object} PageSeo
 * @property {string} lang
 * @property {string} file
 * @property {string} title
 * @property {string} description
 * @property {string} keywords
 * @property {string} robots
 * @property {string} ogType
 * @property {string} ogLocale
 * @property {string} [ogLocaleAlternate]
 * @property {Record<string, string>} hreflang
 * @property {boolean} [sitemap]
 * @property {number} [priority]
 */

function escapeAttr(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function absUrl(path) {
  return pageAbsUrl(siteUrl, path)
}

/** @param {PageSeo} page */
function renderSeoBlock(page) {
  const canonical = absUrl(page.file)
  const ogImage = absUrl(site.ogImage)
  const lines = [
    `<meta name="description" content="${escapeAttr(page.description)}" />`,
    `<meta name="keywords" content="${escapeAttr(page.keywords)}" />`,
    `<meta name="author" content="${escapeAttr(site.author)}" />`,
    `<meta name="robots" content="${page.robots}" />`,
    `<meta name="application-name" content="${escapeAttr(site.name)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
  ]

  for (const [lang, path] of Object.entries(page.hreflang)) {
    lines.push(`<link rel="alternate" hreflang="${lang}" href="${absUrl(path)}" />`)
  }

  lines.push(
    `<meta property="og:type" content="${page.ogType}" />`,
    `<meta property="og:site_name" content="${escapeAttr(site.name)}" />`,
    `<meta property="og:title" content="${escapeAttr(page.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(page.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:locale" content="${page.ogLocale}" />`,
  )

  if (page.ogLocaleAlternate) {
    lines.push(`<meta property="og:locale:alternate" content="${page.ogLocaleAlternate}" />`)
  }

  lines.push(
    `<meta name="twitter:card" content="${site.twitterCard}" />`,
    `<meta name="twitter:title" content="${escapeAttr(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(page.description)}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
  )

  return lines.map((line) => `    ${line}`).join('\n')
}

function writeRobots(distDir) {
  const body = `User-agent: *
Allow: /
Disallow: /assets/

Sitemap: ${absUrl('sitemap.xml')}
`
  writeFileSync(resolve(distDir, 'robots.txt'), body)
}

function writeSitemap(distDir) {
  const entries = Object.values(pages).filter((page) => page.sitemap)
  const urls = entries
    .map((page) => {
      const loc = absUrl(page.file)
      const hreflangLinks = Object.entries(page.hreflang)
        .map(
          ([lang, path]) =>
            `    <xhtml:link rel="alternate" hreflang="${lang}" href="${absUrl(path)}" />`,
        )
        .join('\n')
      return `  <url>
    <loc>${loc}</loc>
${hreflangLinks}
    <changefreq>monthly</changefreq>
    <priority>${page.priority ?? 0.8}</priority>
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
  writeFileSync(resolve(distDir, 'sitemap.xml'), xml)
}

export function seoPlugin() {
  /** @type {string} */
  let outDir = 'dist'
  /** @type {string} */
  let root = process.cwd()

  return {
    name: 'seo',
    configResolved(config) {
      root = config.root
      outDir = resolve(config.root, config.build.outDir)
    },
    transformIndexHtml(html, ctx) {
      const file = relative(root, ctx.filename).replace(/\\/g, '/')
      const page = pages[file]
      if (!page) return html

      let out = html

      if (out.includes(SEO_MARKER)) {
        out = out.replace(`    ${SEO_MARKER}`, renderSeoBlock(page))
      }

      out = out.replace(/<html lang="[^"]*">/, `<html lang="${page.lang}">`)
      out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(page.title)}</title>`)

      return out
    },
    closeBundle() {
      const distDir = resolve(outDir)
      writeRobots(distDir)
      writeSitemap(distDir)
    },
  }
}
