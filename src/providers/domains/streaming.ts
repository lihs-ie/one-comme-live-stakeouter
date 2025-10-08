import { OnStreamEndedWorkflowDependencies } from 'providers/workflows/streaming/ended';
import { OnStreamNotFoundWorkflowDependencies } from 'providers/workflows/streaming/not-found';
import { OnStreamStartedWorkflowDependencies } from 'providers/workflows/streaming/started';

import { EventBroker } from 'domains/common/event';
import { LiveStreamSubscriber } from 'domains/streaming';

export const LiveStreamSubscriberDependencies = (broker: EventBroker) =>
  LiveStreamSubscriber({
    onStreamStarted: OnStreamStartedWorkflowDependencies(broker),
    onStreamEnded: OnStreamEndedWorkflowDependencies,
    onStreamNotFound: OnStreamNotFoundWorkflowDependencies,
  });
