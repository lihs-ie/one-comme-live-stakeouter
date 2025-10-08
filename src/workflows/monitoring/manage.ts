import { okAsync, Result, ResultAsync } from 'neverthrow';

import { CommonError, ValidationError } from 'aspects/error';
import { UUIDV4String } from 'aspects/uuid';

import { ImmutableList } from 'domains/common/collections';
import { ImmutableDate, Timestamp } from 'domains/common/date';
import { EventBroker } from 'domains/common/event';
import { PlatformType } from 'domains/common/platform';
import { Properties } from 'domains/common/value-object';
import {
  Channel,
  ChannelCreated,
  ChannelIdentifier,
  ChannelRepository,
  ChannelTerminated,
  MonitoringSetting,
} from 'domains/monitoring';

export type CreateChannelWorkflowCommand = {
  identifier: string;
  platform: PlatformType;
};

export const CreateChannelWorkflow =
  (
    createIdentifier: (
      properties: Properties<ChannelIdentifier>
    ) => Result<ChannelIdentifier, ValidationError>
  ) =>
  (
    createChannel: (properties: {
      identifier: ChannelIdentifier;
      setting: MonitoringSetting;
      lastCheckedAt: ImmutableDate | null;
      timestamp: Timestamp;
    }) => Channel
  ) =>
  (broker?: EventBroker) =>
  (repository: ChannelRepository) =>
  (command: CreateChannelWorkflowCommand): ResultAsync<void, CommonError> => {
    return createIdentifier({
      value: command.identifier,
      platform: command.platform,
    })
      .map(identifier =>
        createChannel({
          identifier,
          setting: MonitoringSetting({ checkInterval: 60, isMonitoring: true }),
          lastCheckedAt: null,
          timestamp: Timestamp({ createdAt: ImmutableDate.now(), updatedAt: ImmutableDate.now() }),
        })
      )
      .asyncAndThen(channel =>
        repository.persist(channel).andThen(() => {
          if (!broker) {
            return okAsync();
          }

          return broker
            .publish(
              ChannelCreated({
                identifier: UUIDV4String(),
                occurredAt: ImmutableDate.now(),
                channel: channel.identifier,
              })
            )
            .asyncAndThen(() => okAsync());
        })
      );
  };

export type UpdateChannelWorkflowCommand = {
  identifier: ChannelIdentifier;
  checkInterval: number | null;
  isMonitoring?: boolean;
};

export const UpdateChannelWorkflow =
  (
    createSetting: (
      properties: Properties<MonitoringSetting>
    ) => Result<MonitoringSetting, ValidationError>
  ) =>
  (repository: ChannelRepository) =>
  (command: UpdateChannelWorkflowCommand): ResultAsync<void, CommonError> =>
    createSetting({
      checkInterval: command.checkInterval,
      isMonitoring: command.isMonitoring ?? false,
    })
      .asyncAndThen(setting =>
        repository.find(command.identifier).map(channel => [setting, channel] as const)
      )
      .andThen(([setting, channel]) =>
        okAsync(
          Channel({
            identifier: channel.identifier,
            setting,
            lastCheckedAt: channel.lastCheckedAt,
            timestamp: Timestamp({
              createdAt: channel.timestamp.createdAt,
              updatedAt: ImmutableDate.now(),
            }),
          })
        )
      )
      .andThen(channel => repository.persist(channel));

export type TerminateChannelWorkflow = {
  identifier: ChannelIdentifier;
};

export const TerminateChannelWorkflow =
  (repository: ChannelRepository) =>
  (broker?: EventBroker) =>
  (command: TerminateChannelWorkflow): ResultAsync<void, CommonError> =>
    repository.terminate(command.identifier).andThen(() => {
      if (!broker) {
        return okAsync();
      }

      return broker.publish(
        ChannelTerminated({
          identifier: UUIDV4String(),
          occurredAt: ImmutableDate.now(),
          channel: command.identifier,
        })
      );
    });

export const MonitoringChannelWorkflow = (
  repository: ChannelRepository
): ResultAsync<ImmutableList<Channel>, CommonError> => repository.monitoring();

export type FindChannelWorkflow = {
  identifier: ChannelIdentifier;
};

export const FindChannelWorkflow =
  (repository: ChannelRepository) =>
  (command: FindChannelWorkflow): ResultAsync<Channel, CommonError> =>
    repository.find(command.identifier);
