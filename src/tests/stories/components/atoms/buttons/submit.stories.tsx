import { SubmitButton } from 'components/atoms/buttons/submit';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: SubmitButton,
} satisfies Meta<typeof SubmitButton>;

export default meta;

export const Default: StoryObj<typeof SubmitButton> = {
  args: { children: 'Submit' },
};
