import { ResultAsync, errAsync } from 'neverthrow';

import { RouteError } from './error';

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

export const ContentType = {
  JSON: 'application/json',
  PLAIN: 'text/plain',
  HTML: 'text/html',
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export const Status = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type Status = (typeof Status)[keyof typeof Status];

/**
 * HTTP エラー型（関数型クライアント用）
 */
export type HttpClientError =
  | { type: 'timeout'; message: string }
  | { type: 'network-error'; message: string; cause?: Error }
  | { type: 'http-error'; message: string; status: number; bodyText?: string };

/**
 * レスポンス表現（必要最小限、イミュータブル）
 */
export type HttpResponse = {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly url: string;
  readonly bodyText: string;
};

/**
 * リクエスト入力（1回の呼び出し分）
 */
export type HttpRequest = {
  readonly method: HttpMethod;
  readonly pathOrUrl: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly query?: Readonly<
    Record<
      string,
      | string
      | number
      | boolean
      | null
      | undefined
      | ReadonlyArray<string | number | boolean | null | undefined>
    >
  >;
  readonly body?: string | ArrayBuffer | Uint8Array;
  readonly json?: unknown;
  readonly form?: Readonly<
    Record<
      string,
      | string
      | number
      | boolean
      | null
      | undefined
      | ReadonlyArray<string | number | boolean | null | undefined>
    >
  >;
  readonly timeoutMs?: number;
  readonly httpErrors?: boolean; // リクエスト単位で上書き
};

/**
 * Guzzle互換の options 形（public向け）
 */
export type RequestOptions = Omit<HttpRequest, 'method' | 'pathOrUrl'>;

/**
 * クライアント生成時の既定値
 */
export type HttpClientOptions = {
  readonly baseURL?: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly timeoutMs?: number;
  readonly httpErrors?: boolean; // 既定: true （Guzzle 互換）
  readonly middleware?: ReadonlyArray<Middleware>;
  readonly fetchImpl?: typeof fetch;
  readonly allowRedirects?: boolean; // 既定: true
  readonly decodeContent?: boolean | string; // 既定: true -> gzip, deflate, br
  readonly cookies?: boolean | CookieJar;
  readonly proxy?: {
    readonly http?: string;
    readonly https?: string;
    readonly no?: ReadonlyArray<string>;
  };
};

/**
 * ハンドラ／ミドルウェア型
 */
export type Handler = (req: NormalizedRequest) => ResultAsync<HttpResponse, HttpClientError>;
export type Middleware = (next: Handler) => Handler;

type NormalizedRequest = {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: BodyInit | null;
  readonly timeoutMs: number | undefined;
  readonly httpErrors: boolean;
  readonly allowRedirects: boolean;
  readonly cookieJar?: CookieJar;
  readonly proxy?: {
    readonly http?: string;
    readonly https?: string;
    readonly no?: ReadonlyArray<string>;
  };
};

const DEFAULT_USER_AGENT = 'one-commentator-http/1.0';

/**
 * ミドルウェアを合成して 1 つのハンドラにする。
 */
const compose = (handler: Handler, middlewareList: ReadonlyArray<Middleware>): Handler =>
  middlewareList.reduceRight((nextHandler, middleware) => middleware(nextHandler), handler);

/**
 * URL とクエリを解決する。
 */
const resolveUrl = (
  baseURL: string | undefined,
  pathOrUrl: string,
  query?: HttpRequest['query']
): string => {
  const absolute = /^https?:\/\//i.test(pathOrUrl);
  const normalizedBase = baseURL !== undefined && !baseURL.endsWith('/') ? `${baseURL}/` : baseURL;
  const base = absolute ? undefined : (normalizedBase ?? '');
  const url = new URL(pathOrUrl, base);

  if (query) {
    const entries = Object.entries(query);
    for (const [key, value] of entries) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item === null || item === undefined) continue;
          url.searchParams.append(key, String(item));
        }
      } else if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const urlString = url.toString();
  if (query && Object.keys(query).length > 0 && urlString.includes('/?')) {
    return urlString.replace('/?', '?');
  }

  return urlString;
};

export type CookieJar = {
  readonly getCookieHeader: (url: string) => string | null;
  readonly setCookieFromHeader: (url: string, setCookieHeader: string) => void;
};

