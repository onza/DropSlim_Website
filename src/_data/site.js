const siteUrl = (process.env.SITE_URL ?? 'https://dropslim.app').replace(/\/$/, '')

export default {
  url: siteUrl,
  apex: new URL(siteUrl).hostname,
  name: 'DropSlim',
  author: 'Martin Farkas',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
  ogImageAlt: 'DropSlim — image compression app for macOS',
  app: {
    repo: 'onza/DropSlim',
    fallback: {
      tag: 'v1.2.1',
      version: '1.2.1',
      url: 'https://github.com/onza/DropSlim/releases/download/v1.2.1/DropSlim_1.2.1_aarch64.dmg',
    },
  },
}
