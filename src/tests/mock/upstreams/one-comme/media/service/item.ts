import hash from 'hash-it';

import { Media, RawMedia } from 'acl/service/one-comme/media-types';

import { ViewerService, viewerServiceSchema } from 'domains/viewer';

import { Builder, StringFactory } from 'tests/factories';
import { PlatformTypeFactory } from 'tests/factories/domains/common/platform';
import { URLFactory } from 'tests/factories/domains/common/uri';
import { uuidV4FromSeed } from 'tests/helpers';

import { MediaFactory } from '../../../common';

export class ServiceMedia extends MediaFactory<Partial<RawMedia>, ViewerService> {
  public createSuccessfulContent(): string {
    return JSON.stringify(this._data);
  }

  public createFailureContent(): string {
    return JSON.stringify({
      errors: [
        {
          reason: 101,
          cause: 'unit',
          value: 'sku099',
        },
      ],
    });
  }

  protected fillByModel(overrides: ViewerService): RawMedia {
    const seed = hash(overrides);

    return {
      id: overrides.identifier.value,
      name: overrides.name,
      url: overrides.url.value,
      enabled: overrides.enabled,
      speech: overrides.speech,
      color: {
        r: overrides.color.red,
        g: overrides.color.green,
        b: overrides.color.blue,
      },
      write: overrides.write,
      options: {
        outputLogs: overrides.options.outputLog,
        version: seed % 10000,
        platform: overrides.identifier.platform,
      },
    };
  }

  protected fill(overrides?: Partial<RawMedia> | ViewerService): RawMedia {
    if (this.isModel(viewerServiceSchema, overrides)) {
      return this.fillByModel(overrides);
    }

    const seed = hash(overrides);

    return {
      id: uuidV4FromSeed(seed),
      name: Builder(StringFactory(1, 255)).buildWith(seed),
      url: Builder(URLFactory).buildWith(seed).value,
      enabled: seed % 2 === 0,
      speech: seed % 2 === 0,
      color: {
        r: seed % 256,
        g: (seed >> 8) % 256,
        b: (seed >> 16) % 256,
      },
      write: seed % 2 === 0,
      options: {
        outputLogs: seed % 2 === 0,
        version: seed % 10000,
        platform: Builder(PlatformTypeFactory).buildWith(seed),
      },
      ...overrides,
    };
  }
}

expect.extend({
  toBeExpectedServiceMedia(actual: RawMedia, expected: Media) {
    expect(actual.id).toBe(expected.id);
    expect(actual.name).toBe(expected.name);
    expect(actual.url).toBe(expected.url);
    expect(actual.enabled).toBe(expected.enabled);
    expect(actual.speech).toBe(expected.speech);
    expect(actual.write).toBe(expected.write);
    expect(actual.color.r).toBe(expected.color.red);
    expect(actual.color.g).toBe(expected.color.green);
    expect(actual.color.b).toBe(expected.color.blue);
    expect(actual.options.outputLogs).toBe(expected.options.outputLogs);
    expect(actual.options.version).toBe(expected.options.version);
    expect(actual.options.platform).toBe(expected.options.platform);

    return {
      message: () => 'OK',
      pass: true,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeExpectedServiceMedia(expected: RawMedia): R;
    }
  }
}
