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
      tag: 'v1.3.1',
      version: '1.3.1',
      macos: {
        url: 'https://github.com/onza/DropSlim/releases/download/v1.3.1/DropSlim_1.3.1_aarch64.dmg',
      },
      windows: {
        url: 'https://github.com/onza/DropSlim/releases/download/v1.3.1/DropSlim_1.3.1_x64-setup.exe',
      },
    },
  },
}
