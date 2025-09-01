import jsPlugin from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactPlugin from 'eslint-plugin-react'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

export default defineConfig([
  globalIgnores([
    '.next/**',
    'public/**',
    'next-env.d.ts',
    'next.config.js',
  ]),
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } }
  },
  {
    files: [ '**/*.tsx?' ],
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      project: './tsconfig.json',
      sourceType: 'module',
    },
  },
  jsPlugin.configs.recommended,
  reactPlugin.configs.flat.recommended,
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
    ],
  }),
  {
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'curly': ['error', 'all'],
      '@stylistic/block-spacing': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'block', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block' },
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: ['const', 'let'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@typescript-eslint/array-type': [
        'error',
        { default: 'generic' }
      ],
    },
  },
])
