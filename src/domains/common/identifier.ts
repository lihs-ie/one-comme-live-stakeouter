import { z } from 'zod';

import { ValueObject, valueObjectSchema } from './value-object';

export const uuidV4BasedIdentifierSchema = valueObjectSchema.extend({
  value: z.uuidv4(),
});

export type UUIDV4BasedIdentifier = z.infer<typeof uuidV4BasedIdentifierSchema>;

export const UUIDV4BasedIdentifier = <T extends UUIDV4BasedIdentifier>(schema: z.ZodType<T>) =>
  ValueObject<T>(schema);

export const stringBasedIdentifierSchema = (min: number | null, max: number | null) => {
  let constraint = z.string();

  if (min !== null) {
    constraint = constraint.min(min);
  }

  if (max !== null) {
    constraint = constraint.max(max);
  }

  return valueObjectSchema.extend({
    value: constraint,
  });
};

export type StringBasedIdentifier = ValueObject<
  z.infer<ReturnType<typeof stringBasedIdentifierSchema>>
>;

export const StringBasedIdentifier = <T extends StringBasedIdentifier>(schema: z.ZodType<T>) =>
  ValueObject<T>(schema);
