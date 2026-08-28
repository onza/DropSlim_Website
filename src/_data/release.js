import site from './site.js'

const MAC_PATTERN = /_aarch64\.dmg$/
const WIN_PATTERN = /_x64-setup\.exe$/i
const CLI_PATTERN = /dropslim-cli_.*_aarch64\.tar\.gz$/

function findAsset(assets, pattern) {
  return assets?.find((item) => pattern.test(item.name)) ?? null
}

function platformFromAsset(asset, tag, version, platform, fallback) {
  if (asset) {
    return { url: asset.browser_download_url, name: asset.name }
  }

  const fb = fallback[platform]
  if (fb?.url) {
    return { url: fb.url, name: fb.url.split('/').pop() ?? '' }
  }

  const file =
    platform === 'macos' ? `DropSlim_${version}_aarch64.dmg` : `DropSlim_${version}_x64-setup.exe`

  return {
    url: `https://github.com/onza/DropSlim/releases/download/${tag}/${file}`,
    name: file,
  }
}

function cliFromAsset(asset, tag, version, fallback) {
  if (asset) {
    return { url: asset.browser_download_url, name: asset.name }
  }

  if (fallback.cli?.url) {
    return { url: fallback.cli.url, name: fallback.cli.url.split('/').pop() ?? '' }
  }

  const file = `dropslim-cli_${version}_aarch64.tar.gz`
  return {
    url: `https://github.com/onza/DropSlim/releases/download/${tag}/${file}`,
    name: file,
  }
}

function fromFallback(fallback) {
  return {
    tag: fallback.tag,
    version: fallback.version,
    macos: platformFromAsset(null, fallback.tag, fallback.version, 'macos', fallback),
    windows: platformFromAsset(null, fallback.tag, fallback.version, 'windows', fallback),
    cli: cliFromAsset(null, fallback.tag, fallback.version, fallback),
  }
}

export default async function () {
  const tagOverride = process.env.APP_RELEASE_TAG?.trim()
  const { repo, fallback } = site.app

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
    const tag = data.tag_name
    const version = tag.replace(/^v/, '')
    const release = {
      tag,
      version,
      macos: platformFromAsset(
        findAsset(data.assets, MAC_PATTERN),
        tag,
        version,
        'macos',
        fallback,
      ),
      windows: platformFromAsset(
        findAsset(data.assets, WIN_PATTERN),
        tag,
        version,
        'windows',
        fallback,
      ),
      cli: cliFromAsset(findAsset(data.assets, CLI_PATTERN), tag, version, fallback),
    }

    console.info(
      `[release] ${release.tag} → ${release.macos.name}, ${release.windows.name}, ${release.cli.name}`,
    )
    return release
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`[release] ${message} — using fallback (${fallback.tag})`)
    return fromFallback(fallback)
  }
}
