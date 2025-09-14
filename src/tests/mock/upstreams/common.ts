import querystring from 'querystring';

import { type MockResponse } from 'vitest-fetch-mock';
import { z } from 'zod';

import { Status } from 'aspects/http';

import { ImmutableMap } from 'domains/common/collections';

export const Type = {
  OK: 'ok',
  BAD_REQUEST: 'bad_request',
  NOT_FOUND: 'not_found',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  CONFLICT: 'conflict',
  INTERNAL_SERVER_ERROR: 'internal_server_error',
  SERVICE_UNAVAILABLE: 'service_unavailable',
} as const;

export type Type = (typeof Type)[keyof typeof Type];

export abstract class Resource<T, O extends object, Q extends object = object> {
  public constructor(
    protected readonly type: T,
    protected readonly overrides: O
  ) {}

  // リクエストを実行し、レスポンスを生成する
  public handle(request: Request, uri: string): Response {
    if (!this.matches(request, uri)) {
      throw new Error('Request not match.');
    }

    return this.createResponse(request);
  }

  public parseQuery(uri: string): Q {
    return querystring.parse(uri.substring(uri.indexOf('?') + 1)) as Q;
  }

  // 自身を一意に識別する文字列を生成する
  public abstract code(): string;

  // リクエストが自身へのものかどうか判定する
  public abstract matches(request: Request, uri: string): boolean;

  public abstract content(): string;

  // 正常系レスポンスを生成する
  protected abstract createSuccessfulResponse(request: Request): Response;

  protected createBadRequestResponse(_: Request): Response {
    return new Response(null, { status: Status.BAD_REQUEST });
  }

  protected createNotFoundResponse(_: Request): Response {
    return new Response(null, { status: Status.NOT_FOUND });
  }

  protected createUnauthorizedResponse(_: Request): Response {
    return new Response(null, { status: Status.UNAUTHORIZED });
  }

  protected createForbiddenResponse(_: Request): Response {
    return new Response(null, { status: Status.FORBIDDEN });
  }

  protected createConflictResponse(_: Request): Response {
    return new Response(null, { status: Status.CONFLICT });
  }

  protected createInternalServerErrorResponse(_: Request): Response {
    return new Response(null, { status: Status.INTERNAL_SERVER_ERROR });
  }

  protected createServiceUnavailableResponse(_: Request): Response {
    return new Response(null, { status: Status.SERVICE_UNAVAILABLE });
  }

  // リソース固有のレスポンス種別に応じたレスポンスを生成するメソッドは「任意」の要素なのでデフォルト実装を用意しておく
  protected createCustomResponse(_: Request): Response | null {
    return null;
  }

  protected createResponse(request: Request, _?: object): Response {
    switch (this.type) {
      case Type.OK:
        return this.createSuccessfulResponse(request);

      case Type.BAD_REQUEST:
        return this.createBadRequestResponse(request);

      case Type.NOT_FOUND:
        return this.createNotFoundResponse(request);

      case Type.UNAUTHORIZED:
        return this.createUnauthorizedResponse(request);

      case Type.FORBIDDEN:
        return this.createForbiddenResponse(request);

      case Type.CONFLICT:
        return this.createConflictResponse(request);

      case Type.SERVICE_UNAVAILABLE:
        return this.createServiceUnavailableResponse(request);

      case Type.INTERNAL_SERVER_ERROR:
        return this.createInternalServerErrorResponse(request);
    }

    return this.createCustomResponse(request) ?? new Response(null, { status: 500 });
  }

  protected isModel<T extends O>(schema: z.ZodObject, overrides?: O): overrides is T {
    return schema.safeParse(overrides).success;
  }
}

/**
 * 単一のコンテキストのモックを表すクラス
 */
export abstract class Upstream {
  private resources: ImmutableMap<string, Resource<unknown, object, object>>;

  public constructor(public readonly endpoint: string) {
    this.resources = ImmutableMap.empty<string, Resource<unknown, object, object>>();
  }

  // リクエストを実行する
  public async handle(request: Request): Promise<MockResponse> {
    const uri = request.url.replace(new RegExp(`^${this.endpoint}`), '');
    const resource = this.resources.find((_: string, resource: Resource<unknown, object, object>) =>
      resource.matches(request, uri)
    );

    if (!resource.isPresent()) {
      return {
        body: 'Not found.',
        status: 404,
      };
    }

    const response = resource.get().handle(request, uri);

    return {
      body: await response.text(),
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };
  }

  // リソースを追加する
  protected add<T, O extends object, Q extends object>(resource: Resource<T, O, Q>): void {
    this.resources = this.resources.add(resource.code(), resource);
  }

  protected addAll<T, O extends object, Q extends object>(...resources: Resource<T, O, Q>[]): void {
    resources.forEach(resource => this.add(resource));
  }
}

/**
 * 複数のupstreamモックを単一のモック関数に束ねるユーティリティ
 */
export const UpstreamRouter = (...upstreams: Upstream[]) => {
  return async (request: Request) => {
    const route = upstreams.find(route => request.url.startsWith(route.endpoint));

    if (!route) {
      // エンドポイントが一致するものがなければエラーとする
      throw new Error('Request url is not found.');
    }

    return route.handle(request);
  };
};

// upstreamモックを束ねてjest-fetch-mockに結び付ける
export const inject = (...upstreams: Upstream[]): void => {
  fetchMock.mockResponse(UpstreamRouter(...upstreams));
};

export abstract class MediaFactory<T extends Readonly<Record<string, unknown>>, M extends object> {
  protected readonly _data: Required<T>;

  public constructor(protected readonly overrides?: T | M) {
    this._data = this.fill(overrides);
  }

  public data(): Required<T> {
    return this._data;
  }

  public abstract createSuccessfulContent(): string;

  public abstract createFailureContent(): string;

  protected abstract fillByModel(overrides: M): T;

  protected abstract fill(overrides?: T | M): Required<T>;

  protected isModel(schema: z.ZodObject, overrides?: T | M): overrides is M {
    if (!overrides) {
      return false;
    }

    try {
      schema.parse(overrides);

      return true;
    } catch (_) {
      return false;
    }
  }
}
