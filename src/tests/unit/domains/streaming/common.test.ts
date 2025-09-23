import { PlatformType } from 'domains/common/platform';
import {
  LiveStream,
  LiveStreamIdentifier,
  LiveStreamSnapshot,
  LiveStreamURL,
  Status,
  StreamEnded,
  StreamStarted,
} from 'domains/streaming';

import { Builder, StringFactory } from 'tests/factories';
import { ImmutableDateFactory } from 'tests/factories/domains/common/date';
import { PlatformTypeFactory } from 'tests/factories/domains/common/platform';
import { URLFactory } from 'tests/factories/domains/common/uri';
import { ChannelIdentifierFactory } from 'tests/factories/domains/monitoring';
import {
  LiveStreamIdentifierFactory,
  LiveStreamSnapshotFactory,
  LiveStreamURLFactory,
  StatusFactory,
} from 'tests/factories/domains/streaming';
import { uuidV4FromSeed } from 'tests/helpers';

import { ValueObjectTest } from '../common/value-object';

describe('Package common', () => {
  describe('LiveStreamIdentifier', () => {
    ValueObjectTest(
      LiveStreamIdentifier,
      {
        value: Builder(StringFactory(1, 1)).build(),
        platform: Builder(PlatformTypeFactory).build(),
      },
      [
        { value: Builder(StringFactory(1, 64)).build() },
        { value: Builder(StringFactory(64, 64)).build() },
      ],
      [{ value: '' }, { value: Builder(StringFactory(65, 65)).build() }]
    );
  });

  describe('LiveStreamURL', () => {
    const platform = Builder(PlatformTypeFactory).build();

    ValueObjectTest(
      LiveStreamURL,
      {
        value: Builder(URLFactory).build(),
        channel: Builder(ChannelIdentifierFactory).build({ platform }),
      },
      Object.values(PlatformType)
        .filter(candidate => candidate !== platform)
        .map(platform => ({
          channel: Builder(ChannelIdentifierFactory).build({ platform }),
        })),
      [{ value: 'invalid' }, { value: 123 }, { channel: 'invalid' }]
    );
  });

  describe('LiveStreamSnapshot', () => {
    const platform = Builder(PlatformTypeFactory).build();

    ValueObjectTest(
      LiveStreamSnapshot,
      {
        identifier: Builder(LiveStreamIdentifierFactory).build({ platform }),
        title: Builder(StringFactory(1, 128)).build(),
        url: Builder(LiveStreamURLFactory).build({
          channel: Builder(ChannelIdentifierFactory).build({ platform }),
        }),
        startedAt: Builder(ImmutableDateFactory).build(),
        finishedAt: null,
        status: Builder(StatusFactory).build({ exclusion: Status.ENDED }),
      },
      [
        {
          startedAt: Builder(ImmutableDateFactory).build({ value: 100 }),
          finishedAt: Builder(ImmutableDateFactory).build({ value: 101 }),
          status: Status.ENDED,
        },
        {
          startedAt: Builder(ImmutableDateFactory).build({ value: 100 }),
          finishedAt: Builder(ImmutableDateFactory).build({ value: 100 }),
          status: Status.ENDED,
        },
      ],
      [
        {
          startedAt: Builder(ImmutableDateFactory).build({ value: 101 }),
          finishedAt: Builder(ImmutableDateFactory).build({ value: 100 }),
          status: Status.ENDED,
        },
        {
          finishedAt: null,
          status: Status.ENDED,
        },
        {
          identifier: Builder(LiveStreamIdentifierFactory).build({
            platform: Builder(PlatformTypeFactory).build({ exclusion: platform }),
          }),
        },
        {
          url: Builder(LiveStreamURLFactory).build({
            channel: Builder(ChannelIdentifierFactory).build({
              platform: Builder(PlatformTypeFactory).build({ exclusion: platform }),
            }),
          }),
        },
      ]
    );
  });

  describe('LiveStream', () => {
    describe('instantiate', () => {
      describe('successfully', () => {
        it('should be returns LiveStream', () => {
          const platform = Builder(PlatformTypeFactory).build();
          const identifier = Builder(LiveStreamIdentifierFactory).build({ platform });
          const title = Builder(StringFactory(1, 128)).build();
          const url = Builder(LiveStreamURLFactory).build({
            channel: Builder(ChannelIdentifierFactory).build({ platform }),
          });
          const startedAt = Builder(ImmutableDateFactory).build();
          const finishedAt = Builder(ImmutableDateFactory).build({
            value: startedAt.timestamp + 100,
          });
          const status = Builder(StatusFactory).build({ exclusion: Status.ENDED });

          const liveStream = LiveStream({
            identifier,
            title,
            url,
            startedAt,
            finishedAt,
            status,
          });

          expect(liveStream.identifier).toEqualValueObject(identifier);
          expect(liveStream.title).toBe(title);
          expect(liveStream.url).toEqualValueObject(url);
          expect(liveStream.startedAt).toEqualValueObject(startedAt);
          expect(liveStream.finishedAt).toEqualValueObject(finishedAt);
          expect(liveStream.status).toBe(status);
          expect(typeof liveStream.snapshot).toBe('function');
        });
      });

      describe('unsuccessfully', () => {
        it.each([
          {
            startedAt: Builder(ImmutableDateFactory).build({ value: 101 }),
            finishedAt: Builder(ImmutableDateFactory).build({ value: 100 }),
            status: Status.ENDED,
          },
          {
            finishedAt: null,
            status: Status.ENDED,
          },
        ])('should throws error %s', invalid => {
          const identifier = Builder(LiveStreamIdentifierFactory).build();
          const title = Builder(StringFactory(1, 128)).build();
          const url = Builder(LiveStreamURLFactory).build();
          const startedAt = Builder(ImmutableDateFactory).build();

          expect(() =>
            LiveStream({ identifier, title, url, startedAt, ...invalid })
          ).toThrowError();
        });
      });
    });

    describe('snapshot', () => {
      it('should be returns LiveStreamSnapshot', () => {
        const expected = Builder(LiveStreamSnapshotFactory).build();

        const liveStream = LiveStream({
          identifier: expected.identifier,
          title: expected.title,
          url: expected.url,
          startedAt: expected.startedAt,
          finishedAt: expected.finishedAt,
          status: expected.status,
        });

        const actual = liveStream.snapshot();

        expect(actual).toEqualValueObject(expected);
      });
    });
  });

  describe('StreamStarted', () => {
    describe('instantiate', () => {
      describe('successfully', () => {
        it('should be returns event', () => {
          const snapshot = Builder(LiveStreamSnapshotFactory).build();
          const identifier = uuidV4FromSeed(Math.random());
          const occurredAt = Builder(ImmutableDateFactory).build();

          const event = StreamStarted({
            identifier,
            occurredAt,
            snapshot,
          });

          expect(identifier).toBe(event.identifier);
          expect(occurredAt).toEqualValueObject(event.occurredAt);
          expect(snapshot).toEqualValueObject(event.snapshot);
          expect(event.type).toBe('StreamStarted');
        });
      });
    });
  });

  describe('StreamEnded', () => {
    describe('instantiate', () => {
      describe('successfully', () => {
        it('should be returns event', () => {
          const identifier = uuidV4FromSeed(Math.random());
          const occurredAt = Builder(ImmutableDateFactory).build();
          const stream = Builder(LiveStreamIdentifierFactory).build();

          const event = StreamEnded({ identifier, occurredAt, stream });

          expect(identifier).toBe(event.identifier);
          expect(occurredAt).toEqualValueObject(event.occurredAt);
          expect(stream).toEqualValueObject(event.stream);
          expect(event.type).toBe('StreamEnded');
        });
      });
    });
  });
});
