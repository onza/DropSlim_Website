const siteUrl = (process.env.SITE_URL ?? 'https://dropslim.app').replace(/\/$/, '')

export default {
  url: siteUrl,
  apex: new URL(siteUrl).hostname,
  name: 'DropSlim',
  author: 'Martin Farkas',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
  ogImageAlt: 'DropSlim — image compression app for macOS and Windows',
  app: {
    repo: 'onza/DropSlim',
    fallback: {
      tag: 'v1.4.0',
      version: '1.4.0',
      macos: {
        url: 'https://github.com/onza/DropSlim/releases/download/v1.4.0/DropSlim_1.4.0_aarch64.dmg',
      },
      windows: {
        url: 'https://github.com/onza/DropSlim/releases/download/v1.4.0/DropSlim_1.4.0_x64-setup.exe',
      },
    },
  },
}
