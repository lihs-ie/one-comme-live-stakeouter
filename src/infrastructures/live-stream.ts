import { errAsync } from 'neverthrow';

import { LiveStreamAdaptor } from 'acl/live-stream/common';
import { aggregateNotFound } from 'aspects/error';

import { ImmutableSet } from 'domains/common/collections';
import { ChannelIdentifier } from 'domains/monitoring';
import { LiveStream, LiveStreamIdentifier, LiveStreamRepository } from 'domains/streaming';

export const ACLLiveStreamRepository = (
  adaptors: ImmutableSet<LiveStreamAdaptor>
): LiveStreamRepository => ({
  find: (identifier: LiveStreamIdentifier) => errAsync(aggregateNotFound('LiveStream', identifier)),
  findByChannel: (channel: ChannelIdentifier) =>
    adaptors
      .find(adaptor => adaptor.support(channel.platform))
      .map(adaptor => adaptor.findByChannel(channel))
      .orElse(
        errAsync({ type: 'aggregate-not-found', context: channel.value, identifier: channel })
      ),
  persist: (stream: LiveStream) => errAsync(aggregateNotFound('LiveStream', stream.identifier)),
  terminate: (identifier: LiveStreamIdentifier) =>
    errAsync(aggregateNotFound('LiveStream', identifier)),
});
