import { Result } from 'neverthrow';

export interface BaseTranslator<T, A, E> {
  translate: (args: T) => Result<A, E>;
}
