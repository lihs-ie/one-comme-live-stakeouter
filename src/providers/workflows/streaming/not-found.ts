import { Logger } from 'aspects/log';
import { OnStreamNotfoundWorkflow } from 'workflows/streaming/not-found';

export const OnStreamNotFoundWorkflowDependencies = OnStreamNotfoundWorkflow(Logger);
