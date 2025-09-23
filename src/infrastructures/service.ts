import { err, ok, Result, ResultAsync } from 'neverthrow';

import { ServiceDTO, ViewerServiceAdaptor } from 'acl/service/one-comme';
import { CommonError, ValidationError, validationError } from 'aspects/error';

import { ImmutableList, ImmutableMap } from 'domains/common/collections';
import { PlatformType } from 'domains/common/platform';
import { URL } from 'domains/common/uri';
import {
  RGB,
  ServiceIdentifier,
  ServiceOptions,
  ViewerService,
  ViewerServiceRepository,
} from 'domains/viewer';

import { Version } from './common';

export const ACLViewerServiceRepository = (
  adaptor: ViewerServiceAdaptor
): ViewerServiceRepository => {
  let versions = ImmutableMap.empty<ServiceIdentifier, Version>();
  let initialization: ResultAsync<void, CommonError> | null = null;

  const ensureInitialized = () => {
    if (initialization !== null) {
      return initialization;
    }

    initialization = adaptor
      .search()
      .andThen(dtos => Result.combine(dtos.map(dto => restore(dto)).toArray()))
      .map(results => {
        results.forEach(([service, version]) => {
          versions = versions.add(service.identifier, version);
        });
      });

    return initialization;
  };

  const restore = (dto: ServiceDTO): Result<[ViewerService, Version], ValidationError> => {
    const platformType = ((): Result<PlatformType, ValidationError> => {
      switch (dto.platform) {
        case 'youtube':
          return ok(PlatformType.YOUTUBE);
        case 'niconico':
          return ok(PlatformType.NICONICO);
        case 'twitch':
          return ok(PlatformType.TWITCH);
        default:
          return err<PlatformType, ValidationError>({
            type: 'validation-error',
            context: `Unknown platform: ${dto.platform}`,
          });
      }
    })();

    return platformType.andThen(type =>
      Result.fromThrowable(
        (): [ViewerService, Version] => {
          const service = ViewerService({
            identifier: ServiceIdentifier({ value: dto.id, platform: type }),
            name: dto.name,
            url: URL({ value: dto.url }),
            enabled: dto.enabled,
            speech: dto.speech,
            color: RGB({ red: dto.color.red, green: dto.color.green, blue: dto.color.blue }),
            write: dto.write,
            options: ServiceOptions({ outputLog: dto.options.outputLogs }),
          });

          return [service, Version(dto.version)];
        },
        error => validationError((error as Error).message)
      )()
    );
  };

  const find: ViewerServiceRepository['find'] = (identifier: ServiceIdentifier) => {
    return ensureInitialized()
      .andThen(() => {
        return adaptor.find(identifier.value);
      })
      .andThen(dto => restore(dto))
      .andThen(([service]) => ok(service));
  };

  const search: ViewerServiceRepository['search'] = () =>
    ensureInitialized()
      .andThen(() => adaptor.search())
      .andThen(dtos => Result.combine(dtos.map(dto => restore(dto)).toArray()))
      .andThen(results => {
        const services = results.map(([service, version]) => {
          versions = versions.add(service.identifier, version);

          return service;
        });

        return ok(ImmutableList.fromArray(services));
      });

  const persist: ViewerServiceRepository['persist'] = service =>
    ensureInitialized().andThen(() => {
      const nextVersion = versions
        .get(service.identifier)
        .map(current => current.auto())
        .orElse(Version());

      return adaptor
        .persist({
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
          version: nextVersion.value,
        })
        .map(() => {
          versions = versions.add(service.identifier, nextVersion);
        });
    });

  const terminate: ViewerServiceRepository['terminate'] = identifier =>
    ensureInitialized()
      .andThen(() => adaptor.terminate(identifier.value))
      .map(() => {
        versions = versions.remove(identifier);
      });

  // initialize versions cache

  return {
    find,
    search,
    persist,
    terminate,
  };
};
