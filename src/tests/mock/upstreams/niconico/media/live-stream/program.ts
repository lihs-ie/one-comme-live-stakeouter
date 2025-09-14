import hash from 'hash-it';

import { RawProgramMedia } from 'acl/live-stream/niconico';

import { LiveStream, liveStreamSchema } from 'domains/streaming';

import { MediaFactory } from '../../../common';

export class ProgramMedia extends MediaFactory<Partial<RawProgramMedia>, LiveStream> {
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

  protected fillByModel(overrides: LiveStream): RawProgramMedia {
    return {
      meta: {
        status: 200,
        errorCode: 'OK',
      },
      data: {
        nicoliveProgramId: overrides.identifier.value,
      },
    };
  }

  protected fill(overrides?: Partial<RawProgramMedia> | LiveStream): RawProgramMedia {
    if (this.isModel(liveStreamSchema, overrides)) {
      return this.fillByModel(overrides);
    }

    const seed = hash(overrides);

    return {
      meta: {
        status: 200,
        errorCode: 'OK',
      },
      data: {
        nicoliveProgramId: String(seed % 10000000),
      },
      ...overrides,
    };
  }
}

expect.extend({
  toBeExpectedNicoNicoProgramMedia(actual: RawProgramMedia, expected: RawProgramMedia) {
    expect(actual.meta.status).toBe(expected.meta.status);
    expect(actual.meta.errorCode).toBe(expected.meta.errorCode);
    expect(actual.data.nicoliveProgramId).toBe(expected.data.nicoliveProgramId);

    return {
      message: () => 'OK',
      pass: true,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeExpectedNicoNicoProgramMedia(expected: RawProgramMedia): R;
    }
  }
}
