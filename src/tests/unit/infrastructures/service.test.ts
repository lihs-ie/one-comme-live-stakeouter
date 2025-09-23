import { ServiceDTO } from 'acl/service/one-comme';
import { ACLViewerServiceRepository } from 'infrastructures/service';

import { ImmutableList, ImmutableSet } from 'domains/common/collections';
import { ViewerService } from 'domains/viewer';

import { Builder } from 'tests/factories';
import { ViewerServiceAdaptorFactory } from 'tests/factories/acl/service/one-comme/adaptor';
import { ViewerServiceFactory } from 'tests/factories/domains/viewer/service';

const toDTO = (service: ViewerService, version?: number): ServiceDTO => ({
  id: service.identifier.value,
  platform: service.identifier.platform,
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
  version: version === undefined ? 1 : version,
});

describe('Package service', () => {
  describe('ACLViewerServiceRepository', () => {
    describe('find', () => {
      describe('successfully', () => {
        it('should returns SuccessResult containing viewer-service and version when the service exists', async () => {
          const services = Builder(ViewerServiceFactory).buildList(
            Math.floor(Math.random() * 10) + 1
          );

          const expected = services.get(Math.floor(Math.random() * services.size())).get();

          const repository = ACLViewerServiceRepository(
            Builder(ViewerServiceAdaptorFactory).build({
              instances: services.map(service => toDTO(service)),
            })
          );

          const result = await repository.find(expected.identifier);

          expect(result.isOk()).toBeTruthy();

          const actual = result._unsafeUnwrap();

          expect(actual).toBeSameViewerService(expected);
        });
      });

      describe('unsuccessfully', () => {
        it('should returns ErrorResult when the service does not exist', async () => {
          const services = Builder(ViewerServiceFactory).buildList(
            Math.floor(Math.random() * 10) + 2
          );

          const missing = services.first().get();

          const repository = ACLViewerServiceRepository(
            Builder(ViewerServiceAdaptorFactory).build({
              instances: services.drop(1).map(service => toDTO(service)),
            })
          );

          const result = await repository.find(missing.identifier);

          expect(result.isErr()).toBeTruthy();
          expect(result._unsafeUnwrapErr().type).toBe('not-found');
        });
      });
    });

    describe('search', () => {
      describe('successfully', () => {
        it('should returns SuccessResult containing all viewer-services', async () => {
          const expecteds = Builder(ViewerServiceFactory).buildList(
            Math.floor(Math.random() * 10) + 1
          );

          const repository = ACLViewerServiceRepository(
            Builder(ViewerServiceAdaptorFactory).build({
              instances: expecteds.map(service => toDTO(service)),
            })
          );

          const result = await repository.search();

          expect(result.isOk()).toBeTruthy();

          const actuals = result._unsafeUnwrap();

          expect(actuals.size()).toBe(expecteds.size());

          expecteds.foreach(expected => {
            const actual = actuals
              .find(actual => expected.identifier.equals(actual.identifier))
              .get();

            expect(actual).toBeSameViewerService(expected);
          });
        });
      });
    });

    describe('persist', () => {
      describe('successfully', () => {
        it('should returns SuccessResult when first version of the service is persisted', async () => {
          const service = Builder(ViewerServiceFactory).build();

          let persisted = ImmutableSet.empty<ServiceDTO>();

          const onPersist = (dto: ServiceDTO) => {
            persisted = persisted.add(dto);
          };

          const repository = ACLViewerServiceRepository(
            Builder(ViewerServiceAdaptorFactory).build({ onPersist })
          );

          const result = await repository.persist(service);

          expect(result.isOk()).toBeTruthy();

          expect(persisted.size()).toBe(1);

          expect(persisted.contains(toDTO(service, 1))).toBeTruthy();
        });

        it('should returns SuccessResult when next version of the service is persisted', async () => {
          const service = Builder(ViewerServiceFactory).build();

          let persisted = ImmutableSet.empty<ServiceDTO>();

          const onPersist = (dto: ServiceDTO) => {
            persisted = persisted.add(dto);
          };

          const repository = ACLViewerServiceRepository(
            Builder(ViewerServiceAdaptorFactory).build({
              instances: ImmutableList([toDTO(service, 1)]),
              onPersist,
            })
          );

          const result = await repository.persist(service);

          expect(result.isOk()).toBeTruthy();

          expect(persisted.size()).toBe(1);
        });
      });
    });

    describe('terminate', () => {
      describe('successfully', () => {
        it('should returns SuccessResult when the service is terminated', async () => {
          const service = Builder(ViewerServiceFactory).build();

          let terminated = ImmutableSet.empty<ServiceDTO>();

          const onTerminate = (dto: ServiceDTO) => {
            terminated = terminated.add(dto);
          };

          const repository = ACLViewerServiceRepository(
            Builder(ViewerServiceAdaptorFactory).build({
              instances: ImmutableList([toDTO(service, 1)]),
              onTerminate,
            })
          );

          const result = await repository.terminate(service.identifier);

          expect(result.isOk()).toBeTruthy();

          expect(terminated.size()).toBe(1);

          expect(terminated.contains(toDTO(service, 1))).toBeTruthy();
        });
      });

      describe('unsuccessfully', () => {
        it('should returns ErrorResult when the service to be terminated does not exist', async () => {
          const service = Builder(ViewerServiceFactory).build();

          const repository = ACLViewerServiceRepository(
            Builder(ViewerServiceAdaptorFactory).build()
          );

          const result = await repository.terminate(service.identifier);

          expect(result.isErr()).toBeTruthy();
          expect(result._unsafeUnwrapErr().type).toBe('not-found');
        });
      });
    });
  });
});
