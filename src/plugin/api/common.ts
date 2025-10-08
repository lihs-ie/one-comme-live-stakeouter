import { CommonError } from 'aspects/error';
import { HttpMethod } from 'aspects/http';

import { ImmutableList } from 'domains/common/collections';

type Parameters = { [key: string]: unknown; resource: string };

export interface PluginRequest<P extends Parameters = Parameters> {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params: P;
  body?: string;
}

export interface PluginResponse<T = unknown> {
  code: number;
  response: T;
}

const compileRoute = (template: string): { regex: RegExp; keys: string[] } => {
  // 両端のスラッシュを削除して正規化（"channels/", "/channels" -> "channels"）
  const normalized = template.replace(/^\/+|\/+$/g, '');

  const escape = (literal: string) => literal.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  const keys: string[] = [];

  // 空テンプレートはルート（""）扱いにしたくないので、そのまま分割
  const parts = normalized === '' ? [] : normalized.split('/');

  const body = parts
    .map(segment => {
      const m = segment.match(/^\{([A-Za-z_][A-Za-z0-9_]*)\}$/);
      if (m) {
        const key = m[1]!;
        keys.push(key);
        return `(?<${key}>[^/]+)`; // 非空の1セグメント
      }

      if (segment === '*') {
        keys.push('wildcard');
        return `(?<wildcard>.*)`;
      }
      return escape(segment);
    })
    .join('/');

  const pattern = `^${body}/?$`; // 末尾スラッシュは任意

  return { regex: new RegExp(pattern), keys };
};

export interface Handler<P extends Parameters = Parameters> {
  match: (request: PluginRequest<P>) => boolean;
  handle: (request: PluginRequest<P>) => Promise<PluginResponse>;
}

export const Handler = <P extends Parameters>(
  resourceTemplate: string,
  method: HttpMethod,
  handle: (request: PluginRequest<P>) => Promise<PluginResponse>
): Handler<P> => {
  const match = (request: PluginRequest): boolean => {
    if (request.method !== method) {
      return false;
    }

    const { regex } = compileRoute(resourceTemplate);

    return regex.test(request.params.resource);
  };

  return { match, handle };
};

export interface Executor {
  execute: (request: PluginRequest) => Promise<PluginResponse>;
}

export const Executor = <P extends Parameters>(...handlers: Handler<P>[]): Executor => ({
  execute: async (request: PluginRequest): Promise<PluginResponse> => {
    const handler = ImmutableList(handlers)
      .find((handler: Handler<P>): boolean => handler.match(request as PluginRequest<P>))
      .get();

    return handler.handle(request as PluginRequest<P>);
  },
});

export const mapErrorResponse = (error: CommonError): PluginResponse => {
  const status = (() => {
    switch (error.type) {
      case 'not-found': {
        return 404;
      }

      case 'conflict': {
        return 409;
      }

      case 'unauthorized': {
        return 401;
      }

      case 'forbidden': {
        return 403;
      }

      case 'bad-request': {
        return 400;
      }

      case 'unavailable': {
        return 503;
      }

      case 'timeout': {
        return 504;
      }

      case 'validation-error': {
        return 400;
      }

      case 'to-json-error': {
        return 500;
      }

      case 'other': {
        return 500;
      }

      default: {
        return 500;
      }
    }
  })();

  return { code: status, response: { error: error.context } };
};
