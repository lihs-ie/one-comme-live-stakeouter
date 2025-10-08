import { Logger } from 'aspects/log';

import { type EventBroker } from 'domains/common/event';
import {
  type ChannelCheckScheduled,
  type ChannelRepository,
  type MonitoringTick,
} from 'domains/monitoring';
import { type LiveStreamRepository } from 'domains/streaming';

import { OnChannelCheckScheduledWorkflow } from './check-scheduled';
import { OnMonitoringTickWorkflow } from './scheduler';

export type MonitoringWorkflowDependencies = {
  channel: ChannelRepository;
  liveStream: LiveStreamRepository;
};

export const bootstrapMonitoringWorkflow = (
  broker: EventBroker,
  dependencies: MonitoringWorkflowDependencies,
  logger: Logger
): EventBroker => {
  logger.info('[MonitoringBootstrap] Registering monitoring workflows');

  const listened = broker
    .listen('MonitoringTick', (event: MonitoringTick) =>
      OnMonitoringTickWorkflow(logger)(broker)(dependencies.channel)(event)
    )
    .listen('ChannelCheckScheduled', (event: ChannelCheckScheduled) =>
      OnChannelCheckScheduledWorkflow(logger)(dependencies.liveStream)(broker)(event)
    );

  logger.info('[MonitoringBootstrap] Monitoring workflows registered successfully');

  return listened;
};
