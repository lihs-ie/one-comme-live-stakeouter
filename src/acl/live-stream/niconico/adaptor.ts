import { ResultAsync } from 'neverthrow';

import { CommonError, other, validationError, ValidationError } from 'aspects/error';

import { PlatformType } from 'domains/common/platform';
import { ChannelIdentifier } from 'domains/monitoring';
import { LiveStream, LiveStreamIdentifier } from 'domains/streaming/common';

import { BaseReader, BaseTranslator, LiveStreamAdaptor } from '../common';
import { LiveStreamMedia, ProgramMedia } from './media-types';
import { handleErrorResponse } from '../common/response';

export const NicoNicoAdaptor = (
  baseURI: string,
  userAgent: string,
  programReader: BaseReader<ProgramMedia>,
  liveStreamReader: BaseReader<LiveStreamMedia>,
  translator: BaseTranslator<
    [media: LiveStreamMedia, identifier: LiveStreamIdentifier],
    LiveStream,
    ValidationError
  >
): LiveStreamAdaptor => {
  const createRequest = (endpoint: string, init: RequestInit): [RequestInfo, RequestInit] => {
    return [`${baseURI}${endpoint}`, init];
  };

  return LiveStreamAdaptor(
    PlatformType.NICONICO,
    (channel: ChannelIdentifier): ResultAsync<LiveStream, CommonError> =>
      ResultAsync.fromPromise(
        fetch(
          ...createRequest(`tool/v1/broadcasters/user/${channel.value}/program`, {
            headers: { userAgent },
          })
        ),
        error => other((error as Error).message)
      )
        .andThen(response => {
          if (!response.ok) {
            return handleErrorResponse<string>(response);
          }

          return ResultAsync.fromSafePromise(response.text());
        })
        .andThen(payload => programReader.read(payload))
        .andThen(program =>
          ResultAsync.fromThrowable<[ProgramMedia], LiveStreamIdentifier, ValidationError>(
            (program: ProgramMedia) =>
              Promise.resolve(LiveStreamIdentifier({ value: program.data.nicoliveProgramId })),
            error => validationError((error as Error).message)
          )(program)
        )
        .andThen(identifier =>
          ResultAsync.fromPromise(
            fetch(
              ...createRequest(`watch/${identifier.value}/programinfo`, {
                headers: { userAgent },
              })
            ),
            error => other((error as Error).message)
          ).map(response => [identifier, response] as const)
        )
        .andThen(([identifier, response]) => {
          if (!response.ok) {
            return handleErrorResponse<[LiveStreamIdentifier, string]>(response);
          }

          return ResultAsync.fromPromise(response.text(), error =>
            other((error as Error).message)
          ).map(text => [identifier, text] as const);
        })
        .andThen(([identifier, payload]) =>
          liveStreamReader.read(payload).map(media => [identifier, media] as const)
        )
        .andThen(([identifier, media]) => translator.translate([media, identifier]))
  );
};
