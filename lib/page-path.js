/** @param {string} file — e.g. index.html, en/index.html */
export function pageToUrlPath(file) {
  if (file === 'index.html') return '/'
  const dir = file.replace(/\/index\.html$/, '')
  if (dir !== file) return `/${dir}`
  return `/${file.replace(/\.html$/, '')}`
}

/** @param {string} siteUrl @param {string} file */
export function pageAbsUrl(siteUrl, file) {
  const base = siteUrl.replace(/\/$/, '')
  if (/\.(png|xml|txt|ico|woff2)$/.test(file)) {
    return `${base}/${file}`
  }
  return `${base}${pageToUrlPath(file)}`
}
