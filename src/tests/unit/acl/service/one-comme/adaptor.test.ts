import hash from 'hash-it';

import {
  Reader,
  ServiceDTO,
  Translator,
  ViewerServiceAdaptor,
  Writer,
} from 'acl/service/one-comme';
import { HttpClient } from 'aspects/http';

import { Builder } from 'tests/factories';
import { ViewerServiceFactory } from 'tests/factories/domains/viewer/service';
import { Type } from 'tests/mock/upstreams/common';
import { prepare } from 'tests/mock/upstreams/one-comme';

describe('Package adaptor', () => {
  describe('ViewerServiceAdaptor', () => {
    const baseURL = 'http://localhost';
    const http = HttpClient({ baseURL });

    beforeEach(() => {
      fetchMock.enableMocks();
    });

    afterEach(() => {
      fetchMock.resetMocks();
      fetchMock.disableMocks();
    });

    describe('find', () => {
      describe('successfully', () => {
        it('should returns ServiceDTO', async () => {
          const service = Builder(ViewerServiceFactory).build();

          const seed = hash(service);
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

          prepare(baseURL, upstream => upstream.addService(Type.OK, { model: service, version }));

          const adaptor = ViewerServiceAdaptor(http, Reader, Writer, Translator);

          const result = await adaptor.find(service.identifier.value);

          expect(result.isOk()).toBeTruthy();

          const actual = result._unsafeUnwrap();

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

      describe('unsuccessfully', () => {
        it.each(Object.values(Type).filter(type => type !== 'ok'))(
          'should returns ErrorResult when error response with %s',
          async type => {
            const service = Builder(ViewerServiceFactory).build();

            const seed = hash(service);
            const version = seed % 10000;

            prepare(baseURL, upstream => upstream.addService(type, { model: service, version }));

            const adaptor = ViewerServiceAdaptor(http, Reader, Writer, Translator);

            const result = await adaptor.find(service.identifier.value);

            expect(result.isErr()).toBeTruthy();
          }
        );
      });
    });

    describe('search', () => {
      describe('successfully', () => {
        it('should returns list of ServiceDTO.', async () => {
          const services = Builder(ViewerServiceFactory).buildList(5);

          const expecteds = services.map((service): ServiceDTO => {
            const seed = hash(service);
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

          const overrides = services.map(service => ({
            model: service,
            version: hash(service) % 10000,
          }));

          prepare(baseURL, upstream => upstream.addServices(Type.OK, overrides));

          const adaptor = ViewerServiceAdaptor(http, Reader, Writer, Translator);

          const result = await adaptor.search();

          expect(result.isOk()).toBeTruthy();

          const actuals = result._unsafeUnwrap();

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

      describe('unsuccessfully', () => {
        it.each(Object.values(Type).filter(type => type !== 'ok'))(
          'should returns ErrorResult when error response with %s',
          async type => {
            const services = Builder(ViewerServiceFactory).buildList(10);

            const overrides = services.map(service => ({
              model: service,
              version: hash(service) % 10000,
            }));

            prepare(baseURL, upstream => upstream.addServices(type, overrides));

            const adaptor = ViewerServiceAdaptor(http, Reader, Writer, Translator);

            const result = await adaptor.search();

            expect(result.isErr()).toBeTruthy();
          }
        );
      });
    });

    describe('persist', () => {
      describe('successfully', () => {
        it('should returns SuccessResult when new service.', async () => {
          const service = Builder(ViewerServiceFactory).build();

          prepare(baseURL, upstream =>
            upstream.addServicePersistence(Type.OK, { model: service, version: 1 })
          );

          const adaptor = ViewerServiceAdaptor(http, Reader, Writer, Translator);

          const dto: ServiceDTO = {
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
            version: 1,
          };

          const result = await adaptor.persist(dto);

          expect(result.isOk()).toBeTruthy();
        });
      });

      describe('unsuccessfully', () => {
        it.each(Object.values(Type).filter(type => type !== 'ok'))(
          'should returns ErrorResult when error response with %s',
          async type => {
            const service = Builder(ViewerServiceFactory).build();

            const seed = hash(service);
            const version = seed % 10000;

            prepare(baseURL, upstream =>
              upstream.addServicePersistence(type, { model: service, version })
            );

            const adaptor = ViewerServiceAdaptor(http, Reader, Writer, Translator);

            const dto: ServiceDTO = {
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

            const result = await adaptor.persist(dto);

            expect(result.isErr()).toBeTruthy();
          }
        );
      });
    });

    describe('terminate', () => {
      describe('successfully', () => {
        it('should returns SuccessResult.', async () => {
          const service = Builder(ViewerServiceFactory).build();

          const seed = hash(service);
          const version = seed % 10000;

          prepare(baseURL, upstream =>
            upstream.addServiceTermination(Type.OK, { model: service, version })
          );

          const adaptor = ViewerServiceAdaptor(http, Reader, Writer, Translator);

          const result = await adaptor.terminate(service.identifier.value);

          expect(result.isOk()).toBeTruthy();
        });
      });

      describe('unsuccessfully', () => {
        it.each(Object.values(Type).filter(type => type !== 'ok'))(
          'should returns ErrorResult when error response with %s',
          async type => {
            const service = Builder(ViewerServiceFactory).build();

            const seed = hash(service);
            const version = seed % 10000;

            prepare(baseURL, upstream =>
              upstream.addServiceTermination(type, { model: service, version })
            );

            const adaptor = ViewerServiceAdaptor(http, Reader, Writer, Translator);

            const result = await adaptor.terminate(service.identifier.value);

            expect(result.isErr()).toBeTruthy();
          }
        );
      });
    });
  });
});
