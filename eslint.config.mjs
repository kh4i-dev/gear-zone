import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const noopRule = {
  create() {
    return {}
  },
}

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/uploads/**',
      'test-results/**',
      'prisma/backups/**',
      'build-baseline.log',
      'lint-baseline.log',
      'react-doctor-*.txt',
    ],
  },
  {
    plugins: {
      'react-doctor': {
        rules: {
          'no-giant-component': noopRule,
          'no-initialize-state': noopRule,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-doctor/no-giant-component': 'off',
      'react-doctor/no-initialize-state': 'off',
      'jsx-a11y/alt-text': 'off',
      'prefer-const': 'off',
    },
  },
]

export default config
