import { okAsync, ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { Logger } from 'aspects/log';
import { UUIDV4String } from 'aspects/uuid';

import { ImmutableDate } from 'domains/common/date';
import { type EventBroker } from 'domains/common/event';
import { type ChannelCheckScheduled, MonitoringFailed } from 'domains/monitoring';
import {
  type LiveStreamRepository,
  Status,
  StreamStarted,
  StreamEnded,
  StreamNotFound,
} from 'domains/streaming';

export const OnChannelCheckScheduledWorkflow =
  (logger: Logger) =>
  (liveStreamRepository: LiveStreamRepository) =>
  (broker: EventBroker) =>
  (event: ChannelCheckScheduled): ResultAsync<void, CommonError> => {
    logger.info(
      `[ChannelCheckHandler] Checking channel: ${event.channel.platform}/${event.channel.value}`
    );

    return liveStreamRepository
      .findByChannel(event.channel)
      .andThen(stream => {
        logger.info(
          `[ChannelCheckHandler] Stream found: ${stream.identifier.value}, status: ${stream.status}`
        );

        if (stream.status === Status.LIVE || stream.status === Status.UPCOMING) {
          return broker
            .publish(
              StreamStarted({
                identifier: UUIDV4String(),
                occurredAt: ImmutableDate.now(),
                snapshot: stream.snapshot(),
              })
            )
            .asyncAndThen(() => okAsync());
        } else if (stream.status === Status.ENDED) {
          return broker
            .publish(
              StreamEnded({
                identifier: UUIDV4String(),
                occurredAt: ImmutableDate.now(),
                stream: stream.identifier,
              })
            )
            .asyncAndThen(() => okAsync());
        }

        return okAsync<void, CommonError>();
      })
      .mapErr(error => {
        if (error.type === 'not-found') {
          logger.info(
            `[ChannelCheckHandler] Stream not found for channel: ${event.channel.platform}/${event.channel.value}`
          );

          broker.publish(
            StreamNotFound({
              identifier: UUIDV4String(),
              occurredAt: ImmutableDate.now(),
              channel: event.channel,
            })
          );
        } else {
          logger.error(
            `[ChannelCheckHandler] Failed to retrieve stream for channel: ${event.channel.platform}/${event.channel.value}`,
            error
          );

          broker.publish(
            MonitoringFailed({
              identifier: UUIDV4String(),
              occurredAt: ImmutableDate.now(),
              message: error.context ?? 'Failed to retrieve live stream.',
              channel: event.channel,
            })
          );
        }

        return error;
      });
  };
