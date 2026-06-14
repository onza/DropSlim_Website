import { app } from '../site.config.js'

const DMG_PATTERN = /_aarch64\.dmg$/

/**
 * @typedef {object} AppRelease
 * @property {string} tag - e.g. v1.0.0-beta.6
 * @property {string} version - e.g. 1.0.0-beta.6
 * @property {string} url - DMG download URL
 * @property {string} name - asset file name
 */

/** @returns {Promise<AppRelease>} */
export async function resolveRelease() {
  const tagOverride = process.env.APP_RELEASE_TAG?.trim()
  const { repo, fallback } = app

  try {
    const apiUrl = tagOverride
      ? `https://api.github.com/repos/${repo}/releases/tags/${tagOverride}`
      : `https://api.github.com/repos/${repo}/releases/latest`

    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'dropslim-website-build',
      },
    })

    if (!res.ok) {
      throw new Error(`GitHub API ${res.status} for ${apiUrl}`)
    }

    const data = await res.json()
    const asset = data.assets?.find((item) => DMG_PATTERN.test(item.name))

    if (!asset) {
      throw new Error(`No Apple Silicon DMG in release ${data.tag_name}`)
    }

    const tag = data.tag_name
    return {
      tag,
      version: tag.replace(/^v/, ''),
      url: asset.browser_download_url,
      name: asset.name,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`[release] ${message} — using fallback (${fallback.tag})`)
    return { ...fallback, name: fallback.url.split('/').pop() ?? '' }
  }
}
