import type { ChannelRepository } from 'domains/monitoring';

let channelRepository: ChannelRepository | null = null;

export const setChannelRepository = (repository: ChannelRepository): void => {
  channelRepository = repository;
};

export const getChannelRepository = (): ChannelRepository => {
  if (!channelRepository) {
    throw new Error('ChannelRepository not initialized. Call plugin.init() first.');
  }

  return channelRepository;
};

export const clearChannelRepository = (): void => {
  channelRepository = null;
};
