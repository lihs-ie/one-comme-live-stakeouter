import type { Preview } from '@storybook/react-vite';

import '../src/public/sass/global.scss';
import '../src/public/sass/animation.scss';

if (typeof globalThis.expect === 'undefined') {
  globalThis.expect = { extend: () => {} };
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
