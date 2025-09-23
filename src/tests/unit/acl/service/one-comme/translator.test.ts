import hashIt from 'hash-it';

import { Reader, ServiceDTO, Translator } from 'acl/service/one-comme';

import { Builder } from 'tests/factories';
import { ViewerServiceFactory } from 'tests/factories/domains/viewer/service';
import { ServiceMedia, ServicesMedia } from 'tests/mock/upstreams/one-comme/media/service';

describe('Package translator', () => {
  describe('Translator', () => {
    describe('translate', () => {
      describe('successfully', () => {
        it('should translate returns SuccessResult with valid media', () => {
          const service = Builder(ViewerServiceFactory).build();

          const seed = hashIt(service);
          const version = seed % 10000;

          const expected: ServiceDTO = {
            id: service.identifier.value,
            name: service.name,
            url: service.url.value,
            enabled: service.enabled,
            speech: service.speech,
            color: {
              red: service.color.red,
              green: service.color.green,
              blue: service.color.blue,
            },
            write: service.write,
            options: {
              outputLogs: service.options.outputLog,
            },
            platform: service.identifier.platform,
            version,
          };

          const media = new ServiceMedia(service);

          const actual = Translator.translate(
            Reader.read(media.createSuccessfulContent())._unsafeUnwrap()
          );

          expect(actual.id).toBe(expected.id);
          expect(actual.name).toBe(expected.name);
          expect(actual.url).toBe(expected.url);
          expect(actual.enabled).toBe(expected.enabled);
          expect(actual.speech).toBe(expected.speech);
          expect(actual.write).toBe(expected.write);
          expect(actual.color.red).toBe(expected.color.red);
          expect(actual.color.green).toBe(expected.color.green);
          expect(actual.color.blue).toBe(expected.color.blue);
          expect(actual.options.outputLogs).toBe(expected.options.outputLogs);
          expect(actual.version).toBe(expected.version);
          expect(actual.platform).toBe(expected.platform);
        });
      });
    });

    describe('translateEntries', () => {
      describe('successfully', () => {
        it('should translateEntries returns SuccessResult with valid media.', () => {
          const services = Builder(ViewerServiceFactory).buildList(5);

          const expecteds = services.map((service): ServiceDTO => {
            const seed = hashIt(service);
            const version = seed % 10000;

            return {
              id: service.identifier.value,
              name: service.name,
              url: service.url.value,
              enabled: service.enabled,
              speech: service.speech,
              color: {
                red: service.color.red,
                green: service.color.green,
                blue: service.color.blue,
              },
              write: service.write,
              options: {
                outputLogs: service.options.outputLog,
              },
              platform: service.identifier.platform,
              version,
            };
          });

          const media = new ServicesMedia(services);

          const actuals = Translator.translateEntries(
            Reader.readEntries(media.createSuccessfulContent())._unsafeUnwrap()
          );

          expect(expecteds.size()).toBe(actuals.size());

          expecteds.zip(actuals).foreach(([expected, actual]) => {
            expect(actual.id).toBe(expected.id);
            expect(actual.name).toBe(expected.name);
            expect(actual.url).toBe(expected.url);
            expect(actual.enabled).toBe(expected.enabled);
            expect(actual.speech).toBe(expected.speech);
            expect(actual.write).toBe(expected.write);
            expect(actual.color.red).toBe(expected.color.red);
            expect(actual.color.green).toBe(expected.color.green);
            expect(actual.color.blue).toBe(expected.color.blue);
            expect(actual.options.outputLogs).toBe(expected.options.outputLogs);
            expect(actual.version).toBe(expected.version);
            expect(actual.platform).toBe(expected.platform);
          });
        });
      });
    });
  });
});
