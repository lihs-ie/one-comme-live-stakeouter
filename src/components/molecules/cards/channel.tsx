import { TrashIcon } from 'lucide-react';
import { ResultAsync } from 'neverthrow';
import { useState } from 'react';

import { CommonError } from 'aspects/error';
import { TextInput } from 'components/atoms/input/text';
import {
  TerminateChannelWorkflow,
  UpdateChannelWorkflowCommand,
} from 'workflows/monitoring/manage';

import { PlatformType } from 'domains/common/platform';
import { Channel } from 'domains/monitoring';

import styles from './channel.module.scss';
import { PlatformIcon } from '../icons/platform';

export type Props = {
  channel: Channel;
  onUpdate: (command: UpdateChannelWorkflowCommand) => ResultAsync<void, CommonError>;
  onTerminate: (command: TerminateChannelWorkflow) => ResultAsync<void, CommonError>;
};

const labels: Record<PlatformType, string> = {
  [PlatformType.NICONICO]: 'ニコニコ生放送のユーザーID',
  [PlatformType.YOUTUBE]: 'YouTubeのチャンネルID',
};

export const ChannelCard = (props: Props) => {
  const [identifier, setIdentifier] = useState(props.channel.identifier.value);

  return (
    <div className={`${styles.container} fade-in`}>
      <div className={styles.header}>
        <div className={styles.platform}>
          <span className={styles.icon}>
            <PlatformIcon type={props.channel.identifier.platform} />
          </span>
          <h3 className={styles.name}>{props.channel.identifier.platform}</h3>
        </div>
        <button
          className={styles.terminate}
          onClick={() => {
            props.onTerminate({ identifier: props.channel.identifier });
          }}
        >
          <TrashIcon />
        </button>
      </div>

      <label className={styles.identifier}>{labels[props.channel.identifier.platform]}</label>
      <TextInput
        value={identifier}
        onChange={value => {
          setIdentifier(value.trim());
        }}
      />
    </div>
  );
};
