import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      target: 'node22',
      lib: {
        entry: path.resolve(__dirname, 'src/plugin/index.ts'),
        formats: ['cjs'],
        fileName: () => 'plugin.js',
      },
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: true,
      rollupOptions: {
        external: ['@onecomme.com/onesdk', 'electron-store'],
        output: {
          format: 'cjs',
          exports: 'auto',
        },
      },
      minify: 'terser',
      terserOptions: {
        keep_fnames: true,
        keep_classnames: true,
      },
    },

    resolve: {
      alias: {
        aspects: path.resolve(__dirname, 'src/aspects'),
        domains: path.resolve(__dirname, 'src/domains'),
        providers: path.resolve(__dirname, 'src/providers'),
        infrastructures: path.resolve(__dirname, 'src/infrastructures'),
        workflows: path.resolve(__dirname, 'src/workflows'),
        plugin: path.resolve(__dirname, 'src/plugin'),
        acl: path.resolve(__dirname, 'src/acl'),
        config: path.resolve(__dirname, 'src/config'),
      },
    },

    define: {
      'process.env.ACL_YOUTUBE_BASE_URI': JSON.stringify(env.ACL_YOUTUBE_BASE_URI),
      'process.env.ACL_YOUTUBE_API_KEY': JSON.stringify(env.ACL_YOUTUBE_API_KEY),
      'process.env.ACL_NICONICO_BASE_URI': JSON.stringify(env.ACL_NICONICO_BASE_URI),
      'process.env.ACL_NICONICO_USER_AGENT': JSON.stringify(env.ACL_NICONICO_USER_AGENT),
      'process.env.ACL_ONE_COMME_BASE_URI': JSON.stringify(env.ACL_ONE_COMME_BASE_URI),
    },
  };
});
