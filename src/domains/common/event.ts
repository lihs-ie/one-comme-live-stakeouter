import { Result, ResultAsync, ok } from 'neverthrow';
import { z } from 'zod';

import { CommonError } from 'aspects/error';

import { ImmutableList } from './collections';
import { immutableDateSchema } from './date';

export const eventSchema = <T extends string>(type: z.ZodLiteral<T>) =>
  z.object({
    identifier: z.uuidv4(),
    occurredAt: immutableDateSchema,
    type,
  });

export type Event<T extends string = string> = z.infer<ReturnType<typeof eventSchema<T>>>;

export const createEvent =
  <T extends Event>(schema: z.ZodObject, type: T['type']) =>
  <P extends Record<string, unknown>>(properties: Omit<P, 'type'>): T =>
    schema.parse({ ...properties, type }) as T;

export interface Subscriber {
  subscribe: (broker: EventBroker) => EventBroker;
}

export type Consumer<T extends Event> = (event: T) => ResultAsync<void, CommonError>;

export interface Listener<T extends Event> {
  eventType: T['type'];
  handle: (event: T) => ResultAsync<void, CommonError>;
  match: <E extends Event>(event: E) => boolean;
}

export const Listener = <T extends Event>(
  eventType: T['type'],
  consumer: Consumer<T>
): Listener<T> => {
  const match = (comparand: Event): comparand is T => {
    return eventType === comparand.type;
  };

  const handle = (event: T): ResultAsync<void, CommonError> => {
    return consumer(event);
  };

  return { eventType, match, handle };
};

export interface EventBroker {
  publish: <T extends Event>(event: T) => Result<void, CommonError>;
  publishAll: <T extends Event>(events: ImmutableList<T>) => Result<void[], CommonError>;
  listen: <T extends Event>(type: T['type'], consumer: Consumer<T>) => EventBroker;
  consume: () => Result<void, CommonError>;
}

export interface QueueingDriver {
  enqueue: <T extends Event>(event: T) => Result<void, CommonError>;
  dequeue: <T extends Event>() => Result<T, CommonError>;
  isEmpty: () => boolean;
}

export const EventBroker = (
  queue: QueueingDriver,
  listeners: ImmutableList<Listener<Event>> = ImmutableList.empty<Listener<Event>>()
): EventBroker => {
  return {
    listen: <T extends Event>(type: T['type'], consumer: Consumer<T>): EventBroker => {
      const listener = Listener(type, consumer);

      return EventBroker(queue, listeners.addLast(listener as Listener<Event>));
    },
    publish: (event: Event): Result<void, CommonError> => {
      return queue.enqueue(event);
    },
    publishAll: <T extends Event>(events: ImmutableList<T>): Result<void[], CommonError> => {
      return Result.combine(events.map(event => queue.enqueue(event)).toArray());
    },
    consume: (): Result<void, CommonError> => {
      while (!queue.isEmpty()) {
        queue.dequeue().map(event =>
          listeners.foreach(listener => {
            if (listener.match(event)) {
              listener.handle(event);
            }
          })
        );
      }

      return ok();
    },
  };
};
