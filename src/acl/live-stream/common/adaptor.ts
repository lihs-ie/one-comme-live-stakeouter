import { ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';

import { PlatformType } from 'domains/common/platform';
import { ChannelIdentifier } from 'domains/monitoring';
import { LiveStream } from 'domains/streaming';

export type LiveStreamAdaptor<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  type: PlatformType;
  support: (type: PlatformType) => boolean;
  findByChannel: (channel: ChannelIdentifier) => ResultAsync<LiveStream, CommonError>;
};

export const LiveStreamAdaptor = <T extends Record<string, unknown> = Record<string, unknown>>(
  type: PlatformType,
  findByChannel: (channel: ChannelIdentifier) => ResultAsync<LiveStream, CommonError>,
  properties: T = {} as T
): LiveStreamAdaptor<T> => ({
  type,
  support: (comparand: PlatformType) => comparand === type,
  findByChannel,
  ...properties,
});
