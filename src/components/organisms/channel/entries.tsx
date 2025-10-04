import { ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { ChannelCard } from 'components/molecules/cards/channel';
import {
  TerminateChannelWorkflow,
  UpdateChannelWorkflowCommand,
} from 'workflows/monitoring/manage';

import { ImmutableList } from 'domains/common/collections';
import { Channel } from 'domains/monitoring';

import styles from './entries.module.scss';

export type Props = {
  entries: ImmutableList<Channel>;
  onUpdate: (command: UpdateChannelWorkflowCommand) => ResultAsync<void, CommonError>;
  onTerminate: (command: TerminateChannelWorkflow) => ResultAsync<void, CommonError>;
};

export const ChannelList = (props: Props) => (
  <div className={styles.container}>
    <h2 className={styles.title}>設定済みプラットフォーム（{props.entries.size()}）</h2>
    {props.entries
      .map((channel, index) => (
        <div className={styles.entry} key={index}>
          <ChannelCard
            channel={channel}
            onUpdate={props.onUpdate}
            onTerminate={props.onTerminate}
          />
        </div>
      ))
      .toArray()}
  </div>
);
