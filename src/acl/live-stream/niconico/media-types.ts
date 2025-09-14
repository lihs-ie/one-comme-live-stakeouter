import { err, ok, Result } from 'neverthrow';

import { toJSONError, ToJSONError } from 'aspects/error';

import { BaseReader, toJSON } from '../common';

type Meta = {
  status: number;
  errorCode: 'OK' | 'ERROR';
};

export type RawProgramMedia = {
  meta: Meta;
  data: {
    nicoliveProgramId: string;
  };
};

export type ProgramMedia = RawProgramMedia;

export type RawLiveStreamMedia = {
  meta: Meta;
  data: {
    title: string;
    description: string;
    isMemberOnly: boolean;
    vposBaseAt: number;
    beginAt: number;
    endAt: number;
    status: 'onAir' | 'end' | 'reserved';
    categories: string[];
    rooms: {
      viewUri: string;
    }[];
    isUserNiconicoAdsEnabled: boolean;
    socialGroup: {
      type: string;
      id: string;
      name: string;
      communityLevel: number;
      thumbnailUrl: string;
    };
    broadcaster: {
      name: string;
      id: string;
    };
    streamSetting: {
      maxQuality: string;
      orientation: string;
    };
    tags: {
      items: {
        text: string;
        locked: boolean;
        nicopediaArticleUrl?: string;
      }[];
      ownerLocked: boolean;
    };
  };
};

export type LiveStreamMedia = {
  meta: Meta;
  data: {
    title: string;
    description: string;
    isMemberOnly: boolean;
    vposBaseAt: Date;
    beginAt: Date;
    endAt: Date;
    status: 'onAir' | 'end' | 'reserved';
    categories: string[];
    rooms: {
      viewUri: string;
    }[];
    isUserNiconicoAdsEnabled: boolean;
    socialGroup: {
      type: string;
      id: string;
      name: string;
      communityLevel: number;
      thumbnailUrl: string;
    };
    broadcaster: {
      name: string;
      id: string;
    };
    streamSetting: {
      maxQuality: string;
      orientation: string;
    };
    tags: {
      items: {
        text: string;
        locked: boolean;
        nicopediaArticleUrl?: string;
      }[];
      ownerLocked: boolean;
    };
  };
};

export const ProgramReader: BaseReader<ProgramMedia> = {
  read: (payload: string): Result<ProgramMedia, ToJSONError> =>
    Result.fromThrowable(
      (): RawProgramMedia => JSON.parse(payload) as RawProgramMedia,
      () => toJSONError(payload)
    )().andThen(rawMedia => {
      if (!Object.hasOwn(rawMedia, 'meta') || rawMedia.meta.status !== 200) {
        return err(toJSONError(payload));
      }

      return ok(rawMedia);
    }),
};

export const LiveStreamReader: BaseReader<LiveStreamMedia> = {
  read: (payload: string): Result<LiveStreamMedia, ToJSONError> =>
    toJSON<RawLiveStreamMedia>(payload).andThen(rawMedia => {
      if (!Object.hasOwn(rawMedia, 'meta') || rawMedia.meta.status !== 200) {
        return err(toJSONError(payload));
      }

      return ok({
        meta: rawMedia.meta,
        data: {
          ...rawMedia.data,
          vposBaseAt: new Date(rawMedia.data.vposBaseAt),
          beginAt: new Date(rawMedia.data.beginAt),
          endAt: new Date(rawMedia.data.endAt),
        },
      });
    }),
};
