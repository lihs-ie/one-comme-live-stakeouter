import { Logger } from 'aspects/log';

import { MonitoringStarted } from 'domains/monitoring';

export const OnMonitoringStartedWorkflow = (logger: Logger) => (event: MonitoringStarted) => {
  logger.info(`[MonitoringStarted] incoming ${JSON.stringify(event)}`);
};
