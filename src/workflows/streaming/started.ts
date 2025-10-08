import { errAsync, okAsync, ResultAsync } from 'neverthrow';

import { notFound, type CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';
import { UUIDV4String } from 'aspects/uuid';

import { ImmutableDate } from 'domains/common/date';
import { type EventBroker } from 'domains/common/event';
import { type StreamStarted } from 'domains/streaming';
import {
  ViewerService,
  ServiceUpdated,
  type ViewerServiceRepository,
} from 'domains/viewer/service';

export const OnStreamStartedWorkflow =
  (logger: Logger) =>
  (serviceRepository: ViewerServiceRepository) =>
  (broker: EventBroker) =>
  (event: StreamStarted): ResultAsync<void, CommonError> => {
    logger.info(
      `[OnOnStreamStarted] Processing stream: ${event.snapshot.identifier.platform}/${event.snapshot.identifier.value}`
    );

    return serviceRepository
      .search()
      .andThen(services => {
        const service = services.find(
          service => service.identifier.platform === event.snapshot.identifier.platform
        );

        logger.warning(JSON.stringify(service));

        return service.ifPresentOrElse(
          service => {
            logger.info(
              `[OnStreamStarted] Found service: ${service.identifier.value}, updating URL`
            );
            return okAsync(service);
          },
          () => {
            logger.warning(
              `[OnStreamStarted] No service found for platform: ${event.snapshot.identifier.platform}`
            );
            return errAsync(
              notFound(`No service for platform: ${event.snapshot.identifier.platform}`)
            );
          }
        );
      })
      .andThen(service =>
        okAsync(
          ViewerService({
            ...service,
            url: event.snapshot.url.value,
          })
        )
      )
      .andThen(service => serviceRepository.persist(service).map(() => service))
      .andThen(service => {
        logger.info(`[OnStreamStarted] Service updated successfully: ${service.identifier.value}`);

        return broker
          .publish(
            ServiceUpdated({
              identifier: UUIDV4String(),
              occurredAt: ImmutableDate.now(),
              before: service.snapshot(),
            })
          )
          .asyncAndThen(() => okAsync(undefined));
      })
      .mapErr(error => {
        logger.error('[OnStreamStarted] Failed to process stream started event', error);
        return error;
      });
  };
