import { okAsync, ResultAsync } from 'neverthrow';

import { CommonError, validationError, ValidationError } from 'aspects/error';
import { HttpClient, mapHttpClientError } from 'aspects/http';

import { PlatformType } from 'domains/common/platform';
import { ChannelIdentifier } from 'domains/monitoring';
import { LiveStream, LiveStreamIdentifier } from 'domains/streaming/common';

import { BaseReader, BaseTranslator, LiveStreamAdaptor } from '../common';
import { LiveStreamMedia, ProgramMedia } from './media-types';

export const NicoNicoAdaptor = (
  http: HttpClient,
  userAgent: string,
  programReader: BaseReader<ProgramMedia>,
  liveStreamReader: BaseReader<LiveStreamMedia>,
  translator: BaseTranslator<
    [media: LiveStreamMedia, identifier: LiveStreamIdentifier],
    LiveStream,
    ValidationError
  >
): LiveStreamAdaptor => {
  return LiveStreamAdaptor(
    PlatformType.NICONICO,
    (channel: ChannelIdentifier): ResultAsync<LiveStream, CommonError> =>
      http
        .get(`tool/v1/broadcasters/user/${channel.value}/program`, { headers: { userAgent } })
        .andThen(response => okAsync(response.bodyText))
        .andThen(payload => programReader.read(payload))
        .andThen(program =>
          ResultAsync.fromThrowable<[ProgramMedia], LiveStreamIdentifier, ValidationError>(
            (program: ProgramMedia) =>
              Promise.resolve(
                LiveStreamIdentifier({
                  value: program.data.nicoliveProgramId,
                  platform: PlatformType.NICONICO,
                })
              ),
            error => validationError((error as Error).message)
          )(program)
        )
        .andThen(identifier =>
          ResultAsync.combine([
            okAsync(identifier),
            http.get(`watch/${identifier.value}/programinfo`, { headers: { userAgent } }),
          ])
        )
        .andThen(([identifier, response]) =>
          liveStreamReader.read(response.bodyText).map(media => [identifier, media] as const)
        )
        .mapErr(error => {
          if (error.type !== 'to-json-error' && error.type !== 'validation-error') {
            return mapHttpClientError(error);
          }

          return error;
        })
        .andThen(([identifier, media]) => translator.translate([media, identifier]))
  );
};
