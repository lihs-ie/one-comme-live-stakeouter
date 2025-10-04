import { ChannelList } from 'components/organisms/channel/entries';

import { Builder } from 'tests/factories';
import { ChannelFactory } from 'tests/factories/domains/monitoring';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: ChannelList,
} satisfies Meta<typeof ChannelList>;

export default meta;

export const Default: StoryObj<typeof ChannelList> = {
  args: {
    entries: Builder(ChannelFactory).buildList(3),
  },
};
