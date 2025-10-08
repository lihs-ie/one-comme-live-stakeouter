import { okAsync, ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';

import { ServiceUpdated } from 'domains/viewer';

export const OnServiceUpdatedWorkflow =
  (logger: Logger) =>
  (event: ServiceUpdated): ResultAsync<void, CommonError> => {
    logger.info(`[ServiceUpdated] incoming ${JSON.stringify(event)}`);

    return okAsync();
  };
