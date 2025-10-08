import { ACLLiveStreamRepository } from 'infrastructures/live-stream';
import { ACLProvider } from 'providers/acl';

import { ImmutableSet } from 'domains/common/collections';

export const LiveStreamRepositoryDependencies = ACLLiveStreamRepository(
  ImmutableSet.fromArray([ACLProvider.liveStream.youtube, ACLProvider.liveStream.niconico])
);
