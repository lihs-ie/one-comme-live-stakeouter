import { okAsync, ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';

import { StreamNotFound } from 'domains/streaming';

export const OnStreamNotfoundWorkflow =
  (logger: Logger) =>
  (event: StreamNotFound): ResultAsync<void, CommonError> => {
    logger.info(`[StreamNotFound] incoming ${JSON.stringify(event)}`);

    return okAsync();
  };
