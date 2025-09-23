import { ImmutableList } from 'domains/common/collections';

export interface BaseTranslator<T, V, A> {
  translate: (args: T) => A;
  translateEntries: (args: V) => ImmutableList<A>;
}
