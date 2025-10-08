import { LiveStreamRepositoryDependencies } from './live-stream';
import { ViewerServiceDependencies } from './service';

export const InfrastructureProvider = {
  liveStream: LiveStreamRepositoryDependencies,
  service: ViewerServiceDependencies,
};
