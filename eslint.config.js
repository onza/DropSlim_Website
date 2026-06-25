import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: [
      'src/**/*.js',
      'scripts/**/*.mjs',
      'eleventy.config.js',
      'eslint.config.js',
      'stylelint.config.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
]
