import { SimpleButton } from 'components/atoms/buttons/simple';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: SimpleButton,
} satisfies Meta<typeof SimpleButton>;

export default meta;

export const Default: StoryObj<typeof SimpleButton> = {
  args: {
    children: 'Simple Button',
  },
};
