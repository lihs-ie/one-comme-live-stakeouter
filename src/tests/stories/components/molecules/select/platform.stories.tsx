import { useState } from 'react';

import { PlatformSelector } from 'components/molecules/select/platform';

import { ImmutableSet } from 'domains/common/collections';
import { PlatformType } from 'domains/common/platform';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: PlatformSelector,
} satisfies Meta<typeof PlatformSelector>;

export default meta;

const values = ImmutableSet.fromArray(Object.values(PlatformType));

const WithHooks = () => {
  const [selected, setSelected] = useState<PlatformType | null>(null);

  return (
    <PlatformSelector
      values={values}
      selected={selected}
      onSelect={setSelected}
      used={ImmutableSet.empty()}
    />
  );
};

export const Default: StoryObj<typeof PlatformSelector> = {
  render: () => <WithHooks />,
};
