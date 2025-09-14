import { errAsync, okAsync } from 'neverthrow';

import { CommonError, conflict, NotFoundError } from 'aspects/error';

import { ImmutableList, ImmutableMap } from 'domains/common/collections';
import { ImmutableDate } from 'domains/common/date';
import { PlatformType } from 'domains/common/platform';
import { URL } from 'domains/common/uri';
import { ChannelIdentifier } from 'domains/monitoring';
import {
  LiveStream,
  LiveStreamIdentifier,
  LiveStreamRepository,
  LiveStreamSnapshot,
  LiveStreamURL,
  Status,
  StreamEnded,
  StreamStarted,
} from 'domains/streaming';

import { Builder, EnumFactory, Factory, StringFactory } from 'tests/factories/builder';
import { uuidV4FromSeed } from 'tests/helpers';

import { ImmutableDateFactory } from '../common/date';
import { PlatformTypeFactory } from '../common/platform';
import { URLFactory } from '../common/uri';
import { ChannelIdentifierFactory } from '../monitoring';

export type LiveStreamIdentifierProperties = {
  value: string;
};

export const LiveStreamIdentifierFactory = Factory<
  LiveStreamIdentifier,
  LiveStreamIdentifierProperties
>({
  instantiate: properties => LiveStreamIdentifier(properties),
  prepare: (overrides, seed) => ({
    value: overrides.value ?? Builder(StringFactory(1, 64)).buildWith(seed),
  }),
  retrieve: properties => ({
    value: properties.value,
  }),
});

export type LiveStreamURLProperties = {
  value: URL;
  platform: PlatformType;
  channel: ChannelIdentifier;
};

export const LiveStreamURLFactory = Factory<LiveStreamURL, LiveStreamURLProperties>({
  instantiate: properties => LiveStreamURL(properties),
  prepare: (overrides, seed): LiveStreamURLProperties => ({
    value: overrides.value ?? Builder(URLFactory).buildWith(seed),
    platform: overrides.platform ?? Builder(PlatformTypeFactory).buildWith(seed),
    channel: overrides.channel ?? Builder(ChannelIdentifierFactory).buildWith(seed),
  }),
  retrieve: (instance: LiveStreamURL): LiveStreamURLProperties => ({
    value: instance.value,
    platform: instance.platform,
    channel: instance.channel,
  }),
});

export const StatusFactory = EnumFactory(Status);

export type LiveStreamProperties = {
  identifier: LiveStreamIdentifier;
  title: string;
  url: LiveStreamURL;
  startedAt: ImmutableDate;
  finishedAt: ImmutableDate | null;
  status: Status;
};

export const LiveStreamFactory = Factory<LiveStream, LiveStreamProperties>({
  instantiate: properties => LiveStream(properties),
  prepare: (overrides, seed) => {
    const status = overrides.status ?? Builder(StatusFactory).buildWith(seed);

    return {
      identifier: overrides.identifier ?? Builder(LiveStreamIdentifierFactory).buildWith(seed),
      title: overrides.title ?? Builder(StringFactory(1, 128)).buildWith(seed),
      url: overrides.url ?? Builder(LiveStreamURLFactory).buildWith(seed),
      startedAt: overrides.startedAt ?? Builder(ImmutableDateFactory).buildWith(seed),
      finishedAt: overrides.finishedAt
        ? overrides.finishedAt
        : status === Status.ENDED
          ? Builder(ImmutableDateFactory).buildWith(seed)
          : null,
      status,
    };
  },
  retrieve: instance => ({
    identifier: LiveStreamIdentifier(instance.identifier),
    title: instance.title,
    url: LiveStreamURL(instance.url),
    startedAt: instance.startedAt,
    finishedAt: instance.finishedAt,
    status: instance.status,
  }),
});

export type LiveStreamSnapshotProperties = {
  identifier: LiveStreamIdentifier;
  title: string;
  url: LiveStreamURL;
  startedAt: ImmutableDate;
  finishedAt: ImmutableDate | null;
  status: Status;
};

export const LiveStreamSnapshotFactory = Factory<LiveStreamSnapshot, LiveStreamSnapshotProperties>({
  instantiate: properties => LiveStreamSnapshot(properties),
  prepare: (overrides, seed) => {
    const status = overrides.status ?? Builder(StatusFactory).buildWith(seed);

    return {
      identifier: overrides.identifier ?? Builder(LiveStreamIdentifierFactory).buildWith(seed),
      title: overrides.title ?? Builder(StringFactory(1, 128)).buildWith(seed),
      url: overrides.url ?? Builder(LiveStreamURLFactory).buildWith(seed),
      startedAt: overrides.startedAt ?? Builder(ImmutableDateFactory).buildWith(seed),
      finishedAt: overrides.finishedAt
        ? overrides.finishedAt
        : status === Status.ENDED
          ? Builder(ImmutableDateFactory).buildWith(seed)
          : null,
      status,
    };
  },
  retrieve: instance => ({
    identifier: LiveStreamIdentifier(instance.identifier),
    title: instance.title,
    url: LiveStreamURL(instance.url),
    startedAt: instance.startedAt,
    finishedAt: instance.finishedAt,
    status: instance.status,
  }),
});

