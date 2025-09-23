import { errAsync, okAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';

import { ImmutableList, ImmutableMap } from 'domains/common/collections';
import { ImmutableDate, Timestamp } from 'domains/common/date';
import { PlatformType } from 'domains/common/platform';
import {
  Channel,
  ChannelIdentifier,
  ChannelRepository,
  MonitoringSetting,
  MonitoringStarted,
  Plan,
  Rule,
} from 'domains/monitoring';

import { Builder, Factory, StringFactory } from 'tests/factories/builder';

import { ImmutableDateFactory, TimeStampFactory } from '../common/date';
import { PlatformTypeFactory } from '../common/platform';

export type ChannelIdentifierProperties = {
  value: string;
  platform: PlatformType;
};

export const ChannelIdentifierFactory = Factory<ChannelIdentifier, ChannelIdentifierProperties>({
  instantiate: properties => ChannelIdentifier(properties),
  prepare: (overrides, seed) => ({
    value: overrides.value ?? Builder(StringFactory(1, 64)).buildWith(seed),
    platform: overrides.platform ?? Builder(PlatformTypeFactory).buildWith(seed),
  }),
  retrieve: properties => ({
    value: properties.value,
    platform: properties.platform,
  }),
});

export type MonitoringSettingProperties = {
  checkInterval: number | null;
  isMonitoring: boolean;
};

export const MonitoringSettingFactory = Factory<MonitoringSetting, MonitoringSettingProperties>({
  instantiate: properties => MonitoringSetting(properties),
  prepare: (overrides, seed) => ({
    checkInterval: overrides.checkInterval ?? (seed % 3590) + 10,
    isMonitoring: overrides.isMonitoring ?? seed % 2 === 0,
  }),
  retrieve: properties => ({
    checkInterval: properties.checkInterval,
    isMonitoring: properties.isMonitoring,
  }),
});

export type ChannelProperties = {
  identifier: ChannelIdentifier;
  setting: MonitoringSetting;
  lastCheckedAt: ImmutableDate | null;
  timestamp: Timestamp;
};

export const ChannelFactory = Factory<Channel, ChannelProperties>({
  instantiate: properties => Channel(properties),
  prepare: (overrides, seed) => ({
    identifier: overrides.identifier ?? Builder(ChannelIdentifierFactory).buildWith(seed),
    setting: overrides.setting ?? Builder(MonitoringSettingFactory).buildWith(seed),
    lastCheckedAt: overrides.lastCheckedAt ?? null,
    timestamp: overrides.timestamp ?? Builder(TimeStampFactory).buildWith(seed),
  }),
  retrieve: instance => ({
    identifier: instance.identifier,
    setting: instance.setting,
    lastCheckedAt: instance.lastCheckedAt,
    timestamp: instance.timestamp,
  }),
});

export type ChannelRepositoryProperties = {
  instances: ImmutableList<Channel>;
  onPersist?: (instance: Channel) => void;
  onTerminate?: (identifier: ChannelIdentifier) => void;
};

export const ChannelRepositoryFactory = Factory<ChannelRepository, ChannelRepositoryProperties>({
  instantiate: properties => {
    let instances = ImmutableMap.fromArray(
      properties.instances
        .map((instance): [ChannelIdentifier, Channel] => [instance.identifier, instance])
        .toArray()
    );

    return {
      find: (identifier: ChannelIdentifier) =>
        instances.get(identifier).ifPresentOrElse(
          instance => okAsync(instance),
          () =>
            errAsync<Channel, CommonError>({
              type: 'not-found',
              context: identifier.value,
            })
        ),
      findByChannel: (channel: ChannelIdentifier) =>
        instances
          .find((_, instance) => channel.equals(instance.identifier))
          .ifPresentOrElse(
            instance => okAsync(instance),
            () =>
              errAsync<Channel, CommonError>({
                type: 'not-found',
                context: channel.value,
              })
          ),
      monitoring: () =>
        okAsync(instances.filter((_, instance) => instance.setting.isMonitoring).toList()),
      persist: (channel: Channel) =>
        instances.get(channel.identifier).ifPresentOrElse(
          _ => errAsync({ type: 'conflict', context: channel.identifier.value }),
          () => {
            instances = instances.add(channel.identifier, channel);

            properties.onPersist?.(channel);

            return okAsync();
          }
        ),
      terminate: (identifier: ChannelIdentifier) =>
        instances.get(identifier).ifPresentOrElse(
          _ => {
            instances = instances.remove(identifier);

            properties.onTerminate?.(identifier);

            return okAsync<void, CommonError>();
          },
          () =>
            errAsync<void, CommonError>({
              type: 'not-found',
              context: identifier.value,
            })
        ),
    };
  },
  prepare: (overrides, seed) => ({
    instances: overrides.instances ?? Builder(ChannelFactory).buildListWith(10, seed),
  }),
  retrieve: _ => {
    throw new Error('Repository cannot be retrieved.');
  },
});

export type RuleProperties = {
  platform: PlatformType;
  maxConcurrentChecks: number;
  rateLimitWindow: number;
  maxRequestsPerWindow: number;
  backoffMultiplier: number;
};

export const RuleFactory = Factory<Rule, RuleProperties>({
  instantiate: properties => Rule(properties),
  prepare: (overrides, seed) => ({
    platform: overrides.platform ?? Builder(PlatformTypeFactory).buildWith(seed),
    maxConcurrentChecks: overrides.maxConcurrentChecks ?? 1,
    rateLimitWindow: overrides.rateLimitWindow ?? 1000,
    maxRequestsPerWindow: overrides.maxRequestsPerWindow ?? 10,
    backoffMultiplier: overrides.backoffMultiplier ?? 2,
  }),
  retrieve: instance => ({
    platform: instance.platform,
    maxConcurrentChecks: instance.maxConcurrentChecks,
    rateLimitWindow: instance.rateLimitWindow,
    maxRequestsPerWindow: instance.maxRequestsPerWindow,
    backoffMultiplier: instance.backoffMultiplier,
  }),
});

export type PlanProperties = {
  channels: ImmutableList<Channel>;
  scheduledAt: ImmutableDate;
  estimatedDuration: number;
  platformGroups: ImmutableMap<PlatformType, ImmutableList<Channel>>;
};

export const PlanFactory = Factory<Plan, PlanProperties>({
  instantiate: properties => Plan(properties),
  prepare: (overrides, seed) => ({
    channels: overrides.channels ?? Builder(ChannelFactory).buildListWith(5, seed),
    scheduledAt: overrides.scheduledAt ?? Builder(ImmutableDateFactory).buildWith(seed),
    estimatedDuration: overrides.estimatedDuration ?? 3600,
    platformGroups: overrides.platformGroups ?? ImmutableMap.empty(),
  }),
  retrieve: instance => ({
    channels: instance.channels.map(channel => Channel(channel)),
    scheduledAt: instance.scheduledAt,
    estimatedDuration: instance.estimatedDuration,
    platformGroups: instance.platformGroups.map((key, value) => [
      key,
      value.map(channel => Channel(channel)),
    ]),
  }),
});

export type MonitoringStartedProperties = {
  channel: ChannelIdentifier;
};

export const MonitoringStartedFactory = Factory<MonitoringStarted, MonitoringStartedProperties>({
  instantiate: properties => MonitoringStarted(properties),
  prepare: (overrides, seed) => ({
    channel: overrides.channel ?? Builder(ChannelIdentifierFactory).buildWith(seed),
  }),
  retrieve: instance => ({
    channel: instance.channel,
  }),
});

expect.extend({
  toBeSameChannel(actual: Channel, expected: Channel) {
    expect(actual.identifier).toEqualValueObject(expected.identifier);
    expect(actual.setting).toEqualValueObject(expected.setting);
    expect(actual.timestamp).toEqualValueObject(expected.timestamp);
    expect(actual.lastCheckedAt).toBeNullOr(
      expected.lastCheckedAt,
      (expectedLastCheckedAt, actualLastCheckedAt) => {
        expect(actualLastCheckedAt).toEqualValueObject(expectedLastCheckedAt);
      }
    );

    return {
      message: () => 'OK',
      pass: true,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSameChannel(expected: Channel): R;
    }
  }
}
