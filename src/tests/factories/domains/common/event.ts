import { Result } from 'neverthrow';

import { CommonError, other } from 'aspects/error';

import { ImmutableList, ImmutableQueue } from 'domains/common/collections';
import { Event, EventBroker, Listener, QueueingDriver } from 'domains/common/event';

import { Builder, Factory } from 'tests/factories/builder';

export type QueueingDriverProperties = {
  events: ImmutableList<Event>;
};

export const QueueingDriverFactory = Factory<QueueingDriver, QueueingDriverProperties>({
  instantiate: properties => {
    let queue: ImmutableQueue<Event> = ImmutableQueue(properties.events.toArray());

    const enqueue = <T extends Event>(event: T) =>
      Result.fromThrowable(
        (event: T) => {
          queue = queue.enqueue(event);

          return;
        },
        error => other('Queue Driver failed to enqueue.', error as Error)
      )(event);

    const dequeue = <T extends Event>() =>
      Result.fromThrowable<() => T, CommonError>(
        () => {
          const [event] = queue.dequeue().get();

          return event as T;
        },
        error => other('Queue Driver failed to dequeue.', error as Error)
      )();

    return {
      enqueue,
      dequeue,
      isEmpty: () => queue.isEmpty(),
    };
  },
  prepare: (overrides, _) => ({
    events: overrides.events ?? ImmutableList.empty<Event>(),
  }),
  retrieve: _ => {
    throw new Error('QueueingDriver cannot be retrieved.');
  },
});

export type EventBrokerProperties = {
  queue: QueueingDriver;
  listeners: ImmutableList<Listener<Event>>;
};

export const EventBrokerFactory = Factory<EventBroker, EventBrokerProperties>({
  instantiate: properties => EventBroker(properties.queue, properties.listeners),
  prepare: (overrides, seed) => ({
    queue: overrides.queue ?? Builder(QueueingDriverFactory).buildWith(seed),
    listeners: overrides.listeners ?? ImmutableList.empty<Listener<Event>>(),
  }),
  retrieve: _ => {
    throw new Error('EventBroker cannot be retrieved.');
  },
});
