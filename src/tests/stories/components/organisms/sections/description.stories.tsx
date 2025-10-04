import { DescriptionSection } from 'components/organisms/sections/description';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: DescriptionSection,
} satisfies Meta<typeof DescriptionSection>;

export default meta;

export const Default: StoryObj<typeof DescriptionSection> = {};
