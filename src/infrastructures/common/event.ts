import { Result, ok, err } from 'neverthrow';

import { CommonError } from 'aspects/error';

import { ImmutableQueue } from 'domains/common/collections';
import { Event, QueueingDriver } from 'domains/common/event';

export const InMemoryQueueingDriver = (): QueueingDriver => {
  let queue: ImmutableQueue<Event> = ImmutableQueue.empty<Event>();

  const enqueue = <T extends Event>(event: T): Result<void, CommonError> => {
    queue = queue.enqueue(event);

    return ok();
  };

  const dequeue = <T extends Event>(): Result<T, CommonError> => {
    return queue.dequeue().ifPresentOrElse(
      ([event, next]) => {
        queue = next;

        return ok(event as T);
      },
      () => err({ type: 'no-such-element', context: 'Event Queue' } satisfies CommonError)
    );
  };

  return { enqueue, dequeue, isEmpty: () => queue.isEmpty() };
};
