import { errAsync, ResultAsync } from 'neverthrow';

import { CommonError, notFound } from 'aspects/error';
import { Logger } from 'aspects/log';
import { UUIDV4String } from 'aspects/uuid';

import { PlatformType } from 'domains/common/platform';
import { URL } from 'domains/common/uri';
import { ChannelCreated, ChannelTerminated } from 'domains/monitoring';
import {
  RGB,
  ServiceIdentifier,
  ServiceOptions,
  ViewerService,
  ViewerServiceRepository,
} from 'domains/viewer';

export type ServiceConfiguration = {
  defaultURL: string;
  color: {
    red: number;
    green: number;
    blue: number;
  };
};

export type PlatformServiceConfigurations = Record<PlatformType, ServiceConfiguration>;

export const OnChannelCreatedWorkflow =
  (logger: Logger) =>
  (configurations: PlatformServiceConfigurations) =>
  (serviceRepository: ViewerServiceRepository) =>
  (event: ChannelCreated): ResultAsync<void, CommonError> => {
    logger.info(`[OnChannelCreatedWorkflow] incoming ${JSON.stringify(event)}`);

    return serviceRepository
      .persist(
        ViewerService({
          identifier: ServiceIdentifier({
            value: UUIDV4String(),
            platform: event.channel.platform,
          }),
          name: `{${event.channel.platform}} Service for ${event.channel.value}`,
          enabled: false,
          url: URL({ value: configurations[event.channel.platform].defaultURL }),
          color: RGB({
            red: configurations[event.channel.platform].color.red,
            green: configurations[event.channel.platform].color.green,
            blue: configurations[event.channel.platform].color.blue,
          }),
          write: false,
          speech: false,
          options: ServiceOptions({ outputLog: false }),
        })
      )
      .map(() => {
        logger.info(
          `[OnChannelCreatedWorkflow] Service created for channel ${event.channel.platform}/${event.channel.value}`
        );
      });
  };

export const OnChannelTerminatedWorkflow =
  (logger: Logger) =>
  (serviceRepository: ViewerServiceRepository) =>
  (event: ChannelTerminated): ResultAsync<void, CommonError> => {
    logger.info(`[OnChannelTerminatedWorkflow] incoming ${JSON.stringify(event)}`);

    return serviceRepository.search().andThen(services =>
      services
        .find(service => service.identifier.platform === event.channel.platform)
        .ifPresentOrElse(
          service => serviceRepository.terminate(service.identifier),
          () =>
            errAsync(
              notFound(
                `[OnChannelTerminatedWorkflow] Service not found for channel ${event.channel.platform}`
              )
            )
        )
        .map(() => {
          logger.info(
            `[OnChannelTerminatedWorkflow] Service terminated for channel ${event.channel.platform}`
          );
        })
    );
  };
