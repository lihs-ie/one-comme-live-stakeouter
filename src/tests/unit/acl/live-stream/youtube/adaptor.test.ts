import { RawMedia, Reader, Translator, YoutubeAdaptor } from 'acl/live-stream/youtube';
import { HttpClient } from 'aspects/http';

import { ImmutableRange } from 'domains/common/collections';
import { PlatformType } from 'domains/common/platform';
import { Status } from 'domains/streaming';

import { Builder, StringFactory } from 'tests/factories';
import { URLFactory } from 'tests/factories/domains/common/uri';
import { ChannelIdentifierFactory } from 'tests/factories/domains/monitoring';
import {
  LiveStreamFactory,
  LiveStreamIdentifierFactory,
  LiveStreamURLFactory,
  StatusFactory,
} from 'tests/factories/domains/streaming';
import { Type } from 'tests/mock/upstreams/common';
import { prepare } from 'tests/mock/upstreams/youtube';

describe('Package adaptor', () => {
  const endpoint = 'http://localhost';

  describe('Adaptor', () => {
    describe('findByChannel', () => {
      beforeEach(() => {
        fetchMock.enableMocks();
      });

      afterEach(() => {
        fetchMock.resetMocks();
        fetchMock.disableMocks();
      });

      describe('successfully', () => {
        it('should translate returns SuccessResult with valid media', async () => {
          const baseURL = 'https://example.com/';

          const platform = PlatformType.YOUTUBE;
          const identifier = Builder(LiveStreamIdentifierFactory).build({ platform });
          const channel = Builder(ChannelIdentifierFactory).build({ platform });

          const expected = Builder(LiveStreamFactory).build({
            identifier,
            url: Builder(LiveStreamURLFactory).build({
              value: Builder(URLFactory).build({
                value: `${baseURL}${identifier.value}`,
              }),
              channel,
            }),
            status: Builder(StatusFactory).build({ exclusion: Status.ENDED }),
          });

          const apiKey = Builder(StringFactory(1, 255)).build();

          prepare(endpoint, upstream =>
            upstream.addLiveStream(Type.OK, { model: expected, apiKey })
          );

          const adaptor = YoutubeAdaptor(
            HttpClient({ baseURL: endpoint }),
            apiKey,
            Reader,
            Translator(baseURL)
          );

          const actual = await adaptor.findByChannel(channel);

          expect(actual.isOk()).toBeTruthy();
          expect(actual._unsafeUnwrap()).toBeSameLiveStream(expected);
        });
      });

      describe('unsuccessfully', () => {
        it('should translate returns ErrorResult with empty items', async () => {
          const channel = Builder(ChannelIdentifierFactory).build();
          const apiKey = Builder(StringFactory(1, 255)).build();

          prepare(endpoint, upstream =>
            upstream.addLiveStream(Type.OK, { apiKey, media: { items: [] }, channel })
          );

          const adaptor = YoutubeAdaptor(
            HttpClient({ baseURL: endpoint }),
            apiKey,
            Reader,
            Translator('http://example.com/')
          );

          const actual = await adaptor.findByChannel(channel);

          expect(actual.isErr()).toBeTruthy();

          const error = actual._unsafeUnwrapErr();
          expect(error.type).toBe('not-found');
        });

        it('should translate returns ErrorResult without live item', async () => {
          const count = Math.floor(Math.random() * 10 + 1);
          const channel = Builder(ChannelIdentifierFactory).build();
          const apiKey = Builder(StringFactory(1, 255)).build();

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
                channelId: channel.value,
                channelTitle: `ChannelTitle-${index}`,
                liveBroadcastContent: (['none', 'upcoming'] as const)[index % 2]!,
                publishTime: new Date().toISOString(),
              },
            }))
            .toArray();

          prepare(endpoint, upstream =>
            upstream.addLiveStream(Type.OK, { apiKey, channel, media: { items } })
          );

          const adaptor = YoutubeAdaptor(
            HttpClient({ baseURL: endpoint }),
            apiKey,
            Reader,
            Translator('http://example.com/')
          );

          const actual = await adaptor.findByChannel(channel);

          expect(actual.isErr()).toBeTruthy();

          const error = actual._unsafeUnwrapErr();
          expect(error.type).toBe('not-found');
        });

        it.each(Object.values(Type).filter(type => type !== 'ok'))(
          'should returns ErrorResult when error response with %s',
          async type => {
            const channel = Builder(ChannelIdentifierFactory).build();
            const apiKey = Builder(StringFactory(1, 255)).build();

            prepare(endpoint, upstream => upstream.addLiveStream(type, { apiKey, channel }));

            const adaptor = YoutubeAdaptor(
              HttpClient({ baseURL: endpoint }),
              apiKey,
              Reader,
              Translator('http://example.com/')
            );

            const actual = await adaptor.findByChannel(channel);

            expect(actual.isErr()).toBeTruthy();
          }
        );
      });
    });
  });
});
