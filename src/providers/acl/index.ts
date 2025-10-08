import { ACLNicoNicoAdaptorDependencies, ACLYoutubeAdaptorDependencies } from './live-stream';
import { ACLChannelAdaptorDependencies } from './monitoring';
import { ACLOneCommeAdaptorDependencies } from './service';

export const ACLProvider = {
  liveStream: {
    niconico: ACLNicoNicoAdaptorDependencies,
    youtube: ACLYoutubeAdaptorDependencies,
  },
  service: ACLOneCommeAdaptorDependencies,
  monitoring: {
    channel: ACLChannelAdaptorDependencies,
  },
};
