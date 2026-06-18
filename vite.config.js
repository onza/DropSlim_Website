import { defineConfig } from 'vite'
import { copyFileSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { seoPlugin } from './vite-plugins/seo.js'
import { releasePlugin } from './vite-plugins/release.js'

const distDir = resolve(__dirname, 'dist')
const preloadTags =
  '    <link rel="preload" href="./assets/bricolage-grotesque.woff2" as="font" type="font/woff2" crossorigin />\n' +
  '    <link rel="preload" href="./assets/ibm-plex-mono-400.woff2" as="font" type="font/woff2" crossorigin />\n'
const cssTag = '    <link rel="stylesheet" crossorigin href="./assets/styles.min.css" />\n'
const scriptTag = '    <script type="module" crossorigin src="./bundle.min.js"></script>\n'

const stableAssets = {
  'bricolage-grotesque': 'assets/bricolage-grotesque.woff2',
  'ibm-plex-mono': 'assets/ibm-plex-mono-400.woff2',
  '.css': 'assets/styles.min.css',
}

function renameStableAsset(bundle, key, item, match) {
  const fileName = stableAssets[match]
  item.fileName = fileName
  bundle[fileName] = item
  if (key !== fileName) delete bundle[key]
}

function bundleMinJs() {
  return {
    name: 'bundle-min-js',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const [key, item] of Object.entries(bundle)) {
        if (item.type === 'chunk' && key.endsWith('.js')) {
          item.fileName = 'bundle.min.js'
          bundle['bundle.min.js'] = item
          if (key !== 'bundle.min.js') delete bundle[key]
          continue
        }
        if (item.type !== 'asset' || !item.fileName) continue

        const source = `${key} ${item.fileName}`
        if (item.fileName.endsWith('.css')) {
          renameStableAsset(bundle, key, item, '.css')
          continue
        }
        for (const [needle] of Object.entries(stableAssets)) {
          if (needle === '.css') continue
          if (source.includes(needle)) {
            renameStableAsset(bundle, key, item, needle)
            break
          }
        }
      }
    },
    closeBundle() {
      copyFileSync(resolve(__dirname, 'LICENSE'), resolve(distDir, 'LICENSE'))

      const cssPath = resolve(distDir, 'assets/styles.min.css')
      let css = readFileSync(cssPath, 'utf8')
      css = css.replace(/bricolage-grotesque-[a-zA-Z0-9_.-]+\.woff2/g, 'bricolage-grotesque.woff2')
      css = css.replace(/ibm-plex-mono-400-[a-zA-Z0-9_.-]+\.woff2/g, 'ibm-plex-mono-400.woff2')
      writeFileSync(cssPath, css)

      for (const file of readdirSync(distDir).filter((name) => name.endsWith('.html'))) {
        const path = resolve(distDir, file)
        let html = readFileSync(path, 'utf8')
        html = html.replace(/<link rel="preload"[^>]*>\s*/g, '')
        html = html.replace(/<link rel="stylesheet"[^>]*>\s*/g, '')
        html = html.replace(/<script type="module"[^>]*><\/script>\s*/g, '')
        html = html.replace(/<\/head>/, `\n${preloadTags}${cssTag}  </head>`)
        html = html.replace(/\s*<\/body>/, `\n${scriptTag}  </body>`)
        writeFileSync(path, html)
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [releasePlugin(), seoPlugin(), bundleMinJs()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        en: resolve(__dirname, 'en.html'),
        impressum: resolve(__dirname, 'impressum.html'),
        datenschutz: resolve(__dirname, 'datenschutz.html'),
        legalnotice: resolve(__dirname, 'legalnotice.html'),
        privacypolicy: resolve(__dirname, 'privacypolicy.html'),
      },
    },
  },
})
