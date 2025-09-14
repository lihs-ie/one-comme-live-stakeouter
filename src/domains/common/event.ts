import { Result, ok } from 'neverthrow';
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

export type Consumer<T extends Event> = (event: T) => void;

export interface Listener<T extends Event> {
  eventType: T['type'];
  handle: (event: T) => void;
  match: <E extends Event>(event: E) => boolean;
}

export const Listener = <T extends Event>(
  eventType: T['type'],
  consumer: Consumer<T>
): Listener<T> => {
  const match = (comparand: Event): comparand is T => {
    return eventType === comparand.type;
  };

  const handle = (event: T): void => {
    return consumer(event);
  };

  return { eventType, match, handle };
};

export interface EventBroker {
  publish: <T extends Event>(event: T) => Result<void, CommonError>;
  listen: <T extends Event>(type: T['type'], consumer: Consumer<T>) => EventBroker;
}

export interface QueueingDriver {
  enqueue: <T extends Event>(event: T) => Result<void, CommonError>;
  dequeue: <T extends Event>() => Result<T, CommonError>;
}

export const EventBroker = (
  queue: QueueingDriver,
  listeners: ImmutableList<Listener<Event>> = ImmutableList.empty<Listener<Event>>()
): EventBroker => {
  let dispatching = false;

  const dispatch = (): Result<void, CommonError> => {
    if (dispatching) {
      return ok();
    }

    dispatching = true;
    try {
      while (true) {
        const polled = queue.dequeue<Event>();
        if (polled.isErr()) {
          break;
        }

        const event = polled.value;

        listeners.foreach(listener => {
          if (listener.match(event)) {
            try {
              listener.handle(event);
            } catch (_) {
              // ignore error
            }
          }
        });
      }

      return ok();
    } finally {
      dispatching = false;
    }
  };

  return {
    listen: <T extends Event>(type: T['type'], consumer: Consumer<T>): EventBroker => {
      const listener = Listener(type, consumer);

      return EventBroker(queue, listeners.addLast(listener as Listener<Event>));
    },
    publish: (event: Event): Result<void, CommonError> => {
      return queue.enqueue(event).andThen(() => dispatch());
    },
  };
};
