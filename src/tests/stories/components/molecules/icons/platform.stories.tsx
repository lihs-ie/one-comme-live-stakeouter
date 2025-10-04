import { PlatformIcon } from 'components/molecules/icons/platform';

import { PlatformType } from 'domains/common/platform';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: PlatformIcon,
} satisfies Meta<typeof PlatformIcon>;

export default meta;

export const Youtube: StoryObj<typeof PlatformIcon> = {
  args: {
    type: PlatformType.YOUTUBE,
  },
};

export const NicoNico: StoryObj<typeof PlatformIcon> = {
  args: {
    type: PlatformType.NICONICO,
  },
};
