import hash from 'hash-it';
import { Result } from 'neverthrow';
import { z } from 'zod';

import { ValidationError, validationError } from 'aspects/error';
import { createFunctionSchema, type ExcludeFunctions } from 'aspects/type';

export type ValueObject<T extends Record<string, unknown>> = T & {
  equals: (other: T) => boolean;
  hashCode: () => string;
};

export const valueObjectSchema = z.object({
  equals: createFunctionSchema(z.function({ input: [z.any()], output: z.boolean() })),
  hashCode: createFunctionSchema(z.function({ output: z.string() })),
});

export type BeforeValidated<T> = T extends { _zod: { input: infer U } }
  ? U
  : T extends object
    ? {
        [K in keyof T as K extends typeof z.$brand ? never : K]: BeforeValidated<T[K]>;
      }
    : T;

export type Properties<T> = BeforeValidated<ExcludeFunctions<T>>;

export const ValueObject =
  <T extends Record<string, unknown>>(validate?: {
    parse: (properties: unknown) => ValueObject<T>;
  }) =>
  (properties: Properties<T>): ValueObject<T> => {
    const isSameType = (other: unknown): other is T => {
      return (
        typeof other === 'object' &&
        other !== null &&
        Object.getPrototypeOf(other) === Object.getPrototypeOf(properties)
      );
    };

    const equals = (other: unknown): boolean => {
      if (properties === other) {
        return true;
      }

      if (isSameType(other)) {
        const { equals: _equals, hashCode: _hashCode, ...copy } = other;

        return hashCode() === hash(copy).toString();
      }

      return false;
    };

    const hashCode = (): string => {
      return hash(properties).toString();
    };

    const candidate = {
      ...(properties as T),
      equals,
      hashCode,
    };

    const validated = validate ? validate.parse(candidate) : candidate;

    return validated;
  };

export const ResultValueObject = <T extends Record<string, unknown>, V = ValueObject<T>>(
  valueObject: (properties: Properties<T>) => V
): ((properties: Properties<T>) => Result<V, ValidationError>) =>
  Result.fromThrowable(
    (properties: Properties<T>) => valueObject(properties),
    error => validationError((error as Error).message)
  );
