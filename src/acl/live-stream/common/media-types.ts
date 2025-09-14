import { Result } from 'neverthrow';

import { toJSONError, ToJSONError } from 'aspects/error';

export interface BaseReader<T> {
  read: (payload: string) => Result<T, ToJSONError>;
}

export const toJSON = <T>(payload: string): Result<T, ToJSONError> => {
  return Result.fromThrowable(
    (): T => JSON.parse(payload) as T,
    () => toJSONError(payload)
  )();
};

export interface BaseWriter<T> {
  write: (input: T) => string;
}
