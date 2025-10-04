import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: path.resolve(__dirname, 'src/public/images/*'),
            dest: 'images',
          },
        ],
      }),
    ],

    root: './src/pages',

    build: {
      outDir: '../../dist/ui',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/pages/index.html'),
        },
      },
    },

    base: '/plugins/one-commentator/static/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        aspects: path.resolve(__dirname, 'src/aspects'),
        domains: path.resolve(__dirname, 'src/domains'),
        providers: path.resolve(__dirname, 'src/providers'),
        components: path.resolve(__dirname, 'src/components'),
        acl: path.resolve(__dirname, 'src/acl'),
        config: path.resolve(__dirname, 'src/config'),
      },
    },

    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]--[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
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
