import type { EventBroker } from 'domains/common/event';

let eventBroker: EventBroker | null = null;

export const setEventBroker = (broker: EventBroker): void => {
  eventBroker = broker;
};

export const getEventBroker = (): EventBroker => {
  if (!eventBroker) {
    throw new Error('EventBroker not initialized. Call plugin.init() first.');
  }

  return eventBroker;
};

export const clearEventBroker = (): void => {
  eventBroker = null;
};
