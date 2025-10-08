import { Logger } from 'aspects/log';

import { type EventBroker } from 'domains/common/event';
import { type StreamEnded, type StreamNotFound, type StreamStarted } from 'domains/streaming';
import { type ViewerServiceRepository } from 'domains/viewer/service';

import { OnStreamEndedWorkflow } from './ended';
import { OnStreamNotfoundWorkflow } from './not-found';
import { OnStreamStartedWorkflow } from './started';

/**
 * Streaming ワークフローの依存関係
 */
export type StreamingWorkflowDependencies = {
  service: ViewerServiceRepository;
};

/**
 * Streaming ワークフローをEventBrokerに登録する
 *
 * @param broker - イベントブローカー
 * @param dependencies - 依存関係
 * @param logger - ロガー
 * @returns Subscriberが登録されたEventBroker
 */
export const bootstrapStreamingWorkflow = (
  broker: EventBroker,
  dependencies: StreamingWorkflowDependencies,
  logger: Logger
): EventBroker => {
  logger.info('[StreamingBootstrap] Registering streaming workflows');

  // StreamStarted イベントのリスナーを登録
  const withStartedListener = broker.listen('StreamStarted', (event: StreamStarted) =>
    OnStreamStartedWorkflow(logger)(dependencies.service)(broker)(event)
  );

  // StreamEnded イベントのリスナーを登録
  const withEndedListener = withStartedListener.listen('StreamEnded', (event: StreamEnded) =>
    OnStreamEndedWorkflow(logger)(event)
  );

  // StreamNotFound イベントのリスナーを登録
  const fullyRegistered = withEndedListener.listen('StreamNotFound', (event: StreamNotFound) =>
    OnStreamNotfoundWorkflow(logger)(event)
  );

  logger.info('[StreamingBootstrap] Streaming workflows registered successfully');

  return fullyRegistered;
};
