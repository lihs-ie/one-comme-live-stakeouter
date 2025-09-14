import { URL } from 'domains/common/uri';

import { Factory } from 'tests/factories';

export type URLProperties = {
  value: string;
};

export const URLFactory = Factory<URL, URLProperties>({
  instantiate: (properties: URLProperties): URL => URL(properties),
  prepare: (overrides: Partial<URLProperties>, seed: number): URLProperties => ({
    value: overrides.value ?? `https://example.com/${seed}`,
  }),
  retrieve: (instance: URL): URLProperties => ({
    value: instance.value,
  }),
});
