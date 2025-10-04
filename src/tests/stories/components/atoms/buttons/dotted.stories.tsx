import { DottedButton } from 'components/atoms/buttons/dotted';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: DottedButton,
} satisfies Meta<typeof DottedButton>;

export default meta;

export const Default: StoryObj<typeof DottedButton> = {
  args: {
    children: 'Dotted Button',
  },
};
