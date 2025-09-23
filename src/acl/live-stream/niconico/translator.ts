import { Result } from 'neverthrow';
import { ZodError } from 'zod';

import { validationError, ValidationError } from 'aspects/error';

import { ImmutableDate } from 'domains/common/date';
import { PlatformType } from 'domains/common/platform';
import { URL } from 'domains/common/uri';
import { ChannelIdentifier } from 'domains/monitoring';
import { LiveStream, LiveStreamIdentifier, LiveStreamURL, Status } from 'domains/streaming/common';

import { LiveStreamMedia } from './media-types';
import { BaseTranslator } from '../common';

export const Translator = (
  baseURL: string
): BaseTranslator<
  [media: LiveStreamMedia, identifier: LiveStreamIdentifier],
  LiveStream,
  ValidationError
> => ({
  translate: (
    args: [LiveStreamMedia, LiveStreamIdentifier]
  ): Result<LiveStream, ValidationError> => {
    const [media, identifier] = args;

    const convertStatus = (status: LiveStreamMedia['data']['status']): Status => {
      switch (status) {
        case 'onAir':
          return Status.LIVE;
        case 'end':
          return Status.ENDED;
        case 'reserved':
          return Status.UPCOMING;
      }
    };

    return Result.fromThrowable(
      () =>
        LiveStream({
          identifier,
          title: media.data.title,
          url: LiveStreamURL({
            value: URL({ value: `${baseURL}${identifier.value}` }),
            channel: ChannelIdentifier({
              value: media.data.broadcaster.id,
              platform: PlatformType.NICONICO,
            }),
          }),
          startedAt: ImmutableDate.create(media.data.beginAt),
          finishedAt: ImmutableDate.create(media.data.endAt),
          status: convertStatus(media.data.status),
        }),
      error => validationError((error as ZodError).message)
    )();
  },
});
