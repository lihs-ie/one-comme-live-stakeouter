import {
  ProgramMedia as ProgramCustomMedia,
  ProgramReader,
  LiveStreamMedia as LiveStreamCustomMedia,
  LiveStreamReader,
} from 'acl/live-stream/niconico';

import { LiveStreamMedia, ProgramMedia } from 'tests/mock/upstreams/niconico/media/live-stream';

describe('Package media-types', () => {
  describe('ProgramReader', () => {
    describe('read', () => {
      describe('successfully', () => {
        it('should returns SuccessResult with valid payload.', () => {
          const source = new ProgramMedia();

          const actual = ProgramReader.read(source.createSuccessfulContent());

          expect(actual.isOk()).toBeTruthy();
          expectTypeOf(actual._unsafeUnwrap()).toEqualTypeOf<ProgramCustomMedia>();
        });
      });

      describe('unsuccessfully', () => {
        it('should returns ErrorResult with invalid payload.', () => {
          const actual = ProgramReader.read('invalid');

          expect(actual.isErr()).toBeTruthy();
          expect(actual._unsafeUnwrapErr().type).toBe('to-json-error');
        });
      });
    });
  });

  describe('LiveStreamReader', () => {
    describe('read', () => {
      describe('successfully', () => {
        it('should returns SuccessResult with valid payload.', () => {
          const source = new LiveStreamMedia();

          const actual = LiveStreamReader.read(source.createSuccessfulContent());

          expect(actual.isOk()).toBeTruthy();
          expectTypeOf(actual._unsafeUnwrap()).toEqualTypeOf<LiveStreamCustomMedia>();
        });
      });

      describe('unsuccessfully', () => {
        it('should returns ErrorResult with invalid payload.', () => {
          const actual = LiveStreamReader.read('invalid');

          expect(actual.isErr()).toBeTruthy();
          expect(actual._unsafeUnwrapErr().type).toBe('to-json-error');
        });
      });
    });
  });
});
