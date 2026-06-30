import Ajv from 'ajv'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as loadYaml } from 'js-yaml'
import siteSchema from '../schemas/site.schema.json' with { type: 'json' }
import pagesData from '../src/_data/pages.js'
import site from '../src/_data/site.js'
import { LOCALES, loadLocale } from '../src/_data/locales.js'
import { renderPage } from '../src/lib/handlebars.js'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = join(rootDir, 'locales')

const REQUIRED_STRING_KEYS = [
  'skipToContent',
  'download',
  'downloadForMacos',
  'downloadForWindows',
  'legalNotice',
  'privacyPolicy',
]

const ajv = new Ajv({ allErrors: true })
const validateSiteYaml = ajv.compile(siteSchema)

const pages = pagesData()
const release = site.app.fallback

let failed = false

function fail(message) {
  console.error(message)
  failed = true
}

for (const meta of LOCALES) {
  const sitePath = join(localesDir, meta.id, 'site.yaml')
  if (!existsSync(sitePath)) {
    fail(`[verify] ${meta.id}: missing locales/${meta.id}/site.yaml`)
    continue
  }

  const siteYaml = loadYaml(readFileSync(sitePath, 'utf8'))
  if (!validateSiteYaml(siteYaml)) {
    for (const error of validateSiteYaml.errors ?? []) {
      fail(`[verify] ${meta.id}/site.yaml: ${error.instancePath || '/'} ${error.message}`)
    }
  }

  const locale = loadLocale(meta.id)

  for (const key of REQUIRED_STRING_KEYS) {
    if (!locale.strings[key]?.trim()) {
      fail(`[verify] ${meta.id}: missing strings.${key}`)
    }
  }

  if (!locale.home?.heroTag || !locale.home?.heroTitleHtml) {
    fail(`[verify] ${meta.id}: incomplete home hero`)
  }

  if (!locale.seo?.home?.title || !locale.seo?.legalNotice?.title || !locale.seo?.privacy?.title) {
    fail(`[verify] ${meta.id}: incomplete seo`)
  }

  for (const name of ['legal', 'privacy', 'home']) {
    const path = join(localesDir, meta.id, `${name}.md`)
    if (!existsSync(path)) {
      fail(`[verify] ${meta.id}: missing locales/${meta.id}/${name}.md`)
    }
  }

  if (!locale.legalArticle?.includes('<h1')) {
    fail(`[verify] ${meta.id}: missing legalArticle`)
  }

  if (!locale.privacyArticle?.includes('<h1')) {
    fail(`[verify] ${meta.id}: missing privacyArticle`)
  }

  if (!locale.home?.features?.length) {
    fail(`[verify] ${meta.id}: missing home features`)
  }

  if (!locale.demo?.rows?.length) {
    fail(`[verify] ${meta.id}: missing demo rows`)
  }

  for (const [label, template, list] of [
    ['home', 'home', pages.home],
    ['legal', 'article', pages.legal],
    ['privacy', 'article', pages.privacy],
  ]) {
    const entry = list.find((page) => page.localeId === meta.id)
    const html = renderPage(template, {
      ...entry,
      site,
      release: label === 'home' ? release : undefined,
    })

    if (label === 'home') {
      if (!html.includes("data-release-download='macos'")) {
        fail(`[verify] ${meta.id}/${label}: macOS download missing`)
      }
      if (!html.includes("data-release-download='windows'")) {
        fail(`[verify] ${meta.id}/${label}: Windows download missing`)
      }
    }

    if (!html.includes('lang-dropdown')) {
      fail(`[verify] ${meta.id}/${label}: lang switch missing`)
    }
    if (!html.includes("rel='canonical'") && !html.includes('rel="canonical"')) {
      fail(`[verify] ${meta.id}/${label}: canonical missing`)
    }
    if (!html.includes(`lang="${meta.htmlLang}"`)) {
      fail(`[verify] ${meta.id}/${label}: html lang mismatch`)
    }
  }
}

if (failed) {
  process.exitCode = 1
  console.error('[verify] locale checks failed')
} else {
  console.info(`[verify] ${LOCALES.length} locales OK`)
}
