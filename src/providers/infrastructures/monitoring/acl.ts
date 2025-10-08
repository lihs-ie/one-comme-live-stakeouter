import { ACLChannelRepository } from 'infrastructures/monitoring';

import { ACLChannelAdaptorDependencies } from '../../acl/monitoring';

export const MonitoringRepositoryDependencies = ACLChannelRepository(ACLChannelAdaptorDependencies);
