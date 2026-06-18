import { defineConfig } from 'vite'
import { copyFileSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { seoPlugin } from './vite-plugins/seo.js'
import { releasePlugin } from './vite-plugins/release.js'

const distDir = resolve(__dirname, 'dist')
const cssTag = '    <link rel="stylesheet" crossorigin href="./assets/styles.min.css" />\n'
const scriptTag = '    <script type="module" crossorigin src="./bundle.min.js"></script>\n'

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
        if (item.type === 'asset' && item.fileName?.endsWith('.css')) {
          item.fileName = 'assets/styles.min.css'
          bundle['assets/styles.min.css'] = item
          if (key !== 'assets/styles.min.css') delete bundle[key]
        }
      }
    },
    closeBundle() {
      copyFileSync(resolve(__dirname, 'LICENSE'), resolve(distDir, 'LICENSE'))

      for (const file of readdirSync(distDir).filter((name) => name.endsWith('.html'))) {
        const path = resolve(distDir, file)
        let html = readFileSync(path, 'utf8')
        html = html.replace(/<link rel="stylesheet"[^>]*>\s*/g, '')
        html = html.replace(/<script type="module"[^>]*><\/script>\s*/g, '')
        html = html.replace(/<\/head>/, `\n${cssTag}  </head>`)
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