export type StreamStartedProperties = {
  identifier: string;
  snapshot: LiveStreamSnapshot;
  occurredAt: ImmutableDate;
  type: StreamStarted['type'];
};

export const StreamStartedFactory = Factory<StreamStarted, StreamStartedProperties>({
  instantiate: properties => StreamStarted(properties),
  prepare: (overrides, seed) => ({
    identifier: overrides.identifier ?? uuidV4FromSeed(seed),
    snapshot: overrides.snapshot ?? Builder(LiveStreamSnapshotFactory).buildWith(seed),
    occurredAt: overrides.occurredAt ?? Builder(ImmutableDateFactory).buildWith(seed),
    type: overrides.type ?? 'StreamStarted',
  }),
  retrieve: instance => ({
    identifier: instance.identifier,
    snapshot: LiveStreamSnapshot(instance.snapshot),
    occurredAt: instance.occurredAt,
    type: instance.type,
  }),
});

export type StreamEndedProperties = {
  identifier: string;
  stream: LiveStreamIdentifier;
  occurredAt: ImmutableDate;
  type: StreamEnded['type'];
};

export const StreamEndedFactory = Factory<StreamEnded, StreamEndedProperties>({
  instantiate: properties => StreamEnded(properties),
  prepare: (overrides, seed) => ({
    identifier: overrides.identifier ?? uuidV4FromSeed(seed),
    stream: overrides.stream ?? Builder(LiveStreamIdentifierFactory).buildWith(seed),
    occurredAt: overrides.occurredAt ?? Builder(ImmutableDateFactory).buildWith(seed),
    type: overrides.type ?? 'StreamEnded',
  }),
  retrieve: instance => ({
    identifier: instance.identifier,
    stream: LiveStreamIdentifier(instance.stream),
    occurredAt: instance.occurredAt,
    type: instance.type,
  }),
});

export type LiveStreamRepositoryProperties = {
  instances: ImmutableList<LiveStream>;
  onPersist?: (instance: LiveStream) => void;
  onTerminate?: (instance: LiveStream) => void;
};

export const LiveStreamRepositoryFactory = Factory<
  LiveStreamRepository,
  LiveStreamRepositoryProperties
>({
  instantiate: properties => {
    let instances: ImmutableMap<LiveStreamIdentifier, LiveStream> = ImmutableMap.fromArray(
      properties.instances
        .map((instance): [LiveStreamIdentifier, LiveStream] => [instance.identifier, instance])
        .toArray()
    );

    return {
      find: (identifier: LiveStreamIdentifier) =>
        instances.get(identifier).ifPresentOrElse(
          instance => okAsync<LiveStream, NotFoundError>(instance),
          () =>
            errAsync<LiveStream, NotFoundError>({
              type: 'not-found',
              context: JSON.stringify(identifier),
            })
        ),
      findByChannel: (channel: ChannelIdentifier) =>
        instances
          .find((_, instance) => channel.equals(instance.url.channel))
          .ifPresentOrElse(
            instance => okAsync<LiveStream, NotFoundError>(instance),
            () => errAsync<LiveStream, NotFoundError>({ type: 'not-found', context: channel.value })
          ),
      persist: (instance: LiveStream) => {
        return instances.get(instance.identifier).ifPresentOrElse(
          _ => errAsync<void, CommonError>(conflict(JSON.stringify(instance))),
          () => {
            instances = instances.add(instance.identifier, instance);

            properties.onPersist?.(instance);

            return okAsync<void, CommonError>();
          }
        );
      },
      terminate: (identifier: LiveStreamIdentifier) => {
        return instances.get(identifier).ifPresentOrElse(
          instance => {
            instances = instances.remove(identifier);

            properties.onTerminate?.(instance);

            return okAsync<void, NotFoundError>();
          },
          () =>
            errAsync<void, NotFoundError>({
              type: 'not-found',
              context: JSON.stringify(identifier),
            })
        );
      },
    };
  },
  prepare: (overrides, seed) => ({
    instances: Builder(LiveStreamFactory).buildListWith(10, seed),
    ...overrides,
  }),
  retrieve: _ => {
    throw new Error('Repository cannot be retrieved.');
  },
});

expect.extend({
  toBeSameLiveStream(actual: LiveStream, expected: LiveStream) {
    expect(actual.identifier).toEqualValueObject(expected.identifier);
    expect(actual.title).toEqual(expected.title);
    expect(actual.url).toEqualValueObject(expected.url);
    expect(actual.startedAt).toEqualValueObject(expected.startedAt);
    expect(actual.finishedAt).toBeNullOr(
      expected.finishedAt,
      (expectedFinishedAt, actualFinishedAt) =>
        expect(actualFinishedAt).toEqualValueObject(expectedFinishedAt)
    );
    expect(actual.status).toBe(expected.status);

    return {
      message: () => 'OK',
      pass: true,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSameLiveStream(expected: LiveStream): R;
    }
  }
}
