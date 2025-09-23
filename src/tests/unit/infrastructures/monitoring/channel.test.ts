import { AggregateSchema, ElectronStore } from 'infrastructures/common';
import { SerializedChannel } from 'infrastructures/monitoring';
import { ElectronStoreChannelRepository } from 'infrastructures/monitoring';

import { ImmutableList } from 'domains/common/collections';
import { ImmutableDate } from 'domains/common/date';
import { Channel } from 'domains/monitoring';

import { Builder } from 'tests/factories';
import { TimeStampFactory } from 'tests/factories/domains/common/date';
import { ChannelFactory, MonitoringSettingFactory } from 'tests/factories/domains/monitoring';
import { MockElectronStore } from 'tests/mock/electron-store';

const serialize = (channel: Channel): SerializedChannel => ({
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
});

const createStore = (
  channels: ImmutableList<Channel> = ImmutableList.empty<Channel>()
): [ElectronStore<SerializedChannel>, MockElectronStore] => {
  const mock = new MockElectronStore<AggregateSchema<'channels', SerializedChannel>>({
    defaults: {
      channels: Object.fromEntries(
        channels
          .toArray()
          .map((channel): [string, SerializedChannel] => [
            channel.identifier.value,
            serialize(channel),
          ])
      ),
    },
  });

  return [ElectronStore<'channels', SerializedChannel>(mock, 'channels'), mock];
};

describe('Package infrastructures/monitoring/channel', () => {
  describe('ElectronStoreChannelRepository', () => {
    describe('find', () => {
      describe('successfully', () => {
        it('should returns SuccessResult with existing identifier.', async () => {
          const channels = Builder(ChannelFactory).buildList(10);

          const target = channels.get(Math.floor(Math.random() * channels.size())).get();

          const [store] = createStore(channels);

          const repository = ElectronStoreChannelRepository(store);

          const result = await repository.find(target.identifier);

          expect(result.isOk()).toBeTruthy();

          expect(result._unsafeUnwrap()).toBeSameChannel(target);
        });
      });

      describe('unsuccessfully', () => {
        it('should returns FailureResult with non-existing identifier.', async () => {
          const channels = Builder(ChannelFactory).buildList(10);

          const missing = channels.first().get();

          const [store] = createStore(channels.drop(1));

          const repository = ElectronStoreChannelRepository(store);

          const result = await repository.find(missing.identifier);

          expect(result.isErr()).toBeTruthy();
        });
      });
    });

    describe('monitoring', () => {
      describe('successfully', () => {
        it('should returns SuccessResult with channels having isMonitoring true.', async () => {
          const channels = Builder(ChannelFactory).buildList(10);

          const expecteds = channels.filter(channels => channels.setting.isMonitoring);

          const [store] = createStore(channels);

          const repository = ElectronStoreChannelRepository(store);

          const result = await repository.monitoring();

          expect(result.isOk()).toBeTruthy();

          const actuals = result._unsafeUnwrap();

          expect(actuals.size()).toBe(expecteds.size());

          expecteds.zip(actuals).foreach(([expected, actual]) => {
            expect(actual).toBeSameChannel(expected);
          });
        });

        it('should returns SuccessResult with empty list when no channels having isMonitoring true.', async () => {
          const channels = Builder(ChannelFactory).buildList(10, {
            setting: Builder(MonitoringSettingFactory).build({ isMonitoring: false }),
          });

          const [store] = createStore(channels);

          const repository = ElectronStoreChannelRepository(store);

          const result = await repository.monitoring();

          expect(result.isOk()).toBeTruthy();

          const actuals = result._unsafeUnwrap();

          expect(actuals.isEmpty()).toBeTruthy();
        });
      });
    });

    describe('persist', () => {
      describe('successfully', () => {
        it('should returns SuccessResult when the channel is new.', async () => {
          const channels = Builder(ChannelFactory).buildList(10);

          const index = Math.floor(Math.random() * channels.size());
          const target = channels.get(index).get();
          const removed = channels.remove(target);

          const [store] = createStore(removed);

          const repository = ElectronStoreChannelRepository(store);

          const result = await repository.persist(target);

          expect(result.isOk()).toBeTruthy();

          const found = await repository.find(target.identifier);

          expect(found.isOk()).toBeTruthy();
          expect(found._unsafeUnwrap()).toBeSameChannel(target);

          await Promise.all(
            removed
              .toArray()
              .map(async channel =>
                expect((await repository.find(channel.identifier))._unsafeUnwrap()).toBeSameChannel(
                  channel
                )
              )
          );
        });

        it('should returns SuccessResult when the channel already exists (and is updated).', async () => {
          const channels = Builder(ChannelFactory).buildList(10, {
            timestamp: Builder(TimeStampFactory).build({
              createdAt: ImmutableDate.create(),
              updatedAt: ImmutableDate.create(),
            }),
          });

          const index = Math.floor(Math.random() * channels.size());
          const target = channels.get(index).get();

          const next = Channel({
            identifier: target.identifier,
            setting: Builder(MonitoringSettingFactory).build(),
            timestamp: Builder(TimeStampFactory).build(),
            lastCheckedAt: ImmutableDate.now(),
          });

          const [store, mock] = createStore(channels);

          const repository = ElectronStoreChannelRepository(store);

          const result = await repository.persist(next);

          expect(result.isOk()).toBeTruthy();

          channels
            .filter(channel => !next.identifier.equals(channel.identifier))
            .foreach(channel => {
              const actual = mock.get(`channels.${channel.identifier.value}`);

              expect(actual).toEqual(serialize(channel));
            });
        });
      });
    });

    describe('terminate', () => {
      describe('successfully', () => {
        it('should returns SuccessResult when the channel exists.', async () => {
          const channels = Builder(ChannelFactory).buildList(10);

          const index = Math.floor(Math.random() * channels.size());
          const target = channels.get(index).get();

          const [store, mock] = createStore(channels);

          const repository = ElectronStoreChannelRepository(store);

          const result = await repository.terminate(target.identifier);

          expect(result.isOk()).toBeTruthy();

          expect(mock.has(`channels.${target.identifier.value}`)).toBeFalsy();
        });
      });

      describe('unsuccessfully', () => {
        it('should returns FailureResult when the channel does not exist.', async () => {
          const channels = Builder(ChannelFactory).buildList(10);

          const missing = channels.first().get();

          const [store] = createStore(channels.drop(1));

          const repository = ElectronStoreChannelRepository(store);

          const result = await repository.terminate(missing.identifier);

          expect(result.isErr()).toBeTruthy();
        });
      });
    });
  });
});
