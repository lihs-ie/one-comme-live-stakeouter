import { Media, Reader } from 'acl/live-stream/youtube';

import { LiveStreamMedia } from 'tests/mock/upstreams/youtube/media/live-stream';

describe('Package media-types', () => {
  describe('Reader', () => {
    describe('read', () => {
      describe('successfully', () => {
        it('should returns SuccessResult with valid payload.', () => {
          const source = new LiveStreamMedia();

          const actual = Reader.read(source.createSuccessfulContent());

          expect(actual.isOk()).toBeTruthy();
          expectTypeOf(actual._unsafeUnwrap()).toEqualTypeOf<Media>();
        });
      });

      describe('unsuccessfully', () => {
        it('should returns ErrorResult with invalid payload.', () => {
          const actual = Reader.read('invalid');

          expect(actual.isErr()).toBeTruthy();
          expect(actual._unsafeUnwrapErr().type).toBe('to-json-error');
        });
      });
    });
  });
});
