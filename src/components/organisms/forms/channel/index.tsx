import { ResultAsync } from 'neverthrow';
import { useState } from 'react';

import { CommonError } from 'aspects/error';
import { DottedButton } from 'components/atoms/buttons/dotted';
import { PlusIcon } from 'components/atoms/icons/plus';
import { CreateChannelWorkflowCommand } from 'workflows/monitoring/manage';

import { ImmutableSet } from 'domains/common/collections';
import { PlatformType } from 'domains/common/platform';

import { ChannelForm as ChannelPersistenceForm } from './persistence';

export type Props = {
  onSubmit: (command: CreateChannelWorkflowCommand) => ResultAsync<void, CommonError>;
  onCancel?: () => void;
  usedPlatforms: ImmutableSet<PlatformType>;
};

export const ChannelForm = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return isOpen ? (
    <div className={'fade-in'}>
      <ChannelPersistenceForm
        onSubmit={command => props.onSubmit(command).map(() => setIsOpen(false))}
        onCancel={() => setIsOpen(false)}
        usedPlatforms={props.usedPlatforms}
      />
    </div>
  ) : (
    <DottedButton onClick={() => setIsOpen(true)}>
      <PlusIcon />
      監視チャンネルを追加
    </DottedButton>
  );
};
