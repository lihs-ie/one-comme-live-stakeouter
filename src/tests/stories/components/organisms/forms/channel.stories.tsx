import { okAsync } from 'neverthrow';

import { ChannelForm } from 'components/organisms/forms/channel/persistence';

import { ImmutableSet } from 'domains/common/collections';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: ChannelForm,
} satisfies Meta<typeof ChannelForm>;

export default meta;

export const Default: StoryObj<typeof ChannelForm> = {
  args: {
    onSubmit: () => okAsync(),
    onCancel: () => {},
    usedPlatforms: ImmutableSet.empty(),
  },
};
