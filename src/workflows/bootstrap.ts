import { ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';

import { EventBroker, type QueueingDriver } from 'domains/common/event';
import { type ChannelRepository } from 'domains/monitoring';
import { type LiveStreamRepository } from 'domains/streaming';
import { type ViewerServiceRepository } from 'domains/viewer/service';

import { startEventWorker, type StopWorker } from './event-worker';
import { bootstrapMonitoringWorkflow } from './monitoring/bootstrap';
import { StartMonitoringScheduler, type StopScheduler } from './monitoring/scheduler';
import { bootstrapStreamingWorkflow } from './streaming/bootstrap';
import { bootstrapViewerServiceWorkflow } from './viewer/bootstrap';

export type StopPlugin = () => void;

export type PluginConfig = {
  monitoring: {
    defaultTickInterval: number;
  };
  eventWorker: {
    intervalMs: number;
  };
};

export type PluginRepositories = {
  channel: ChannelRepository;
  liveStream: LiveStreamRepository;
  service: ViewerServiceRepository;
};

const brokerBootstrap =
  (...bootstraps: ((broker: EventBroker) => EventBroker)[]) =>
  (broker: EventBroker) =>
    bootstraps.reduce((carry, current) => current(carry), broker);

export const bootstrapPlugin = (
  queueDriver: QueueingDriver,
  repositories: PluginRepositories,
  config: PluginConfig,
  logger: Logger
): ResultAsync<StopPlugin, CommonError> => {
  logger.info('[Bootstrap] Starting plugin bootstrap');
  logger.info('[Bootstrap] EventBroker initialized');

  const listenedBroker = brokerBootstrap(
    broker =>
      bootstrapMonitoringWorkflow(
        broker,
        {
          channel: repositories.channel,
          liveStream: repositories.liveStream,
        },
        logger
      ),
    broker =>
      bootstrapStreamingWorkflow(
        broker,
        {
          service: repositories.service,
        },
        logger
      ),
    broker => bootstrapViewerServiceWorkflow(broker, logger, repositories.service)
  )(EventBroker(queueDriver));

  const stopWorker: StopWorker = startEventWorker(
    listenedBroker,
    logger,
    config.eventWorker.intervalMs
  );
  logger.info('[Bootstrap] Event worker started');

  return StartMonitoringScheduler(listenedBroker)({
    set: setInterval,
    clear: clearInterval,
  })(logger)({
    tickMilliseconds: config.monitoring.defaultTickInterval,
  }).map((stopScheduler: StopScheduler) => {
    logger.info('[Bootstrap] Monitoring scheduler started');
    logger.info('[Bootstrap] Plugin bootstrap completed successfully');

    return (): void => {
      logger.info('[Bootstrap] Stopping plugin');
      stopScheduler();
      stopWorker();
      logger.info('[Bootstrap] Plugin stopped successfully');
    };
  });
};
