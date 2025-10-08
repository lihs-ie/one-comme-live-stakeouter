import { okAsync, ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';
import { UUIDV4String } from 'aspects/uuid';

import { ImmutableDate } from 'domains/common/date';
import { type EventBroker } from 'domains/common/event';
import {
  ChannelCheckScheduled,
  ChannelRepository,
  MonitoringFailed,
  MonitoringTick,
} from 'domains/monitoring';

export type StopScheduler = () => void;

type Timer = {
  set: typeof setInterval;
  clear: typeof clearInterval;
};

export type StartMonitoringSchedulerCommand = {
  tickMilliseconds: number;
};

export const StartMonitoringScheduler =
  (broker: EventBroker) =>
  (timer: Timer) =>
  (logger: Logger) =>
  (command: StartMonitoringSchedulerCommand): ResultAsync<StopScheduler, CommonError> => {
    const tick = () => {
      broker
        .publish(MonitoringTick({ identifier: UUIDV4String(), occurredAt: ImmutableDate.now() }))
        .match(
          () => {
            logger.info('[StartMonitoringScheduler] tick event published.');
          },
          error => {
            logger.error('[StartMonitoringScheduler] failed to publish tick event.', error);
          }
        );
    };

    const identifier = timer.set(tick, command.tickMilliseconds);

    const stop: StopScheduler = () => {
      timer.clear(identifier);
    };

    return okAsync(stop);
  };

export const OnMonitoringTickWorkflow =
  (logger: Logger) =>
  (broker: EventBroker) =>
  (channelRepository: ChannelRepository) =>
  (event: MonitoringTick): ResultAsync<void, CommonError> => {
    logger.info(`[TickHandler] Processing tick event: ${event.identifier}`);

    return channelRepository
      .monitoring()
      .andThen(channels => {
        logger.info(`[TickHandler] Found ${channels.size()} channels to monitor`);

        const events = channels.map(channel =>
          ChannelCheckScheduled({
            identifier: UUIDV4String(),
            occurredAt: ImmutableDate.now(),
            channel: channel.identifier,
          })
        );

        return broker.publishAll(events).asyncAndThen(() => okAsync());
      })
      .mapErr(error => {
        logger.error('[TickHandler] Failed to retrieve monitoring channels', error);

        broker.publish(
          MonitoringFailed({
            identifier: UUIDV4String(),
            occurredAt: ImmutableDate.now(),
            message: error.context ?? 'Failed to retrieve monitoring channels.',
            channel: null,
          })
        );

        return error;
      });
  };
