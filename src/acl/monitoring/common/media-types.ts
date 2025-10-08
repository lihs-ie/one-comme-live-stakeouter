import { Result } from 'neverthrow';

import { toJSONError, ToJSONError } from 'aspects/error';

export type BaseMedia<T> = {
  code: number;
  response: T;
};

export interface BaseReader<T, E = T> {
  read: (payload: string) => Result<T, ToJSONError>;
  readEntries: (payload: string) => Result<E, ToJSONError>;
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
