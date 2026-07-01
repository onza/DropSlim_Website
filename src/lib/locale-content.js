import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as loadYaml } from 'js-yaml'
import { renderInline, renderMarkdown } from './markdown.js'

const localesDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'locales')

function localePath(id, ...parts) {
  return join(localesDir, id, ...parts)
}

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    throw new Error('Expected YAML front matter wrapped in ---')
  }

  const data = loadYaml(match[1])
  return { data, content: match[2] }
}

export function loadSite(id) {
  const path = localePath(id, 'site.yaml')
  if (!existsSync(path)) {
    throw new Error(`Missing locale config: locales/${id}/site.yaml`)
  }
  return loadYaml(readFileSync(path, 'utf8'))
}

export function loadHome(id) {
  const path = localePath(id, 'home.md')
  if (!existsSync(path)) {
    throw new Error(`Missing locale home content: locales/${id}/home.md`)
  }

  const { data, content } = parseFrontMatter(readFileSync(path, 'utf8'))
  const features = (data.features ?? []).map((feature) => ({
    num: feature.num,
    title: feature.title,
    body: feature.rich ? renderMarkdown(feature.body) : feature.body,
    html: Boolean(feature.rich),
  }))

  return {
    heroTag: data.heroTag,
    heroTitleHtml: String(data.heroTitle)
      .trim()
      .split('\n')
      .map((line) => renderInline(line))
      .join('<br>\n'),
    heroSubHtml: renderMarkdown(String(data.heroSub).trim()),
    lessVolume: data.lessVolume,
    whyHeading: data.whyHeading,
    compareBeforeAria: data.compareBeforeAria,
    compareAfterAria: data.compareAfterAria,
    before: data.before,
    after: data.after,
    compareBeforeDesc: data.compareBeforeDesc,
    compareAfterDesc: data.compareAfterDesc,
    pitchHtml: renderMarkdown(content.trim()),
    features,
  }
}

export function loadArticle(id, name) {
  const path = localePath(id, `${name}.md`)
  if (!existsSync(path)) {
    throw new Error(`Missing locale article: locales/${id}/${name}.md`)
  }
  return renderMarkdown(readFileSync(path, 'utf8'))
}

function enrichInstallPanel(panel) {
  if (!panel) return panel
  return {
    ...panel,
    noteHtml: panel.note ? renderMarkdown(String(panel.note).trim()) : '',
  }
}

export function enrichInstall(install) {
  if (!install) return null
  return {
    macos: enrichInstallPanel(install.macos),
    windows: enrichInstallPanel(install.windows),
  }
}
