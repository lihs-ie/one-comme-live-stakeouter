import { ResultAsync } from 'neverthrow';

import { CommonError, NotFoundError, other, ValidationError } from 'aspects/error';

import { PlatformType } from 'domains/common/platform';
import { ChannelIdentifier } from 'domains/monitoring';
import { LiveStream } from 'domains/streaming/common';

import { BaseReader, BaseTranslator, LiveStreamAdaptor } from '../common';
import { Media } from './media-types';
import { handleErrorResponse } from '../common/response';

export const YoutubeAdaptor = (
  endpoint: string,
  apiKey: string,
  reader: BaseReader<Media>,
  translator: BaseTranslator<Media, LiveStream, ValidationError | NotFoundError>
): LiveStreamAdaptor =>
  LiveStreamAdaptor(
    PlatformType.YOUTUBE,
    (channel: ChannelIdentifier): ResultAsync<LiveStream, CommonError> => {
      const createRequest = () => {
        const query = new URLSearchParams();

        query.set('part', 'snippet');

        query.set('channelId', channel.value);

        query.set('eventType', 'live');

        query.set('type', 'video');

        query.set('key', apiKey);

        return `${endpoint}/v3/search?${query.toString()}`;
      };

      return ResultAsync.fromPromise(fetch(createRequest()), error =>
        other((error as Error).message)
      )
        .andThen(response => {
          if (!response.ok) {
            return handleErrorResponse<string>(response);
          }

          return ResultAsync.fromSafePromise(response.text());
        })
        .andThen(payload => reader.read(payload))
        .andThen(media => translator.translate(media));
    }
  );
