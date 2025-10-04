import { PlatformText } from 'components/atoms/text/platform';

import { PlatformType } from 'domains/common/platform';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: PlatformText,
} satisfies Meta<typeof PlatformText>;

export default meta;

export const Youtube: StoryObj<typeof PlatformText> = {
  args: {
    type: PlatformType.YOUTUBE,
  },
};

export const Niconico: StoryObj<typeof PlatformText> = {
  args: {
    type: PlatformType.NICONICO,
  },
};
