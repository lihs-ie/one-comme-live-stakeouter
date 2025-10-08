import { ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { Logger, type Logger as LoggerType } from 'aspects/log';
import { AggregateSchema, InMemoryQueueingDriver } from 'infrastructures/common';
import { type SerializedChannel } from 'infrastructures/monitoring/channel/electron';
import { getEventBroker, setEventBroker } from 'plugin/event';
import { getChannelRepository, setChannelRepository } from 'plugin/repository';
import {
  bootstrapPlugin as coreBootstrap,
  type PluginConfig,
  type StopPlugin,
} from 'workflows/bootstrap';
import {
  CreateChannelWorkflow as CreateChannelWorkflowTemplate,
  TerminateChannelWorkflow as TerminateChannelWorkflowTemplate,
  UpdateChannelWorkflow as UpdateChannelWorkflowTemplate,
  FindChannelWorkflow as FindChannelWorkflowTemplate,
  MonitoringChannelWorkflow as MonitoringChannelWorkflowTemplate,
} from 'workflows/monitoring/manage';

import { EventBroker } from 'domains/common/event';
import { ResultValueObject } from 'domains/common/value-object';
import {
  Channel,
  ChannelIdentifier,
  MonitoringSetting,
  type ChannelRepository,
} from 'domains/monitoring';
import { type LiveStreamRepository } from 'domains/streaming';
import { type ViewerServiceRepository } from 'domains/viewer/service';

import { InfrastructureProvider } from './infrastructures';
import { MonitoringRepositoryDependencies } from './infrastructures/monitoring/electron';

import type Store from 'electron-store';

export type BootstrapConfig = {
  eventWorkerIntervalMs: number;
  monitoringTickMs: number;
};

export type PluginLifecycle = {
  shutdown: StopPlugin;
  logger: LoggerType;
  channelRepository: ChannelRepository;
  liveStreamRepository: LiveStreamRepository;
  viewerServiceRepository: ViewerServiceRepository;
};

/**
 * プラグイン全体のワークフローをブートストラップ
 *
 * @param store ElectronStoreインスタンス
 * @param config ブートストラップ設定
 * @param liveStreamRepository LiveStreamRepository
 * @param viewerServiceRepository ViewerServiceRepository
 * @returns PluginLifecycle（shutdown関数とrepositories）
 */
export const bootstrapPlugin = (
  store: Store<AggregateSchema<'channels', SerializedChannel>>,
  config: BootstrapConfig
): ResultAsync<PluginLifecycle, CommonError> => {
  const logger = Logger;

  logger.info('[PluginBootstrap] Initializing workflows...');

  const queueDriver = InMemoryQueueingDriver();
  setEventBroker(EventBroker(queueDriver));

  const channelRepository = MonitoringRepositoryDependencies(store);
  setChannelRepository(channelRepository);
  const liveStreamRepository = InfrastructureProvider.liveStream;
  const viewerServiceRepository = InfrastructureProvider.service;

  const pluginConfig: PluginConfig = {
    monitoring: {
      defaultTickInterval: config.monitoringTickMs,
    },
    eventWorker: {
      intervalMs: config.eventWorkerIntervalMs,
    },
  };

  return coreBootstrap(
    queueDriver,
    {
      channel: channelRepository,
      liveStream: liveStreamRepository,
      service: viewerServiceRepository,
    },
    pluginConfig,
    logger
  ).map(stopPlugin => {
    logger.info('[PluginBootstrap] All workflows initialized successfully');

    return {
      shutdown: stopPlugin,
      logger,
      channelRepository,
      liveStreamRepository,
      viewerServiceRepository,
    };
  });
};

export const CreateChannelWorkflow = () =>
  CreateChannelWorkflowTemplate(ResultValueObject<ChannelIdentifier>(ChannelIdentifier))(Channel)(
    getEventBroker()
  )(getChannelRepository());

export const UpdateChannelWorkflow = () =>
  UpdateChannelWorkflowTemplate(ResultValueObject<MonitoringSetting>(MonitoringSetting))(
    getChannelRepository()
  );

export const MonitoringChannelWorkflow = () =>
  MonitoringChannelWorkflowTemplate(getChannelRepository());

export const TerminateChannelWorkflow = () =>
  TerminateChannelWorkflowTemplate(getChannelRepository())(getEventBroker());

export const FindChannelWorkflow = () => FindChannelWorkflowTemplate(getChannelRepository());
