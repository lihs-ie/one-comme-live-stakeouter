import { errAsync, okAsync } from 'neverthrow';

import { BaseReader, BaseTranslator, BaseWriter } from 'acl/service/common';
import {
  Media,
  Reader,
  ServiceDTO,
  Translator,
  ViewerServiceAdaptor,
  Writer,
} from 'acl/service/one-comme';
import { notFound } from 'aspects/error';
import { HttpClient } from 'aspects/http';

import { ImmutableList, ImmutableMap } from 'domains/common/collections';

import { Factory } from 'tests/factories/builder';

export type ViewerServiceAdaptorProperties = {
  http: HttpClient;
  reader: BaseReader<Media>;
  writer: BaseWriter<ServiceDTO>;
  translator: BaseTranslator<Media, ImmutableList<Media>, ServiceDTO>;
  instances: ImmutableList<ServiceDTO>;
  onPersist?: (service: ServiceDTO) => void;
  onTerminate?: (service: ServiceDTO) => void;
};

export const ViewerServiceAdaptorFactory = Factory<
  ViewerServiceAdaptor,
  ViewerServiceAdaptorProperties
>({
  instantiate: properties => {
    let instances = ImmutableMap.fromArray(
      properties.instances
        .map((instance): [string, ServiceDTO] => [instance.id, instance])
        .toArray()
    );

    return {
      find: (id: string) =>
        instances.get(id).ifPresentOrElse(
          instance => okAsync(instance),
          () => errAsync(notFound(id))
        ),
      search: () => okAsync(ImmutableList.fromArray(instances.values())),
      persist: (service: ServiceDTO) => {
        return instances.get(service.id).ifPresentOrElse(
          instance => {
            if (service.version - instance.version !== 1) {
              return errAsync({ type: 'conflict', context: service.id });
            }

            instances = instances.add(service.id, service);

            properties.onPersist?.(service);

            return okAsync();
          },
          () => {
            if (service.version !== 1) {
              return errAsync({ type: 'conflict', context: service.id });
            }

            instances = instances.add(service.id, service);

            properties.onPersist?.(service);

            return okAsync();
          }
        );
      },
      terminate: (id: string) =>
        instances.get(id).ifPresentOrElse(
          instance => {
            instances = instances.remove(id);

            properties.onTerminate?.(instance);

            return okAsync();
          },
          () => errAsync(notFound(id))
        ),
    };
  },
  prepare: (overrides, _) => ({
    http: overrides.http ?? HttpClient(),
    reader: overrides.reader ?? Reader,
    writer: overrides.writer ?? Writer,
    translator: overrides.translator ?? Translator,
    instances: overrides.instances ?? ImmutableList.empty<ServiceDTO>(),
    onPersist: overrides.onPersist,
    onTerminate: overrides.onTerminate,
  }),
  retrieve: _ => {
    throw new Error('Adaptor cannot be retrieved.');
  },
});
