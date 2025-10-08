import { ViewerServiceWorkflowDependencies } from 'providers/workflows/viewer';

import { ViewerServiceSubscriber } from 'domains/viewer';

export const ViewerServiceSubscriberDependencies = ViewerServiceSubscriber({
  onServiceCreated: ViewerServiceWorkflowDependencies.onServiceCreated,
  onServiceUpdated: ViewerServiceWorkflowDependencies.onServiceUpdated,
});
