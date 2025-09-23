import { ResultAsync } from 'neverthrow';
import { z } from 'zod';

import { CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';
import { createFunctionSchema } from 'aspects/type';

import { ImmutableDate, immutableDateSchema } from 'domains/common/date';

import { createEvent, eventSchema, Subscriber } from '../common/event';
import { platformTypeSchema } from '../common/platform';
import { urlSchema } from '../common/uri';
import { ValueObject, valueObjectSchema } from '../common/value-object';
import { ChannelIdentifier, channelIdentifierSchema } from '../monitoring';

export const liveStreamIdentifierSchema = valueObjectSchema
  .extend({
    value: z.string().min(1).max(64),
    platform: platformTypeSchema,
  })
  .brand('LiveStreamIdentifier');

export type LiveStreamIdentifier = ValueObject<z.infer<typeof liveStreamIdentifierSchema>>;

export const LiveStreamIdentifier = ValueObject<LiveStreamIdentifier>(liveStreamIdentifierSchema);

export const liveStreamURLSchema = valueObjectSchema
  .extend({
    value: urlSchema,
    channel: channelIdentifierSchema,
  })
  .brand('LiveStreamURL');

export type LiveStreamURL = ValueObject<z.infer<typeof liveStreamURLSchema>>;

export const LiveStreamURL = ValueObject<LiveStreamURL>(liveStreamURLSchema);

export const Status = {
  LIVE: 'live',
  UPCOMING: 'upcoming',
  ENDED: 'ended',
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const statusSchema = z.enum(Status);

export const liveStreamSnapshotSchema = valueObjectSchema
  .extend({
    identifier: liveStreamIdentifierSchema,
    title: z.string().min(1).max(128),
    url: liveStreamURLSchema,
    startedAt: immutableDateSchema,
    finishedAt: immutableDateSchema.nullable(),
    status: statusSchema,
  })
  .refine(
    data => {
      if (data.identifier.platform !== data.url.channel.platform) {
        return false;
      }

      return true;
    },
    {
      error: 'LiveStreamIdentifier and LiveStreamURL must have the same platform',
      path: ['url', 'identifier'],
    }
  )
  .refine(
    data => {
      if (data.finishedAt !== null && data.finishedAt.timestamp < data.startedAt.timestamp) {
        return false;
      }

      return true;
    },
    { error: 'FinishedAt must be after StartedAt if set', path: ['finishedAt'] }
  )
  .refine(
    data => {
      if (data.status === 'ended' && data.finishedAt === null) {
        return false;
      }

      return true;
    },
    { error: 'FinishedAt must be set if status is ended', path: ['finishedAt'] }
  )
  .brand('LiveStreamSnapshot');

export type LiveStreamSnapshot = ValueObject<z.infer<typeof liveStreamSnapshotSchema>>;

export const LiveStreamSnapshot = ValueObject<LiveStreamSnapshot>(liveStreamSnapshotSchema);

export const liveStreamSchema = z
  .object({
    identifier: liveStreamIdentifierSchema,
    title: z.string().min(1).max(128),
    url: liveStreamURLSchema,
    startedAt: immutableDateSchema,
    finishedAt: immutableDateSchema.nullable(),
    status: statusSchema,
    snapshot: createFunctionSchema(z.function({ input: [], output: liveStreamSnapshotSchema })),
  })
  .refine(
    data => {
      if (data.identifier.platform !== data.url.channel.platform) {
        return false;
      }

      return true;
    },
    {
      error: 'LiveStreamIdentifier and LiveStreamURL must have the same platform',
      path: ['url', 'identifier'],
    }
  )
  .refine(
    data => {
      if (data.finishedAt !== null && data.finishedAt.timestamp < data.startedAt.timestamp) {
        return false;
      }

      return true;
    },
    { error: 'FinishedAt must be after StartedAt if set', path: ['finishedAt'] }
  )
  .refine(
    data => {
      if (data.status === Status.ENDED && data.finishedAt === null) {
        return false;
      }

      return true;
    },
    { error: 'FinishedAt must be set if status is ended', path: ['finishedAt'] }
  )
  .brand('LiveStream');

export type LiveStream = z.infer<typeof liveStreamSchema>;

export const LiveStream = (properties: {
  identifier: LiveStreamIdentifier;
  title: string;
  url: LiveStreamURL;
  startedAt: ImmutableDate;
  finishedAt: ImmutableDate | null;
  status: Status;
}): LiveStream =>
  liveStreamSchema.parse({
    ...properties,
    snapshot: () => LiveStreamSnapshot(properties),
  });

const streamStarted = eventSchema(z.literal('StreamStarted'))
  .extend({
    snapshot: liveStreamSnapshotSchema,
  })
  .brand('StreamStarted');

export type StreamStarted = z.infer<typeof streamStarted>;

export const StreamStarted = createEvent<StreamStarted>(streamStarted, 'StreamStarted');

export const streamEndedSchema = eventSchema(z.literal('StreamEnded'))
  .extend({
    stream: liveStreamIdentifierSchema,
  })
  .brand('StreamEnded');

export type StreamEnded = z.infer<typeof streamEndedSchema>;

export const StreamEnded = createEvent<StreamEnded>(streamEndedSchema, 'StreamEnded');

export interface LiveStreamRepository {
  find: (identifier: LiveStreamIdentifier) => ResultAsync<LiveStream, CommonError>;
  findByChannel: (channel: ChannelIdentifier) => ResultAsync<LiveStream, CommonError>;
  persist: (stream: LiveStream) => ResultAsync<void, CommonError>;
  terminate: (identifier: LiveStreamIdentifier) => ResultAsync<void, CommonError>;
}

export const LiveStreamSubscriber = (
  repository: LiveStreamRepository,
  logger: Logger
): Subscriber => ({
  subscribe: broker => {
    return broker
      .listen<StreamStarted>('StreamStarted', event => {
        logger.info(`[StreamSubscriber::StreamStarted] incoming ${JSON.stringify(event.snapshot)}`);
      })
      .listen<StreamEnded>('StreamEnded', event => {
        logger.info(`[StreamSubscriber::StreamEnded] incoming ${JSON.stringify(event.stream)}`);
      });
  },
});
