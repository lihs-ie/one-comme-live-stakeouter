export type CommonError<T = string> = {
  type: T;
  context?: string;
  error?: Error;
};

// HTTP related errors

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

// Domain Error

export type ValidationError = CommonError<'validation-error'>;

export const validationError = (context: string): ValidationError => ({
  type: 'validation-error',
  context,
});

export type AggregateNotFoundError<T> = CommonError<'aggregate-not-found'> & {
  identifier: T;
};

export const aggregateNotFound = <T>(
  context: string,
  identifier: T
): AggregateNotFoundError<T> => ({
  type: 'aggregate-not-found',
  context,
  identifier,
});

export type UnexpectedValueError = CommonError<'unexpected-value'>;

export const unexpectedValue = (context: string): UnexpectedValueError => ({
  type: 'unexpected-value',
  context,
});

export type DetectionFailureError = CommonError<'detection-failure'> & {
  retryable: boolean;
  cooldownUntil: number | null;
  hint?: string;
};

export const detectionFailure = (properties: {
  retryable: boolean;
  cooldownUntil: number | null;
  context?: string;
  hint?: string;
  error?: Error;
}): DetectionFailureError => ({
  type: 'detection-failure',
  retryable: properties.retryable,
  cooldownUntil: properties.cooldownUntil,
  context: properties.context,
  hint: properties.hint,
  error: properties.error,
});
