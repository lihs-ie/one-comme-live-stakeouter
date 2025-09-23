import { Media, Reader, ServiceDTO, Writer } from 'acl/service/one-comme';

import { ImmutableList } from 'domains/common/collections';

import { Builder } from 'tests/factories';
import { PlatformTypeFactory } from 'tests/factories/domains/common/platform';
import { ViewerServiceFactory } from 'tests/factories/domains/viewer/service';
import { ServiceMedia, ServicesMedia } from 'tests/mock/upstreams/one-comme/media/service';

describe('Package media-types', () => {
  describe('Reader', () => {
    describe('read', () => {
      describe('successfully', () => {
        it('should returns SuccessResult with valid payload.', () => {
          const source = new ServiceMedia();
          const expected = source.data();

          const result = Reader.read(source.createSuccessfulContent());

          expect(result.isOk()).toBeTruthy();

          const actual = result._unsafeUnwrap();
          expectTypeOf(result._unsafeUnwrap()).toEqualTypeOf<Media>();

          expect(actual).toBeExpectedServiceMedia(expected);
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

    describe('readEntries', () => {
      describe('successfully', () => {
        it('should returns SuccessResult with valid payload.', () => {
          const source = new ServicesMedia();
          const expected = source.data();

          const actual = Reader.readEntries(source.createSuccessfulContent());

          expect(actual.isOk()).toBeTruthy();

          const actualMedia = actual._unsafeUnwrap();

          expect(expected.length).toBe(actualMedia.size());

          ImmutableList(expected)
            .zip(actualMedia)
            .foreach(([expectedEntry, actualEntry]) => {
              expect(expectedEntry.id).toBe(actualEntry.id);
              expect(expectedEntry.name).toBe(actualEntry.name);
              expect(expectedEntry.url).toBe(actualEntry.url);
              expect(expectedEntry.speech).toBe(actualEntry.speech);
              expect(expectedEntry.write).toBe(actualEntry.write);
              expect(expectedEntry.enabled).toBe(actualEntry.enabled);
              expect(expectedEntry.color?.r).toBe(actualEntry.color.red);
              expect(expectedEntry.color?.g).toBe(actualEntry.color.green);
              expect(expectedEntry.color?.b).toBe(actualEntry.color.blue);
              expect(expectedEntry.options?.outputLogs).toBe(actualEntry.options.outputLogs);
            });
        });
      });

      describe('unsuccessfully', () => {
        it('should returns ErrorResult with invalid payload.', () => {
          const actual = Reader.readEntries('invalid');

          expect(actual.isErr()).toBeTruthy();
          expect(actual._unsafeUnwrapErr().type).toBe('to-json-error');
        });
      });
    });
  });

  describe('Writer', () => {
    describe('write', () => {
      describe('successfully', () => {
        it('should returns JSON string.', () => {
          const writer = Writer;

          const service = Builder(ViewerServiceFactory).build();

          const dto: ServiceDTO = {
            id: service.identifier.value,
            name: service.name,
            url: service.url.value,
            speech: service.speech,
            write: service.write,
            enabled: service.enabled,
            color: {
              red: service.color.red,
              green: service.color.green,
              blue: service.color.blue,
            },
            options: {
              outputLogs: service.options.outputLog,
            },
            platform: Builder(PlatformTypeFactory).build(),
            version: 1,
          };

          const expected = JSON.stringify({
            id: dto.id,
            name: dto.name,
            url: dto.url,
            speech: dto.speech,
            write: dto.write,
            enabled: dto.enabled,
            color: {
              r: dto.color.red,
              g: dto.color.green,
              b: dto.color.blue,
            },
            options: {
              outputLogs: dto.options.outputLogs,
              version: dto.version,
              platform: dto.platform,
            },
          });

          const actual = writer.write(dto);

          expect(actual).toBe(expected);
        });
      });
    });
  });
});
