import { err, Result } from 'neverthrow';
import { ZodError } from 'zod';

import { RouteError, ValidationError, validationError } from 'aspects/error';

import { ImmutableDate } from 'domains/common/date';
import { PlatformType } from 'domains/common/platform';
import { URL } from 'domains/common/uri';
import { ChannelIdentifier } from 'domains/monitoring';
import { LiveStream, LiveStreamIdentifier, LiveStreamURL, Status } from 'domains/streaming/common';

import { BaseTranslator } from '../common';
import { Media } from './media-types';

export const Translator = (
  baseURL: string
): BaseTranslator<Media, LiveStream, ValidationError | RouteError> => ({
  translate: (media: Media): Result<LiveStream, ValidationError | RouteError> => {
    return media.items
      .find(item => item.snippet.liveBroadcastContent === 'live')
      .ifPresentOrElse(
        entry =>
          Result.fromThrowable(
            () =>
              LiveStream({
                identifier: LiveStreamIdentifier({
                  value: entry.id.videoId,
                  platform: PlatformType.YOUTUBE,
                }),
                title: entry.snippet.title,
                url: LiveStreamURL({
                  value: URL({ value: `${baseURL}${entry.id.videoId}` }),
                  channel: ChannelIdentifier({
                    value: entry.snippet.channelId,
                    platform: PlatformType.YOUTUBE,
                  }),
                }),
                startedAt: ImmutableDate.create(entry.snippet.publishedAt),
                finishedAt: null,
                status: Status.LIVE,
              }),
            error => validationError((error as ZodError).message)
          )(),
        () => err({ type: 'not-found', context: JSON.stringify(media) })
      );
  },
});
