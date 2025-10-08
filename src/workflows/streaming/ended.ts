import { okAsync, ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';

import { StreamEnded } from 'domains/streaming';

export const OnStreamEndedWorkflow =
  (logger: Logger) =>
  (event: StreamEnded): ResultAsync<void, CommonError> => {
    logger.info(`[StreamEnded] incoming ${JSON.stringify(event)}`);

    return okAsync();
  };
