import {
  CreateChannelWorkflow as CreateChannelWorkflowTemplate,
  TerminateChannelWorkflow as TerminateChannelWorkflowTemplate,
  UpdateChannelWorkflow as UpdateChannelWorkflowTemplate,
  FindChannelWorkflow as FindChannelWorkflowTemplate,
  MonitoringChannelWorkflow as MonitoringChannelWorkflowsTemplate,
} from 'workflows/monitoring/manage';

import { ResultValueObject } from 'domains/common/value-object';
import { Channel, ChannelIdentifier, MonitoringSetting } from 'domains/monitoring';

import { MonitoringRepositoryDependencies } from './infrastructures/monitoring/acl';

export const CreateChannelWorkflow = CreateChannelWorkflowTemplate(
  ResultValueObject<ChannelIdentifier>(ChannelIdentifier)
)(Channel)()(MonitoringRepositoryDependencies);

export const UpdateChannelWorkflow = UpdateChannelWorkflowTemplate(
  ResultValueObject<MonitoringSetting>(MonitoringSetting)
)(MonitoringRepositoryDependencies);

export const TerminateChannelWorkflow = TerminateChannelWorkflowTemplate(
  MonitoringRepositoryDependencies
)();

export const FindChannelWorkflow = FindChannelWorkflowTemplate(MonitoringRepositoryDependencies);

export const MonitoringChannelWorkflow = () =>
  MonitoringChannelWorkflowsTemplate(MonitoringRepositoryDependencies);
