import { ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { ChannelList } from 'components/organisms/channel/entries';
import { Footer } from 'components/organisms/footer';
import { ChannelForm } from 'components/organisms/forms/channel';
import { Header } from 'components/organisms/header';
import { DescriptionSection } from 'components/organisms/sections/description';
import {
  CreateChannelWorkflowCommand,
  TerminateChannelWorkflow,
  UpdateChannelWorkflowCommand,
} from 'workflows/monitoring/manage';

import { ImmutableList, ImmutableSet } from 'domains/common/collections';
import { Channel } from 'domains/monitoring';

import styles from './setting.module.scss';

export type Props = {
  channels: ImmutableList<Channel>;
  onCreateChannel: (command: CreateChannelWorkflowCommand) => ResultAsync<void, CommonError>;
  onUpdateChannel: (command: UpdateChannelWorkflowCommand) => ResultAsync<void, CommonError>;
  onTerminateChannel: (command: TerminateChannelWorkflow) => ResultAsync<void, CommonError>;
};

export const SettingIndex = (props: Props) => (
  <div className={styles.container}>
    <Header />
    <div className={styles.main}>
      <div className={styles.content}>
        <DescriptionSection />

        {props.channels.isNotEmpty() && (
          <ChannelList
            entries={props.channels}
            onUpdate={props.onUpdateChannel}
            onTerminate={props.onTerminateChannel}
          />
        )}
        <ChannelForm
          usedPlatforms={ImmutableSet.fromArray(
            props.channels.map(channel => channel.identifier.platform).toArray()
          )}
          onSubmit={props.onCreateChannel}
        />
      </div>
    </div>
    <Footer />
  </div>
);