const createCookieJar = (): CookieJar => {
  const store = new Map<string, Map<string, string>>();

  const originOf = (url: string) => {
    const urlInstance = new URL(url);

    return `${urlInstance.protocol}//${urlInstance.host}`;
  };

  const getCookieHeader = (url: string): string | null => {
    const origin = originOf(url);
    const cookieStoreMap = store.get(origin);

    if (!cookieStoreMap || cookieStoreMap.size === 0) {
      return null;
    }

    return Array.from(cookieStoreMap.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  };

  const setCookieFromHeader = (url: string, setCookieHeader: string) => {
    const origin = originOf(url);
    const cookieStoreMap = store.get(origin) ?? new Map<string, string>();
    const parts = setCookieHeader.split(/,(?=[^;]+?=)/);

    for (const part of parts) {
      const [nameValue] = part.split(';');
      const [name, ...rest] = nameValue!.split('=');

      if (name === undefined || rest.length === 0) {
        continue;
      }

      const value = rest.join('=').trim();
      if (value) cookieStoreMap.set(name.trim(), value);
    }
    store.set(origin, cookieStoreMap);
  };
  return { getCookieHeader, setCookieFromHeader };
};

/**
 * fetch 実行ハンドラ（実装の最下層）
 */
const fetchHandler =
  (fetchImplementation: typeof fetch): Handler =>
  (normalizedRequest: NormalizedRequest) => {
    const controller = new AbortController();
    const timeoutId =
      normalizedRequest.timeoutMs !== undefined
        ? setTimeout(() => controller.abort(), normalizedRequest.timeoutMs)
        : undefined;

    const headers = new Headers();
    for (const [key, value] of Object.entries(normalizedRequest.headers)) headers.set(key, value);

    type ExtendedInit = RequestInit & {
      _proxy?: {
        readonly http?: string;
        readonly https?: string;
        readonly no?: ReadonlyArray<string>;
      };
    };
    const requestInit: ExtendedInit = {
      method: normalizedRequest.method,
      headers,
      body: normalizedRequest.body,
      signal: controller.signal,
    };
    requestInit.redirect = normalizedRequest.allowRedirects ? 'follow' : 'manual';
    if (normalizedRequest.proxy) {
      requestInit._proxy = normalizedRequest.proxy;
    }

    const run = async (): Promise<HttpResponse> => {
      const response = await fetchImplementation(normalizedRequest.url, requestInit);
      const text = await response.text();
      const headersObj: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      if (timeoutId) clearTimeout(timeoutId);

      const setCookie = response.headers.get('set-cookie');
      if (setCookie !== null && normalizedRequest.cookieJar) {
        normalizedRequest.cookieJar.setCookieFromHeader(normalizedRequest.url, setCookie);
      }

      if (normalizedRequest.httpErrors && (response.status < 200 || response.status >= 300)) {
        throw {
          type: 'http-error',
          message: 'HTTP error',
          status: response.status,
          bodyText: text,
        } as HttpClientError;
      }

      return { status: response.status, headers: headersObj, url: response.url, bodyText: text };
    };

    return ResultAsync.fromPromise(run(), (e: unknown) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (typeof e === 'object' && e !== null && (e as { type?: string }).type === 'http-error') {
        return e as HttpClientError;
      }
      const error = e as Error;
      const isAbort = error?.name === 'AbortError';
      return isAbort
        ? ({ type: 'timeout', message: 'Request timed out' } as const)
        : ({
            type: 'network-error',
            message: error?.message ?? 'Network error',
            cause: error,
          } as const);
    });
  };

export const retry =
  (options: {
    readonly maxRetries: number;
    readonly shouldRetry: (r: { error?: HttpClientError; status?: number }) => boolean;
    readonly backoffMs: (attempt: number) => number;
  }): Middleware =>
  next =>
  req => {
    const attempt = (n: number): ResultAsync<HttpResponse, HttpClientError> =>
      next(req).orElse(e => {
        const status = e.type === 'http-error' ? e.status : undefined;
        if (n >= options.maxRetries || !options.shouldRetry({ error: e, status })) {
          return errAsync(e);
        }
        const wait = options.backoffMs(n);
        return ResultAsync.fromPromise(
          new Promise<void>(resolve => setTimeout(resolve, wait)),
          () => e
        ).andThen(() => attempt(n + 1));
      });
    return attempt(0);
  };

export const logging =
  (
    sink: (event: {
      type: 'request' | 'response';
      url: string;
      method: HttpMethod;
      status?: number;
      elapsedMs?: number;
    }) => void
  ): Middleware =>
  next =>
  normalizedRequest => {
    const start = Date.now();
    sink({ type: 'request', url: normalizedRequest.url, method: normalizedRequest.method });
    return next(normalizedRequest).map(response => {
      sink({
        type: 'response',
        url: normalizedRequest.url,
        method: normalizedRequest.method,
        status: response.status,
        elapsedMs: Date.now() - start,
      });
      return response;
    });
  };

