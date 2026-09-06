import next from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

// ESLint 9 flat config. `eslint-config-next` v16 ships flat-config arrays
// directly, so they are spread in rather than wrapped in FlatCompat.
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  ...next,
  ...nextTypescript,
]

export default config
