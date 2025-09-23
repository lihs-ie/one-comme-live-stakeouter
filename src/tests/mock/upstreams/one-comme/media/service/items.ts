import hash from 'hash-it';

import { Media, RawMedia } from 'acl/service/one-comme/media-types';

import { ImmutableList, ImmutableRange } from 'domains/common/collections';
import { immutableListSchema } from 'domains/common/collections/list';
import { ViewerService, viewerServiceSchema } from 'domains/viewer';

import { Builder, StringFactory } from 'tests/factories';
import { PlatformTypeFactory } from 'tests/factories/domains/common/platform';
import { URLFactory } from 'tests/factories/domains/common/uri';
import { uuidV4FromSeed } from 'tests/helpers';

import { MediaFactory } from '../../../common';

export class ServicesMedia extends MediaFactory<Partial<RawMedia>[], ImmutableList<ViewerService>> {
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

  protected fillByModel(overrides: ImmutableList<ViewerService>): RawMedia[] {
    return overrides
      .map(override => {
        const seed = hash(override);

        return {
          id: override.identifier.value,
          name: override.name,
          url: override.url.value,
          enabled: override.enabled,
          speech: override.speech,
          color: {
            r: override.color.red,
            g: override.color.green,
            b: override.color.blue,
          },
          write: override.write,
          options: {
            outputLogs: override.options.outputLog,
            version: seed % 10000,
            platform: override.identifier.platform,
          },
        };
      })
      .toArray();
  }

  protected fill(overrides?: Partial<RawMedia>[] | ImmutableList<ViewerService>): RawMedia[] {
    if (this.isModel(immutableListSchema(viewerServiceSchema), overrides)) {
      return this.fillByModel(overrides);
    }

    const seed = hash(overrides);

    const count = (seed % 5) + 1;

    return ImmutableRange(0, count)
      .map(index => {
        const overrideEntry = Array.isArray(overrides) ? overrides[index] : undefined;

        return {
          id: uuidV4FromSeed(seed + index),
          name: Builder(StringFactory(1, 255)).buildWith(seed + index),
          url: Builder(URLFactory).buildWith(seed + index).value,
          enabled: (seed + index) % 2 === 0,
          speech: (seed + index) % 2 === 0,
          color: {
            r: (seed + index) % 256,
            g: ((seed + index) >> 8) % 256,
            b: ((seed + index) >> 16) % 256,
          },
          write: (seed + index) % 2 === 0,
          options: {
            outputLogs: (seed + index) % 2 === 0,
            version: (seed + index) % 10000,
            platform: Builder(PlatformTypeFactory).buildWith(seed + index),
          },
          ...overrideEntry,
        };
      })
      .toArray();
  }
}

expect.extend({
  toBeExpectedServicesMedia(actual: RawMedia[], expected: ImmutableList<Media>) {
    expect(actual.length).toBe(expected.size());

    const errors = expected
      .zip(ImmutableList(actual))
      .map(([expectedEntry, actualEntry], index) => {
        try {
          expect(expectedEntry.id).toBe(actualEntry.id);
          expect(expectedEntry.name).toBe(actualEntry.name);
          expect(expectedEntry.url).toBe(actualEntry.url);
          expect(expectedEntry.enabled).toBe(actualEntry.enabled);
          expect(expectedEntry.speech).toBe(actualEntry.speech);
          expect(expectedEntry.write).toBe(actualEntry.write);
          expect(expectedEntry.color.red).toBe(actualEntry.color.r);
          expect(expectedEntry.color.green).toBe(actualEntry.color.g);
          expect(expectedEntry.color.blue).toBe(actualEntry.color.b);
          expect(expectedEntry.options.outputLogs).toBe(actualEntry.options.outputLogs);
          expect(expectedEntry.options.version).toBe(actualEntry.options.version);
          expect(expectedEntry.options.platform).toBe(actualEntry.options.platform);

          return null;
        } catch (error) {
          return `Expected services media at index ${index} does not match: ${(error as Error).message}`;
        }
      })
      .filter(error => error !== null);

    if (errors.isNotEmpty()) {
      return {
        message: () => errors.toArray().join('\n'),
        pass: false,
      };
    }

    return {
      message: () => 'OK',
      pass: true,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeExpectedServicesMedia(expected: RawMedia[]): R;
    }
  }
}
