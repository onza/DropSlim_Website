import Handlebars from 'handlebars'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { absUrl, escapeAttr } from './urls.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const includesDir = join(root, '_includes')

function registerPartials(dir, prefix = '') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      registerPartials(path, `${prefix}${entry.name}/`)
      continue
    }
    if (!entry.name.endsWith('.hbs')) continue
    const name = `${prefix}${entry.name.replace(/\.hbs$/, '')}`
    Handlebars.registerPartial(name, readFileSync(path, 'utf8'))
  }
}

registerPartials(includesDir)

Handlebars.registerHelper('escapeAttr', (value) => {
  return new Handlebars.SafeString(escapeAttr(value))
})
Handlebars.registerHelper('absUrl', absUrl)
Handlebars.registerHelper('withReleaseVersion', (text, version) => {
  if (!text || !version) return text
  const html = String(text).replace(
    /(<span data-release-version(?:="")?>)[^<]+(<\/span>)/,
    `$1${version}$2`,
  )
  return new Handlebars.SafeString(html)
})

const templates = new Map()

export function renderPage(name, data) {
  if (!templates.has(name)) {
    const path = join(includesDir, 'pages', `${name}.hbs`)
    templates.set(name, Handlebars.compile(readFileSync(path, 'utf8')))
  }
  return templates.get(name)(data)
}
