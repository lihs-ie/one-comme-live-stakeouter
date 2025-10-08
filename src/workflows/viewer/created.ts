import { okAsync, ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';

import { ServiceCreated } from 'domains/viewer';

export const OnServiceCreatedWorkflow =
  (logger: Logger) =>
  (event: ServiceCreated): ResultAsync<void, CommonError> => {
    logger.info(`[ServiceCreated] incoming ${JSON.stringify(event)}`);

    return okAsync();
  };
