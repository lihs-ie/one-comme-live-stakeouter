import { Result } from 'neverthrow';

import { ValidationError } from 'aspects/error';

import { ImmutableList } from 'domains/common/collections';

export interface BaseTranslator<T, A, V = T> {
  translate: (args: T) => Result<A, ValidationError>;
  translateEntries: (args: V) => Result<ImmutableList<A>, ValidationError>;
}
