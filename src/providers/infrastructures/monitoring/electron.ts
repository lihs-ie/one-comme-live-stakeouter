import { AggregateSchema, ElectronStore } from 'infrastructures/common';
import { ElectronStoreChannelRepository, SerializedChannel } from 'infrastructures/monitoring';

import type Store from 'electron-store';

export const MonitoringRepositoryDependencies = (
  store: Store<AggregateSchema<'channels', SerializedChannel>>
) =>
  ElectronStoreChannelRepository(ElectronStore<'channels', SerializedChannel>(store, 'channels'));
