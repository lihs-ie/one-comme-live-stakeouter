import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',

    globals: true,

    watch: true,
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/storybook-static/**'],

    include: ['src/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],

    testTimeout: 10000,
    hookTimeout: 10000,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__x00__*',
        '**/\x00*',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        '**/stories/**',
        '**/*.stories.{js,jsx,ts,tsx}',
        'src/pages/index.tsx',
        'webpack.*.js',
        '.storybook/**',
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },

    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
      },
    },

    outputFile: {
      junit: './coverage/junit.xml',
    },

    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    setupFiles: ['./vitest.setup.ts'],

    server: {
      deps: {
        external: ['electron', 'electron-store'],
      },
    },
  },

  resolve: {
    alias: {
      domains: path.resolve(__dirname, './src/domains'),
      infrastructures: path.resolve(__dirname, './src/infrastructures'),
      workflows: path.resolve(__dirname, './src/workflows'),
      acl: path.resolve(__dirname, './src/acl'),
      ui: path.resolve(__dirname, './src/ui'),
      aspects: path.resolve(__dirname, './src/aspects'),
      tests: path.resolve(__dirname, './src/tests'),
      plugin: path.resolve(__dirname, './src/plugin'),
      providers: path.resolve(__dirname, './src/providers'),
      config: path.resolve(__dirname, './src/config'),
    },
  },

  esbuild: {
    target: 'es2022',
  },
});
