import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest設定
 * TDD開発に最適化されたテスト環境設定
 */
export default defineConfig({
  test: {
    // テスト実行環境
    environment: 'node',

    // グローバル設定
    globals: true,

    // ウォッチモード設定
    watch: true,
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/storybook-static/**'],

    // テストファイルパターン
    include: ['src/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],

    // テストタイムアウト
    testTimeout: 10000,
    hookTimeout: 10000,

    // カバレッジ設定
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
        // プロジェクト固有の除外
        'src/ui/index.tsx', // React エントリーポイント
        'webpack.*.js',
        '.storybook/**',
      ],
      // カバレッジ閾値設定（CLAUDE.mdの要件：90%以上）
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },

    // 並列実行設定
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

    // モック設定
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // セットアップファイル
    setupFiles: ['./vitest.setup.ts'],
  },

  // パスエイリアス設定
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
      domains: path.resolve(__dirname, './src/domains'),
      infrastructures: path.resolve(__dirname, './src/infrastructures'),
      workflows: path.resolve(__dirname, './src/workflows'),
      acl: path.resolve(__dirname, './src/acl'),
      ui: path.resolve(__dirname, './src/ui'),
      aspects: path.resolve(__dirname, './src/aspects'),
      tests: path.resolve(__dirname, './src/tests'),
    },
  },

  // TypeScript設定
  esbuild: {
    target: 'es2022',
  },
});
