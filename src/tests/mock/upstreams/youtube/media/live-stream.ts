import hash from 'hash-it';

import { Media, RawEntryMedia, RawMedia } from 'acl/live-stream/youtube';

import { ImmutableList, ImmutableRange } from 'domains/common/collections';
import { LiveStream, liveStreamSchema, Status } from 'domains/streaming';

import { Builder, StringFactory } from 'tests/factories';
import { ImmutableDateFactory } from 'tests/factories/domains/common/date';
import { URLFactory } from 'tests/factories/domains/common/uri';

import { MediaFactory } from '../../common';

export class LiveStreamMedia extends MediaFactory<Partial<RawMedia>, LiveStream> {
  public createSuccessfulContent(): string {
    return JSON.stringify(this._data);
  }

  public createFailureContent(): string {
    return JSON.stringify({
      errors: [
        {
          reason: 101,
          cause: 'unit',
          value: 'sku099',
        },
      ],
    });
  }

  protected fillByModel(overrides: LiveStream): RawMedia {
    const seed = hash(overrides);

    const liveBroadcastContent =
      ((): RawMedia['items'][number]['snippet']['liveBroadcastContent'] => {
        switch (overrides.status) {
          case Status.ENDED:
            return 'none';
          case Status.LIVE:
            return 'live';
          case Status.UPCOMING:
            return 'upcoming';
        }
      })();

    return {
      kind: 'youtube#searchResult',
      etag: Builder(StringFactory(1, 255)).buildWith(seed),
      regionCode: ['JP', 'US', 'CA'][seed % 3]!,
      pageInfo: {
        totalResults: 1,
        resultsPerPage: 1,
      },
      items: [
        {
          kind: 'youtube#searchResult',
          etag: Builder(StringFactory(1, 255)).buildWith(seed),
          id: {
            kind: 'youtube#video',
            videoId: overrides.identifier.value,
          },
          snippet: {
            publishedAt: overrides.startedAt.toISOString(),
            channelId: overrides.url.channel.value,
            title: overrides.title,
            description: Builder(StringFactory(1, 255)).buildWith(seed),
            thumbnails: {
              default: {
                url: Builder(URLFactory).buildWith(seed).value,
                width: 640,
                height: 360,
              },
              medium: {
                url: Builder(URLFactory).buildWith(seed).value,
                width: 1280,
                height: 720,
              },
              high: {
                url: Builder(URLFactory).buildWith(seed).value,
                width: 1920,
                height: 1080,
              },
            },
            channelTitle: Builder(StringFactory(1, 512)).buildWith(seed),
            liveBroadcastContent,
            publishTime: overrides.startedAt.toISOString(),
          },
        },
      ],
    };
  }

  protected fill(overrides?: Partial<RawMedia> | LiveStream): RawMedia {
    if (this.isModel(liveStreamSchema, overrides)) {
      return this.fillByModel(overrides);
    }

    const seed = hash(overrides) % 100000000;

    const itemsCount = seed % 10;

    return {
      kind: 'youtube#searchResult',
      etag: Builder(StringFactory(1, 255)).buildWith(seed),
      regionCode: ['JP', 'US', 'CA'][seed % 3]!,
      pageInfo: {
        totalResults: 1,
        resultsPerPage: 1,
      },
      items: ImmutableRange(0, itemsCount)
        .map(
          (index): RawEntryMedia => ({
            kind: 'youtube#searchResult',
            etag: Builder(StringFactory(1, 255)).buildWith(seed + index),
            id: {
              kind: 'youtube#video',
              videoId: String((seed % 10000000) + index),
            },
            snippet: {
              publishedAt: Builder(ImmutableDateFactory)
                .buildWith(seed + index)
                .toISOString(),
              channelId: String(seed + index),
              title: Builder(StringFactory(1, 255)).buildWith(seed + index),
              description: Builder(StringFactory(1, 255)).buildWith(seed + index),
              thumbnails: {
                default: {
                  url: Builder(URLFactory).buildWith(seed + index).value,
                  width: 640,
                  height: 360,
                },
                medium: {
                  url: Builder(URLFactory).buildWith(seed + index).value,
                  width: 1280,
                  height: 720,
                },
                high: {
                  url: Builder(URLFactory).buildWith(seed + index).value,
                  width: 1920,
                  height: 1080,
                },
              },
              channelTitle: Builder(StringFactory(1, 512)).buildWith(seed + index),
              liveBroadcastContent: 'none',
              publishTime: Builder(ImmutableDateFactory)
                .buildWith(seed + index)
                .toISOString(),
            },
          })
        )
        .toArray(),
      ...overrides,
    };
  }
}

expect.extend({
  toBeExpectedYoutubeLiveStreamMedia(actual: RawMedia, expected: Media) {
    expect(actual.kind).toBe(expected.kind);
    expect(actual.etag).toBe(expected.etag);
    expect(actual.regionCode).toBe(expected.regionCode);
    expect(actual.pageInfo).toStrictEqual(expected.pageInfo);
    expect(actual.items.length).toBe(expected.items.size());
    const itemsError = expected.items
      .zip(ImmutableList(actual.items))
      .map(([expectedItem, actualItem], index) => {
        try {
          expect(actualItem.kind).toBe(expectedItem.kind);
          expect(actualItem.etag).toBe(expectedItem.etag);
          expect(actualItem.id).toStrictEqual(expectedItem.id);
          expect(actualItem.snippet.publishedAt).toBe(
            expectedItem.snippet.publishedAt.toISOString()
          );
          expect(actualItem.snippet.channelId).toBe(expectedItem.snippet.channelId);
          expect(actualItem.snippet.title).toBe(expectedItem.snippet.title);
          expect(actualItem.snippet.description).toBe(expectedItem.snippet.description);
          expect(actualItem.snippet.thumbnails).toStrictEqual(expectedItem.snippet.thumbnails);
          expect(actualItem.snippet.liveBroadcastContent).toBe(
            expectedItem.snippet.liveBroadcastContent
          );
          expect(actualItem.snippet.publishTime).toBe(
            expectedItem.snippet.publishTime.toISOString()
          );

          return null;
        } catch (error) {
          return {
            message: () => `Index ${index} - ${(error as Error).message}`,
            pass: false,
          };
        }
      })
      .filter(result => result !== null);

    if (itemsError.isNotEmpty()) {
      return {
        message: () =>
          itemsError
            .toArray()
            .map(error => error?.message())
            .join('\n'),
        pass: false,
      };
    }

    return {
      message: () => 'OK',
      pass: true,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeExpectedYoutubeLiveStreamMedia(expected: RawMedia): R;
    }
  }
}
