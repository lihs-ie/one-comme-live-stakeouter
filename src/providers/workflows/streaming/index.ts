import { OnStreamEndedWorkflowDependencies } from './ended';
import { OnStreamNotFoundWorkflowDependencies } from './not-found';
import { OnStreamStartedWorkflowDependencies } from './started';

export const LiveStreamWorkflowDependencies = {
  onStreamStarted: OnStreamStartedWorkflowDependencies,
  onStreamEnded: OnStreamEndedWorkflowDependencies,
  OnStreamNotfound: OnStreamNotFoundWorkflowDependencies,
};
