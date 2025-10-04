import path from 'path';

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../src/public'],
  docs: {},
  viteFinal: async config => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        components: path.resolve(__dirname, '../src/components'),
        domains: path.resolve(__dirname, '../src/domains'),
        workflows: path.resolve(__dirname, '../src/workflows'),
        aspects: path.resolve(__dirname, '../src/aspects'),
        infrastructures: path.resolve(__dirname, '../src/infrastructures'),
        tests: path.resolve(__dirname, '../src/tests'),
      };
    }
    return config;
  },
};
export default config;
