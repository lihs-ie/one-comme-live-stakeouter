import { ChannelCard } from 'components/molecules/cards/channel';

import { Builder } from 'tests/factories';
import { ChannelFactory } from 'tests/factories/domains/monitoring';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: ChannelCard,
} satisfies Meta<typeof ChannelCard>;

export default meta;

export const Default: StoryObj<typeof ChannelCard> = {
  args: {
    channel: Builder(ChannelFactory).build(),
  },
};
