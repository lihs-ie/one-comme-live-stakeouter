import { z } from 'zod';

export type ValueOf<T> = T[keyof T];

type IsFunctionSchemaProperty<T> = T extends (...args: unknown[]) => unknown ? true : false;

export type ExcludeFunctionSchemaProperties<T> = {
  [P in keyof T as IsFunctionSchemaProperty<T[P]> extends true ? never : P]: T[P];
};

export type ExcludeFunctions<T> = ExcludeFunctionSchemaProperties<T>;

export const createFunctionSchema = <T extends z.core.$ZodFunction>(schema: T) =>
  z.custom<Parameters<T['implement']>[0]>(((
    fn: z.core.$InferInnerFunctionType<z.core.$ZodFunctionIn, z.core.$ZodFunctionOut>
  ) => schema.implement(fn)) as (data: unknown) => unknown);

export const functionSchemaReturning = <R extends z.ZodTypeAny>(output: R) =>
  z.custom<() => z.infer<R>>(value => {
    if (typeof value !== 'function') return false;
    try {
      createFunctionSchema(z.function({ input: [], output })).parse(value);
      return true;
    } catch {
      return false;
    }
  });
