import { ChannelAdaptor } from 'acl/monitoring/channel';

import { Channel, ChannelIdentifier, ChannelRepository } from 'domains/monitoring';

export const ACLChannelRepository = (adaptor: ChannelAdaptor): ChannelRepository => ({
  find: (identifier: ChannelIdentifier) => adaptor.find(identifier),
  monitoring: () => adaptor.search(),
  persist: (channel: Channel) => adaptor.persist(channel),
  terminate: (identifier: ChannelIdentifier) => adaptor.terminate(identifier),
});
