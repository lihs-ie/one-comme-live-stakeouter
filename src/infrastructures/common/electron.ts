import Store from 'electron-store';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';

import { ImmutableList, Optional } from 'domains/common/collections';

export type AggregateSchema<N extends string, A> = {
  [key in N]: Record<string, A>;
};

export type ElectronStore<S, A = S> = {
  get: (identifier: string) => ResultAsync<A, CommonError>;
  set: (identifier: string, value: A) => ResultAsync<void, CommonError>;
  terminate: (identifier: string) => ResultAsync<void, CommonError>;
  search: (predicate?: (value: A) => boolean) => ResultAsync<ImmutableList<A>, CommonError>;
  withConverter: <T>(
    serializer: (value: T) => S,
    deserializer: (value: S) => T
  ) => Omit<ElectronStore<S, T>, 'withConverter'>;
};

export const ElectronStore = <N extends string, S>(
  store: Store<AggregateSchema<N, S>>,
  name: N
): ElectronStore<S, S> => {
  const methods = store as {
    get: (key: string) => S | undefined;
    set: (key: string, value: S) => void;
    delete: (key: string) => void;
    has: (key: string) => boolean;
  };

  const base = {
    get: (identifier: string) =>
      Optional(methods.get(`${name}.${identifier}`)).ifPresentOrElse(
        value => okAsync(value),
        () => errAsync({ type: 'not-found', context: identifier })
      ),
    set: (identifier: string, value: S) => {
      methods.set(`${name}.${identifier}`, value);

      return okAsync();
    },
    terminate: (identifier: string) => {
      if (!methods.has(`${name}.${identifier}`)) {
        return errAsync<void, CommonError>({ type: 'not-found', context: identifier });
      }

      methods.delete(`${name}.${identifier}`);

      return okAsync();
    },
    search: (predicate?: (value: S) => boolean) => {
      const values = ImmutableList(Object.values(store.get(name, {})));

      const targets = predicate ? values.filter(value => predicate(value)) : values;

      return okAsync(targets);
    },
  };

  return {
    ...base,
    withConverter: <T>(serializer: (value: T) => S, deserializer: (value: S) => T) => ({
      get: (identifier: string) =>
        Optional(methods.get(`${name}.${identifier}`))
          .map(deserializer)
          .ifPresentOrElse(
            value => okAsync<T, CommonError>(value),
            () => errAsync<T, CommonError>({ type: 'not-found', context: identifier })
          ),
      set: (identifier: string, value: T) => base.set(identifier, serializer(value)),
      terminate: (identifier: string) => base.terminate(identifier),
      search: (predicate?: (value: T) => boolean) => {
        const values = ImmutableList(Object.values(store.get(name, {})).map(deserializer));

        const targets = predicate ? values.filter(value => predicate(value)) : values;

        return okAsync(targets);
      },
    }),
  };
};

type Converter<S, A> = {
  serialize: (value: A) => S;
  deserialize: (value: S) => A;
};

type ConvertedStore<S, A> = Omit<ElectronStore<S, A>, 'withConverter'>;

export const ElectronStoreWithConverter =
  <S>(store: ElectronStore<S>) =>
  <A>(converter: Converter<S, A>) =>
  <R>(implementation: (store: ConvertedStore<S, A>) => R): R =>
    implementation(store.withConverter<A>(converter.serialize, converter.deserialize));