export const HttpClient = (options?: HttpClientOptions) => {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const baseURL = options?.baseURL;
  const defaultHeaders: Record<string, string> = {
    'User-Agent': DEFAULT_USER_AGENT,
    ...(options?.headers ?? {}),
  };
  const defaultTimeoutMs = options?.timeoutMs;
  const defaultHttpErrors = options?.httpErrors ?? true;
  const allowRedirects = options?.allowRedirects ?? true;
  const decodeContent = options?.decodeContent ?? true;
  const cookieJar: CookieJar | undefined =
    options?.cookies === true
      ? createCookieJar()
      : options?.cookies !== undefined && options?.cookies !== false
        ? options.cookies
        : undefined;
  const proxy = options?.proxy;
  const stack = compose(fetchHandler(fetchImpl), [...(options?.middleware ?? [])]);

  const build = (request: HttpRequest): NormalizedRequest => {
    const jsonBody = request.json !== undefined ? JSON.stringify(request.json) : undefined;
    const conditionalHeaders: Record<string, string> =
      jsonBody !== undefined ? { 'Content-Type': 'application/json' } : {};

    let body: BodyInit | null | undefined = jsonBody ?? (request.body as BodyInit | undefined);
    if (jsonBody === undefined && request.form && body === undefined) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(request.form)) {
        if (Array.isArray(v)) {
          for (const item of v)
            if (item !== null && item !== undefined) params.append(k, String(item));
        } else if (v !== null && v !== undefined) {
          params.append(k, String(v));
        }
      }
      body = params.toString();
      conditionalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    // Accept-Encoding（decodeContent=true）
    const acceptEncodingValue =
      typeof decodeContent === 'string'
        ? decodeContent
        : decodeContent
          ? 'gzip, deflate, br'
          : undefined;
    if (acceptEncodingValue !== undefined && !('Accept-Encoding' in defaultHeaders)) {
      conditionalHeaders['Accept-Encoding'] = acceptEncodingValue;
    }

    // inject Cookie
    const urlForCookie = resolveUrl(baseURL, request.pathOrUrl, request.query);
    const cookieHeader = cookieJar?.getCookieHeader(urlForCookie) ?? null;
    if (cookieHeader !== null) {
      conditionalHeaders['Cookie'] = cookieHeader;
    }

    const mergedHeaders = { ...conditionalHeaders, ...defaultHeaders, ...(request.headers ?? {}) };

    return {
      url: urlForCookie,
      method: request.method,
      headers: mergedHeaders,
      body,
      timeoutMs: request.timeoutMs ?? defaultTimeoutMs,
      httpErrors: request.httpErrors ?? defaultHttpErrors,
      allowRedirects,
      cookieJar,
      proxy,
    } as const;
  };

  const request = (
    method: HttpMethod,
    pathOrUrl: string,
    options?: RequestOptions
  ): ResultAsync<HttpResponse, HttpClientError> =>
    stack(build({ method, pathOrUrl, ...(options ?? {}) }));

  const get = (pathOrUrl: string, init?: RequestOptions) =>
    request(HttpMethod.GET, pathOrUrl, init);
  const post = (pathOrUrl: string, init?: RequestOptions) =>
    request(HttpMethod.POST, pathOrUrl, init);
  const put = (pathOrUrl: string, init?: RequestOptions) =>
    request(HttpMethod.PUT, pathOrUrl, init);
  const patch = (pathOrUrl: string, init?: RequestOptions) =>
    request(HttpMethod.PATCH, pathOrUrl, init);
  const del = (pathOrUrl: string, init?: RequestOptions) =>
    request(HttpMethod.DELETE, pathOrUrl, init);

  return { request, get, post, put, patch, del };
};

export type HttpClient = ReturnType<typeof HttpClient>;

export const mapHttpClientError = (error: HttpClientError): RouteError => {
  if (error.type === 'http-error') {
    switch (error.status) {
      case 404:
        return { type: 'not-found', context: error.message };

      case 409:
        return { type: 'conflict', context: error.message };

      case 400:
        return { type: 'bad-request', context: error.message };

      case 401:
        return { type: 'unauthorized', context: error.message };

      default:
        return { type: 'other', context: error.message };
    }
  }

  if (error.type === 'timeout') {
    return { type: 'other', context: 'timeout', error: new Error(error.message) };
  }

  return { type: 'other', context: 'network error', error: new Error(error.message) };
};
