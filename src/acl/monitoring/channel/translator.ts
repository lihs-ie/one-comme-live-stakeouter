import { Result } from 'neverthrow';

import { validationError } from 'aspects/error';

import { ImmutableList } from 'domains/common/collections';
import { Timestamp } from 'domains/common/date';
import { Channel, ChannelIdentifier, MonitoringSetting } from 'domains/monitoring';

import { BaseTranslator } from '../common';
import { EntriesMedia, EntryMedia } from './media-types';

export const Translator: BaseTranslator<EntryMedia, Channel, EntriesMedia> = {
  translate: (media: EntryMedia) =>
    Result.fromThrowable(
      (): Channel =>
        Channel({
          identifier: ChannelIdentifier({
            value: media.response.identifier.value,
            platform: media.response.identifier.platform,
          }),
          setting: MonitoringSetting({
            isMonitoring: media.response.setting.isMonitoring,
            checkInterval: media.response.setting.checkInterval,
          }),
          lastCheckedAt: media.response.lastCheckedAt,
          timestamp: Timestamp({
            createdAt: media.response.timestamp.createdAt,
            updatedAt: media.response.timestamp.updatedAt,
          }),
        }),
      error => validationError((error as Error).message)
    )(),
  translateEntries: (media: EntriesMedia) =>
    Result.fromThrowable(
      (): ImmutableList<Channel> =>
        media.response.channels.map(entry =>
          Channel({
            identifier: ChannelIdentifier({
              value: entry.identifier.value,
              platform: entry.identifier.platform,
            }),
            setting: MonitoringSetting({
              isMonitoring: entry.setting.isMonitoring,
              checkInterval: entry.setting.checkInterval,
            }),
            lastCheckedAt: entry.lastCheckedAt,
            timestamp: Timestamp({
              createdAt: entry.timestamp.createdAt,
              updatedAt: entry.timestamp.updatedAt,
            }),
          })
        ),
      error => validationError((error as Error).message)
    )(),
};
