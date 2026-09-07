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
      // Throwaway harnesses, not app code: the mobile overflow audit and
      // the demo readiness smoke test.
      'scripts/**',
    ],
  },
  ...next,
  ...nextTypescript,
]

export default config
