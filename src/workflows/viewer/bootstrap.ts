import { Logger } from 'aspects/log';
import { workflow } from 'config';

import { EventBroker } from 'domains/common/event';
import { ViewerServiceRepository } from 'domains/viewer';

import { OnChannelCreatedWorkflow, OnChannelTerminatedWorkflow } from './manage';

export const bootstrapViewerServiceWorkflow = (
  broker: EventBroker,
  logger: Logger,
  repository: ViewerServiceRepository
) => {
  logger.info('[ViewerBootstrap] Registering viewer workflows');

  const listened = broker
    .listen('ChannelCreated', OnChannelCreatedWorkflow(logger)(workflow.viewerService)(repository))
    .listen('ChannelTerminated', OnChannelTerminatedWorkflow(logger)(repository));

  logger.info('[ViewerBootstrap] Viewer workflows registered successfully');

  return listened;
};
