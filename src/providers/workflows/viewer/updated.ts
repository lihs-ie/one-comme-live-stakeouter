import { Logger } from 'aspects/log';
import { OnServiceUpdatedWorkflow } from 'workflows/viewer/updated';

export const OnServiceUpdatedWorkflowDependencies = OnServiceUpdatedWorkflow(Logger);
