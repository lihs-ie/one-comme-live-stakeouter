import { Logger } from 'aspects/log';
import { InfrastructureProvider } from 'providers/infrastructures';
import { OnStreamStartedWorkflow } from 'workflows/streaming/started';

export const OnStreamStartedWorkflowDependencies = OnStreamStartedWorkflow(Logger)(
  InfrastructureProvider.service
);
