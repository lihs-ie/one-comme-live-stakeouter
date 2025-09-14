import { RawMedia, Reader, Translator } from 'acl/live-stream/youtube';

import { ImmutableRange } from 'domains/common/collections';
import { PlatformType } from 'domains/common/platform';
import { Status } from 'domains/streaming';

import { Builder } from 'tests/factories';
import { URLFactory } from 'tests/factories/domains/common/uri';
import {
  LiveStreamFactory,
  LiveStreamIdentifierFactory,
  LiveStreamURLFactory,
  StatusFactory,
} from 'tests/factories/domains/streaming';
import { LiveStreamMedia } from 'tests/mock/upstreams/youtube/media/live-stream';

describe('Package translator', () => {
  describe('Translator', () => {
    describe('translate', () => {
      describe('successfully', () => {
        it('should translate returns SuccessResult with valid media', () => {
          const baseURL = 'https://example.com/';
          const identifier = Builder(LiveStreamIdentifierFactory).build();

          const expected = Builder(LiveStreamFactory).build({
            identifier,
            url: Builder(LiveStreamURLFactory).build({
              value: Builder(URLFactory).build({ value: `${baseURL}${identifier.value}` }),
              platform: PlatformType.YOUTUBE,
            }),
            status: Builder(StatusFactory).build({ exclusion: Status.ENDED }),
          });

          const media = new LiveStreamMedia(expected);

          const actual = Translator(baseURL).translate(
            Reader.read(media.createSuccessfulContent())._unsafeUnwrap()
          );

          expect(actual.isOk()).toBeTruthy();
          expect(actual._unsafeUnwrap()).toBeSameLiveStream(expected);
        });
      });

      describe('unsuccessfully', () => {
        it('should translate returns ErrorResult with empty items', () => {
          const media = new LiveStreamMedia({ items: [] });

          const actual = Translator('http://example.com/').translate(
            Reader.read(media.createSuccessfulContent())._unsafeUnwrap()
          );

          expect(actual.isErr()).toBeTruthy();

          const error = actual._unsafeUnwrapErr();
          expect(error.type).toBe('not-found');
        });

        it('should translate returns ErrorResult without live item', () => {
          const count = Math.floor(Math.random() * 10 + 1);
          const items = ImmutableRange(0, count)
            .map((index): RawMedia['items'][number] => ({
              kind: 'youtube#searchResult',
              etag: `etag${index}`,
              id: {
                kind: 'youtube#video',
                videoId: `videoId${index}`,
              },
              snippet: {
                publishedAt: new Date().toISOString(),
                title: `Title-${index}`,
                description: `Description-${index}`,
                thumbnails: {
                  default: {
                    url: `https://example.com/thumbnail${index}.jpg`,
                    width: 120,
                    height: 90,
                  },
                  high: {
                    url: `https://example.com/thumbnail${index}_high.jpg`,
                    width: 480,
                    height: 360,
                  },
                  medium: {
                    url: `https://example.com/thumbnail${index}_medium.jpg`,
                    width: 320,
                    height: 180,
                  },
                },
                channelId: `channelId-${index}`,
                channelTitle: `ChannelTitle-${index}`,
                liveBroadcastContent: (['none', 'upcoming'] as const)[index % 2]!,
                publishTime: new Date().toISOString(),
              },
            }))
            .toArray();

          const media = new LiveStreamMedia({ items });

          const actual = Translator('http://example.com/').translate(
            Reader.read(media.createSuccessfulContent())._unsafeUnwrap()
          );

          expect(actual.isErr()).toBeTruthy();

          const error = actual._unsafeUnwrapErr();
          expect(error.type).toBe('not-found');
        });
      });
    });
  });
});
