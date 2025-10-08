import { Logger } from 'aspects/log';
import { OnServiceCreatedWorkflow } from 'workflows/viewer/created';

export const OnServiceCreatedWorkflowDependencies = OnServiceCreatedWorkflow(Logger);
