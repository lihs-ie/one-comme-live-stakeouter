export type CommonError<T = string> = {
  type: T;
  context?: string;
  error?: Error;
};

export type RouteError = CommonError<
  | 'unauthorized'
  | 'not-found'
  | 'conflict'
  | 'other'
  | 'missing-header'
  | 'invalid-token'
  | 'invalid-session'
  | 'bad-request'
>;

export const notFound = (context?: string): RouteError => ({
  type: 'not-found',
  context,
});

export const conflict = (context?: string): RouteError => ({
  type: 'conflict',
  context,
});

export const other = (context: string, error?: Error): RouteError => ({
  type: 'other',
  context,
  error,
});

export const missingHeader = (): RouteError => ({
  type: 'missing-header',
});

export const invalidToken = (): RouteError => ({
  type: 'invalid-token',
});

export const invalidSession = (): RouteError => ({
  type: 'invalid-session',
});

export const badRequest = (context: string): RouteError => ({
  type: 'bad-request',
  context,
});

export const unauthorized = (context: string): RouteError => ({
  type: 'unauthorized',
  context,
});

export type ToJSONError = CommonError<'to-json-error'> & {
  content: string;
};

export const toJSONError = (content: string): ToJSONError => ({
  type: 'to-json-error',
  context: 'Failed to convert content to JSON',
  content,
});

export type ValidationError = CommonError<'validation-error'>;

export const validationError = (context: string): ValidationError => ({
  type: 'validation-error',
  context,
});

export type NotFoundError = CommonError<'not-found'>;

export type InvalidArgumentError = CommonError<'invalid-argument'>;

export const invalidArgument = (context: string): InvalidArgumentError => ({
  type: 'invalid-argument',
  context,
});
