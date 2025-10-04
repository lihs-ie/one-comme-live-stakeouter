import { okAsync } from 'neverthrow';
import { useState } from 'react';

import { SettingIndex } from 'components/templates/setting';

import { ImmutableList } from 'domains/common/collections';
import { ImmutableDate, Timestamp } from 'domains/common/date';
import { Channel, MonitoringSetting } from 'domains/monitoring';

import { Builder } from 'tests/factories';
import { ChannelFactory, ChannelIdentifierFactory } from 'tests/factories/domains/monitoring';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: SettingIndex,
} satisfies Meta<typeof SettingIndex>;

export default meta;

const WithHooks = () => {
  const [channels, setChannels] = useState<ImmutableList<Channel>>(ImmutableList.empty());

  return (
    <meta.component
      channels={channels}
      onCreateChannel={command => {
        setChannels(
          channels.addLast(
            Builder(ChannelFactory).build({
              identifier: Builder(ChannelIdentifierFactory).build({
                value: command.identifier,
                platform: command.platform,
              }),
            })
          )
        );
        return okAsync();
      }}
      onUpdateChannel={command => {
        const target = channels
          .find(channel => command.identifier.equals(channel.identifier))
          .get();

        const next = Channel({
          identifier: target.identifier,
          setting: MonitoringSetting({
            checkInterval: command.checkInterval,
            isMonitoring: command.isMonitoring ?? false,
          }),
          lastCheckedAt: target.lastCheckedAt,
          timestamp: Timestamp({
            createdAt: target.timestamp.createdAt,
            updatedAt: ImmutableDate.now(),
          }),
        });

        setChannels(
          channels.filter(channel => !channel.identifier.equals(target.identifier)).addLast(next)
        );

        return okAsync();
      }}
      onTerminateChannel={command => {
        setChannels(channels.filter(channel => !command.identifier.equals(channel.identifier)));
        return okAsync();
      }}
    ></meta.component>
  );
};

export const Default: StoryObj<typeof SettingIndex> = {
  render: () => <WithHooks />,
};
