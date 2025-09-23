import { ResultAsync } from 'neverthrow';
import { z } from 'zod';

import { CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';
import { functionSchemaReturning } from 'aspects/type';

import { ImmutableList, immutableListSchema } from '../common/collections/list';
import { ImmutableMap, immutableMapSchema } from '../common/collections/map/common';
import { ImmutableDate, immutableDateSchema, Timestamp, timestampSchema } from '../common/date';
import { createEvent, eventSchema, Subscriber } from '../common/event';
import { PlatformType, platformTypeSchema } from '../common/platform';
import { ValueObject, valueObjectSchema } from '../common/value-object';

export const monitoringSettingSchema = valueObjectSchema
  .extend({
    checkInterval: z.number().min(10).max(3600).nullable(),
    isMonitoring: z.boolean(),
  })
  .brand('MonitoringSetting');

export type MonitoringSetting = ValueObject<z.infer<typeof monitoringSettingSchema>>;

export const MonitoringSetting = ValueObject<MonitoringSetting>(monitoringSettingSchema);

export const channelIdentifierSchema = valueObjectSchema
  .extend({
    value: z.string().min(1).max(64),
    platform: platformTypeSchema,
  })
  .brand('ChannelIdentifier');

export type ChannelIdentifier = ValueObject<z.infer<typeof channelIdentifierSchema>>;

export const ChannelIdentifier = ValueObject<ChannelIdentifier>(channelIdentifierSchema);

export interface ChannelProperties extends z.infer<typeof channelBaseSchema> {
  toggleMonitoring: () => ChannelProperties;
}

const channelBaseSchema = z.object({
  identifier: channelIdentifierSchema,
  setting: monitoringSettingSchema,
  lastCheckedAt: immutableDateSchema.nullable(),
  timestamp: timestampSchema,
});

export const channelSchema: z.ZodType<ChannelProperties> = channelBaseSchema
  .extend({
    toggleMonitoring: functionSchemaReturning(z.lazy(() => channelSchema)),
  })
  .brand('Channel');

export type Channel = z.infer<typeof channelSchema>;

export const Channel = (properties: {
  identifier: ChannelIdentifier;
  setting: MonitoringSetting;
  lastCheckedAt: ImmutableDate | null;
  timestamp: Timestamp;
}): Channel => {
  const toggle = (isMonitoring: boolean): Channel =>
    channelSchema.parse({
      ...properties,
      setting: MonitoringSetting({
        checkInterval: properties.setting.checkInterval,
        isMonitoring,
      }),
      timestamp: timestampSchema.parse({
        ...properties.timestamp,
        updatedAt: ImmutableDate.now(),
      }),
      toggleMonitoring: () => toggle(!isMonitoring),
    });

  return channelSchema.parse({
    ...properties,
    toggleMonitoring: () => toggle(!properties.setting.isMonitoring),
  });
};

export interface ChannelRepository {
  find: (identifier: ChannelIdentifier) => ResultAsync<Channel, CommonError>;
  monitoring: () => ResultAsync<ImmutableList<Channel>, CommonError>;
  persist: (channel: Channel) => ResultAsync<void, CommonError>;
  terminate: (identifier: ChannelIdentifier) => ResultAsync<void, CommonError>;
}

// 監視ドメインサービスルール
export const ruleSchema = z
  .object({
    platform: platformTypeSchema,
    maxConcurrentChecks: z.number().int(),
    rateLimitWindow: z.number().int().min(1), // in seconds
    maxRequestsPerWindow: z.number().int().min(1),
    backoffMultiplier: z.number().min(1),
  })
  .brand('Rule');

export type Rule = z.infer<typeof ruleSchema>;

export const Rule = (properties: {
  platform: PlatformType;
  maxConcurrentChecks: number;
  rateLimitWindow: number;
  maxRequestsPerWindow: number;
  backoffMultiplier: number;
}) => ruleSchema.parse(properties);

// 監視ドメインサービス設定
export const planSchema = z
  .object({
    channels: immutableListSchema(channelSchema),
    scheduledAt: immutableDateSchema,
    estimatedDuration: z.number().int().min(1), // in seconds
    platformGroups: immutableMapSchema(platformTypeSchema, immutableListSchema(channelSchema)),
  })
  .brand('Plan');

export type Plan = z.infer<typeof planSchema>;

export const Plan = (properties: {
  channels: ImmutableList<Channel>;
  scheduledAt: ImmutableDate;
  estimatedDuration: number;
  platformGroups: ImmutableMap<PlatformType, ImmutableList<Channel>>;
}) => planSchema.parse(properties);

export const monitoringStartedSchema = eventSchema(z.literal('MonitoringStarted'))
  .extend({
    channel: channelIdentifierSchema,
  })
  .brand('MonitoringStartedEvent');

export type MonitoringStarted = z.infer<typeof monitoringStartedSchema>;

export const MonitoringStarted = createEvent<MonitoringStarted>(
  monitoringStartedSchema,
  'MonitoringStarted'
);

export const MonitoringSubscriber = (repository: ChannelRepository, logger: Logger): Subscriber => {
  return {
    subscribe: broker => {
      return broker
        .listen<MonitoringStarted>('MonitoringStarted', event => {
          logger.info(
            `[MonitoringSubscriber::MonitoringStarted] incoming ${JSON.stringify(event.channel)}`
          );
        })
        .listen<MonitoringStarted>('MonitoringStarted', event => {
          logger.info(
            `[MonitoringSubscriber::MonitoringStarted] incoming ${JSON.stringify(event.channel)}`
          );
        });
    },
  };
};
