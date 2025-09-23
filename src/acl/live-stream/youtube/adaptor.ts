import { okAsync, ResultAsync } from 'neverthrow';

import { CommonError, RouteError, ValidationError } from 'aspects/error';
import { HttpClient, mapHttpClientError } from 'aspects/http';

import { PlatformType } from 'domains/common/platform';
import { ChannelIdentifier } from 'domains/monitoring';
import { LiveStream } from 'domains/streaming/common';

import { BaseReader, BaseTranslator, LiveStreamAdaptor } from '../common';
import { Media } from './media-types';

export const YoutubeAdaptor = (
  http: HttpClient,
  apiKey: string,
  reader: BaseReader<Media>,
  translator: BaseTranslator<Media, LiveStream, ValidationError | RouteError>
): LiveStreamAdaptor =>
  LiveStreamAdaptor(
    PlatformType.YOUTUBE,
    (channel: ChannelIdentifier): ResultAsync<LiveStream, CommonError> => {
      const query = {
        part: 'snippet',
        channelId: channel.value,
        eventType: 'live',
        type: 'video',
        key: apiKey,
      };

      return http
        .get('v3/search', { query })
        .mapErr(mapHttpClientError)
        .andThen(response => okAsync(response.bodyText))
        .andThen(payload => reader.read(payload))
        .andThen(media => translator.translate(media));
    }
  );
