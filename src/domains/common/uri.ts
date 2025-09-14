import { z } from 'zod/mini';

import { ValueObject, valueObjectSchema } from './value-object';

export const urlSchema = valueObjectSchema
  .extend({
    value: z.url(),
  })
  .brand('URL');

export type URL = ValueObject<z.output<typeof urlSchema>>;

export const URL = ValueObject<URL>(urlSchema);
