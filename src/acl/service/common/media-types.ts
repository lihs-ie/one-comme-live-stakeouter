import { Result } from 'neverthrow';

import { toJSONError, ToJSONError } from 'aspects/error';

import { ImmutableList } from 'domains/common/collections';

export interface BaseReader<T> {
  read: (payload: string) => Result<T, ToJSONError>;
  readEntries: (payload: string) => Result<ImmutableList<T>, ToJSONError>;
}

export const toJSON = <T>(payload: string): Result<T, ToJSONError> => {
  return Result.fromThrowable(
    (): T => JSON.parse(payload) as T,
    () => toJSONError(payload)
  )();
};

export interface BaseWriter<T, M = string> {
  write: (input: T) => M;
}
