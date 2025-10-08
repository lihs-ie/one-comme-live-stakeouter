import { Logger } from 'aspects/log';
import { OnStreamEndedWorkflow } from 'workflows/streaming/ended';

export const OnStreamEndedWorkflowDependencies = OnStreamEndedWorkflow(Logger);
