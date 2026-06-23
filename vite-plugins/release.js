import { relative } from 'node:path'
import { app } from '../site.config.js'
import { resolveRelease } from '../lib/resolve-release.js'

const RELEASE_PAGES = new Set(['index.html', 'en/index.html'])

function escapeAttr(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/** @param {import('../lib/resolve-release.js').AppRelease} release */
function injectRelease(html, release) {
  let out = html

  if (release.url !== app.fallback.url) {
    out = out.replaceAll(escapeAttr(app.fallback.url), escapeAttr(release.url))
  }

  if (release.version !== app.fallback.version) {
    out = out.replace(/(<span data-release-version>)[^<]+(<\/span>)/, `$1${release.version}$2`)
  }

  return out
}

export function releasePlugin() {
  /** @type {Promise<import('../lib/resolve-release.js').AppRelease> | null} */
  let releasePromise = null
  /** @type {string} */
  let root = process.cwd()

  function loadRelease() {
    if (!releasePromise) {
      releasePromise = resolveRelease().then((release) => {
        console.info(`[release] ${release.tag} → ${release.name}`)
        return release
      })
    }
    return releasePromise
  }

  return {
    name: 'release',
    configResolved(config) {
      root = config.root
    },
    buildStart() {
      loadRelease()
    },
    async transformIndexHtml(html, ctx) {
      const file = relative(root, ctx.filename).replace(/\\/g, '/')
      if (!RELEASE_PAGES.has(file)) return html
      const release = await loadRelease()
      return injectRelease(html, release)
    },
  }
}
