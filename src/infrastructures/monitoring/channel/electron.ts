import { ElectronStore, ElectronStoreWithConverter } from 'infrastructures/common';

import { ImmutableDate, Timestamp } from 'domains/common/date';
import { PlatformType } from 'domains/common/platform';
import { Channel, ChannelIdentifier, MonitoringSetting } from 'domains/monitoring';

export type SerializedChannel = {
  identifier: {
    value: string;
    platform: string;
  };
  setting: {
    isMonitoring: boolean;
    checkInterval: number | null;
  };
  timestamp: {
    createdAt: string;
    updatedAt: string;
  };
  lastCheckedAt: string | null;
};

export const ElectronStoreChannelRepository = (store: ElectronStore<SerializedChannel>) =>
  ElectronStoreWithConverter(store)({
    serialize: (channel: Channel): SerializedChannel => ({
      identifier: {
        value: channel.identifier.value,
        platform: channel.identifier.platform,
      },
      setting: {
        isMonitoring: channel.setting.isMonitoring,
        checkInterval: channel.setting.checkInterval,
      },
      timestamp: {
        createdAt: channel.timestamp.createdAt.toISOString(),
        updatedAt: channel.timestamp.updatedAt.toISOString(),
      },
      lastCheckedAt: channel.lastCheckedAt?.toISOString() ?? null,
    }),
    deserialize: (serialized: SerializedChannel) => {
      const platform = (() => {
        switch (serialized.identifier.platform) {
          case 'youtube':
            return PlatformType.YOUTUBE;
          case 'niconico':
            return PlatformType.NICONICO;
          default:
            throw new Error(`Unknown platform: ${serialized.identifier.platform}`);
        }
      })();

      const identifier = ChannelIdentifier({
        value: serialized.identifier.value,
        platform,
      });

      return Channel({
        identifier,
        setting: MonitoringSetting({
          isMonitoring: serialized.setting.isMonitoring,
          checkInterval: serialized.setting.checkInterval,
        }),
        timestamp: Timestamp({
          createdAt: ImmutableDate.create(serialized.timestamp.createdAt),
          updatedAt: ImmutableDate.create(serialized.timestamp.updatedAt),
        }),
        lastCheckedAt:
          serialized.lastCheckedAt !== null ? ImmutableDate.create(serialized.lastCheckedAt) : null,
      });
    },
  })(store => ({
    find: (identifier: ChannelIdentifier) => store.get(identifier.value),
    monitoring: () =>
      store.search(channel => {
        return channel.setting.isMonitoring;
      }),
    persist: (channel: Channel) => {
      return store.set(channel.identifier.value, channel);
    },
    terminate: (identifier: ChannelIdentifier) => store.terminate(identifier.value),
  }));
