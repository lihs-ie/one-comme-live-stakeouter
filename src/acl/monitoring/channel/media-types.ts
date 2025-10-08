import { Result } from 'neverthrow';

import { toJSONError } from 'aspects/error';

import { ImmutableList } from 'domains/common/collections';
import { ImmutableDate } from 'domains/common/date';
import { PlatformType, platformTypeSchema } from 'domains/common/platform';
import { Channel } from 'domains/monitoring';

import { BaseMedia, BaseReader, BaseWriter } from '../common';

export type RawEntryMedia = BaseMedia<{
  identifier: {
    value: string;
    platform: string;
  };
  setting: {
    isMonitoring: boolean;
    checkInterval: number | null;
  };
  lastCheckedAt: string | null;
  timestamp: {
    createdAt: string;
    updatedAt: string;
  };
}>;

export type RawEntriesMedia = BaseMedia<{
  channels: RawEntryMedia['response'][];
}>;

export type EntryMedia = BaseMedia<{
  identifier: {
    value: string;
    platform: PlatformType;
  };
  setting: {
    isMonitoring: boolean;
    checkInterval: number | null;
  };
  lastCheckedAt: ImmutableDate | null;
  timestamp: {
    createdAt: ImmutableDate;
    updatedAt: ImmutableDate;
  };
}>;

export type EntriesMedia = BaseMedia<{
  channels: ImmutableList<EntryMedia['response']>;
}>;

export const Reader: BaseReader<EntryMedia, EntriesMedia> = {
  read: (payload: string) =>
    Result.fromThrowable(
      (): EntryMedia => {
        const parsed: RawEntryMedia = JSON.parse(payload) as RawEntryMedia;

        return {
          code: parsed.code,
          response: {
            identifier: {
              value: parsed.response.identifier.value,
              platform: platformTypeSchema.parse(parsed.response.identifier.platform),
            },
            setting: {
              isMonitoring: parsed.response.setting.isMonitoring,
              checkInterval: parsed.response.setting.checkInterval,
            },
            lastCheckedAt:
              parsed.response.lastCheckedAt !== null
                ? ImmutableDate.create(parsed.response.lastCheckedAt)
                : null,
            timestamp: {
              createdAt: ImmutableDate.create(parsed.response.timestamp.createdAt),
              updatedAt: ImmutableDate.create(parsed.response.timestamp.updatedAt),
            },
          },
        };
      },
      () => toJSONError(payload)
    )(),
  readEntries: (payload: string) =>
    Result.fromThrowable(
      (): EntriesMedia => {
        const parsed: RawEntriesMedia = JSON.parse(payload) as RawEntriesMedia;

        return {
          code: parsed.code,
          response: {
            channels: ImmutableList(parsed.response.channels).map(channel => ({
              identifier: {
                value: channel.identifier.value,
                platform: platformTypeSchema.parse(channel.identifier.platform),
              },
              setting: {
                isMonitoring: channel.setting.isMonitoring,
                checkInterval: channel.setting.checkInterval,
              },
              lastCheckedAt:
                channel.lastCheckedAt !== null ? ImmutableDate.create(channel.lastCheckedAt) : null,
              timestamp: {
                createdAt: ImmutableDate.create(channel.timestamp.createdAt),
                updatedAt: ImmutableDate.create(channel.timestamp.updatedAt),
              },
            })),
          },
        };
      },
      () => toJSONError(payload)
    )(),
};

export const Writer: BaseWriter<Channel> = {
  write: (input: Channel): string => {
    const body = {
      identifier: {
        value: input.identifier.value,
        platform: input.identifier.platform,
      },
      setting: {
        isMonitoring: input.setting.isMonitoring,
        checkInterval: input.setting.checkInterval,
      },
      lastCheckedAt: input.lastCheckedAt ? input.lastCheckedAt.toISOString() : null,
      timestamp: {
        createdAt: input.timestamp.createdAt.toISOString(),
        updatedAt: input.timestamp.updatedAt.toISOString(),
      },
    };

    return JSON.stringify(body);
  },
};
