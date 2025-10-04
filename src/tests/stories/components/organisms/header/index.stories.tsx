import { Header } from 'components/organisms/header';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: Header,
} satisfies Meta<typeof Header>;

export default meta;

export const Default: StoryObj<typeof Header> = {};
