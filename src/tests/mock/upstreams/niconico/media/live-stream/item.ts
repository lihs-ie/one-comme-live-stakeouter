import hash from 'hash-it';

import {
  RawLiveStreamMedia,
  LiveStreamMedia as LiveStreamCustomMedia,
} from 'acl/live-stream/niconico';

import { LiveStream, liveStreamSchema, Status } from 'domains/streaming';

import { Builder, StringFactory } from 'tests/factories';
import { URLFactory } from 'tests/factories/domains/common/uri';

import { MediaFactory } from '../../../common';

export class LiveStreamMedia extends MediaFactory<Partial<RawLiveStreamMedia>, LiveStream> {
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

  protected fillByModel(overrides: LiveStream): RawLiveStreamMedia {
    const seed = hash(overrides);

    const status = ((): RawLiveStreamMedia['data']['status'] => {
      switch (overrides.status) {
        case Status.ENDED:
          return 'end';
        case Status.LIVE:
          return 'onAir';
        case Status.UPCOMING:
          return 'reserved';
      }
    })();

    return {
      meta: {
        status: 200,
        errorCode: 'OK',
      },
      data: {
        title: overrides.title,
        description: Builder(StringFactory(1, 255)).buildWith(seed),
        isMemberOnly: seed % 2 === 0,
        vposBaseAt: new Date(seed % 10000000).getTime(),
        beginAt: overrides.startedAt.timestamp,
        endAt: overrides.finishedAt?.timestamp ?? overrides.startedAt.timestamp + 3600000,
        status,
        categories: [],
        rooms: [],
        isUserNiconicoAdsEnabled: seed % 2 === 0,
        socialGroup: {
          type: Builder(StringFactory(1, 255)).buildWith(seed),
          id: String(seed % 10000000),
          name: Builder(StringFactory(1, 255)).buildWith(seed),
          communityLevel: (seed % 250) + 1,
          thumbnailUrl: Builder(URLFactory).buildWith(seed).value,
        },
        broadcaster: {
          name: Builder(StringFactory(1, 255)).buildWith(seed),
          id: overrides.url.channel.value,
        },
        streamSetting: {
          maxQuality: Builder(StringFactory(1, 255)).buildWith(seed),
          orientation: Builder(StringFactory(1, 255)).buildWith(seed),
        },
        tags: {
          items: [],
          ownerLocked: seed % 2 === 0,
        },
      },
    };
  }

  protected fill(overrides?: Partial<RawLiveStreamMedia> | LiveStream): RawLiveStreamMedia {
    if (this.isModel(liveStreamSchema, overrides)) {
      return this.fillByModel(overrides);
    }

    const seed = hash(overrides);

    return {
      meta: {
        status: 200,
        errorCode: 'OK',
      },
      data: {
        title: Builder(StringFactory(1, 128)).buildWith(seed),
        description: Builder(StringFactory(1, 255)).buildWith(seed),
        isMemberOnly: seed % 2 === 0,
        vposBaseAt: new Date(seed % 10000000).getTime(),
        beginAt: new Date(seed % 1000000000).getTime(),
        endAt: new Date(seed % 1000000000).getTime() + 3600000,
        status: ['onAir', 'reserved', 'end'][seed % 3] as RawLiveStreamMedia['data']['status'],
        categories: [],
        rooms: [],
        isUserNiconicoAdsEnabled: seed % 2 === 0,
        socialGroup: {
          type: Builder(StringFactory(1, 255)).buildWith(seed),
          id: String(seed % 10000000),
          name: Builder(StringFactory(1, 255)).buildWith(seed),
          communityLevel: (seed % 250) + 1,
          thumbnailUrl: Builder(URLFactory).buildWith(seed).value,
        },
        broadcaster: {
          name: Builder(StringFactory(1, 255)).buildWith(seed),
          id: String(seed % 10000000),
        },
        streamSetting: {
          maxQuality: Builder(StringFactory(1, 255)).buildWith(seed),
          orientation: Builder(StringFactory(1, 255)).buildWith(seed),
        },
        tags: {
          items: [],
          ownerLocked: seed % 2 === 0,
        },
      },
      ...overrides,
    };
  }
}

expect.extend({
  toBeExpectedNicoNicoLiveStreamMedia(actual: RawLiveStreamMedia, expected: LiveStreamCustomMedia) {
    expect(actual.meta.status).toBe(expected.meta.status);
    expect(actual.meta.errorCode).toBe(expected.meta.errorCode);
    expect(actual.data.title).toBe(expected.data.title);
    expect(actual.data.description).toBe(expected.data.description);
    expect(actual.data.isMemberOnly).toBe(expected.data.isMemberOnly);
    expect(actual.data.vposBaseAt).toBe(expected.data.vposBaseAt.getTime());
    expect(actual.data.beginAt).toBe(expected.data.beginAt.getTime());
    expect(actual.data.endAt).toBe(expected.data.endAt.getTime());
    expect(actual.data.status).toBe(expected.data.status);
    expect(actual.data.categories).toEqual(expected.data.categories);
    expect(actual.data.rooms).toEqual(expected.data.rooms);
    expect(actual.data.isUserNiconicoAdsEnabled).toBe(expected.data.isUserNiconicoAdsEnabled);
    expect(actual.data.socialGroup).toStrictEqual(expected.data.socialGroup);
    expect(actual.data.broadcaster).toStrictEqual(expected.data.broadcaster);
    expect(actual.data.streamSetting).toStrictEqual(expected.data.streamSetting);
    expect(actual.data.tags).toStrictEqual(expected.data.tags);

    return {
      message: () => 'OK',
      pass: true,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeExpectedNicoNicoLiveStreamMedia(expected: RawLiveStreamMedia): R;
    }
  }
}
