import { ok, Result } from 'neverthrow';

import { ToJSONError, toJSONError } from 'aspects/error';

import { ImmutableList } from 'domains/common/collections';

import { BaseReader } from '../common';

export type RawEntryMedia = {
  kind: 'youtube#searchResult';
  etag: string;
  id: {
    kind: 'youtube#video';
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
      medium: {
        url: string;
        width: number;
        height: number;
      };
      high: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    liveBroadcastContent: 'none' | 'live' | 'upcoming';
    publishTime: string;
  };
};

export type RawMedia = {
  kind: 'youtube#searchResult';
  etag: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: RawEntryMedia[];
};

export type EntryMedia = {
  kind: 'youtube#searchResult';
  etag: string;
  id: {
    kind: 'youtube#video';
    videoId: string;
  };
  snippet: {
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
      medium: {
        url: string;
        width: number;
        height: number;
      };
      high: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    liveBroadcastContent: 'none' | 'live' | 'upcoming';
    publishTime: Date;
  };
};

export type Media = {
  kind: 'youtube#searchResult';
  etag: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: ImmutableList<EntryMedia>;
};

export const Reader: BaseReader<Media> = {
  read: (payload: string): Result<Media, ToJSONError> => {
    return Result.fromThrowable(
      (): RawMedia => JSON.parse(payload) as RawMedia,
      () => toJSONError(payload)
    )().andThen(rawMedia =>
      ok({
        ...rawMedia,
        items: ImmutableList.fromArray(rawMedia.items).map(item => ({
          ...item,
          snippet: {
            ...item.snippet,
            publishedAt: new Date(item.snippet.publishedAt),
            publishTime: new Date(item.snippet.publishTime),
          },
        })),
      })
    );
  },
};
