import { useState } from 'react';

import { TextInput } from 'components/atoms/input/text';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: TextInput,
} satisfies Meta<typeof TextInput>;

export default meta;

const DefaultRender = () => {
  const [value, setValue] = useState('');

  return <TextInput value={value} onChange={setValue} />;
};

export const Default: StoryObj<typeof TextInput> = {
  render: DefaultRender,
};
