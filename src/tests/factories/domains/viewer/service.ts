import { errAsync, okAsync } from 'neverthrow';

import { CommonError, conflict, AggregateNotFoundError } from 'aspects/error';

import { ImmutableList, ImmutableMap } from 'domains/common/collections';
import { ImmutableDate } from 'domains/common/date';
import { PlatformType } from 'domains/common/platform';
import { URL } from 'domains/common/uri';
import { LiveStreamIdentifier } from 'domains/streaming';
import {
  RGB,
  ServiceCreated,
  ServiceIdentifier,
  ServiceMeta,
  ServiceOptions,
  ViewerService,
  ViewerServiceRepository,
  ViewerServiceSnapshot,
} from 'domains/viewer';

import { Builder, Factory, StringFactory } from 'tests/factories/builder';
import { uuidV4FromSeed } from 'tests/helpers';

import { ImmutableDateFactory } from '../common/date';
import { PlatformTypeFactory } from '../common/platform';
import { URLFactory } from '../common/uri';
import { LiveStreamIdentifierFactory } from '../streaming';

export type ServiceIdentifierProperties = {
  value: string;
  platform: PlatformType;
};

export const ServiceIdentifierFactory = Factory<ServiceIdentifier, ServiceIdentifierProperties>({
  instantiate: properties => ServiceIdentifier(properties),
  prepare: (overrides, seed) => ({
    value: overrides.value ?? uuidV4FromSeed(seed),
    platform: overrides.platform ?? Builder(PlatformTypeFactory).buildWith(seed),
  }),
  retrieve: properties => ({
    value: properties.value,
    platform: properties.platform,
  }),
});

export type RGBProperties = {
  red: number;
  green: number;
  blue: number;
};

export const RGBFactory = Factory<RGB, RGBProperties>({
  instantiate: properties => RGB(properties),
  prepare: (overrides, seed) => ({
    red: overrides.red ?? seed % 256,
    green: overrides.green ?? (seed + 85) % 256,
    blue: overrides.blue ?? (seed + 170) % 256,
  }),
  retrieve: properties => ({
    red: properties.red,
    green: properties.green,
    blue: properties.blue,
  }),
});

export type ServiceOptionsProperties = {
  outputLog: boolean;
};

export const ServiceOptionsFactory = Factory<ServiceOptions, ServiceOptionsProperties>({
  instantiate: properties => ServiceOptions(properties),
  prepare: (overrides, seed) => ({
    outputLog: overrides.outputLog ?? seed % 2 === 0,
  }),
  retrieve: properties => ({
    outputLog: properties.outputLog,
  }),
});

export type ServiceMetaProperties = {
  title: string | null;
  url: URL | null;
  isLive: boolean | null;
  isReconnecting: boolean | null;
  startTime: number | null;
  viewer: number | null;
  total: number | null;
  loggedIn: boolean | null;
  loggedName: string | null;
};

export const ServiceMetaFactory = Factory<ServiceMeta, ServiceMetaProperties>({
  instantiate: properties => ServiceMeta(properties),
  prepare: (overrides, seed) => ({
    title: overrides.title ?? Builder(StringFactory(1, 255)).buildWith(seed),
    url: overrides.url ?? (seed % 2 === 0 ? Builder(URLFactory).buildWith(seed) : null),
    isLive: overrides.isLive ?? (seed % 3 === 0 ? true : seed % 3 === 1 ? false : null),
    isReconnecting:
      overrides.isReconnecting ?? (seed % 3 === 0 ? true : seed % 3 === 1 ? false : null),
    startTime: overrides.startTime ?? (seed % 2 === 0 ? seed * 1000 : null),
    viewer: overrides.viewer ?? (seed % 2 === 0 ? seed : null),
    total: overrides.total ?? (seed % 2 === 0 ? seed * 10 : null),
    loggedIn: overrides.loggedIn ?? (seed % 2 === 0 ? true : null),
    loggedName:
      overrides.loggedName ??
      (seed % 2 === 0 ? Builder(StringFactory(1, 32)).buildWith(seed) : null),
  }),
  retrieve: properties => ({
    title: properties.title,
    url: properties.url,
    isLive: properties.isLive,
    isReconnecting: properties.isReconnecting,
    startTime: properties.startTime,
    viewer: properties.viewer,
    total: properties.total,
    loggedIn: properties.loggedIn,
    loggedName: properties.loggedName,
  }),
});

export type ViewerServiceSnapshotProperties = {
  identifier: ServiceIdentifier;
  name: string;
  url: URL;
  enabled: boolean;
  speech: boolean;
  color: RGB;
  write: boolean;
  options: ServiceOptions;
};

export const ViewerServiceSnapshotFactory = Factory<
  ViewerServiceSnapshot,
  ViewerServiceSnapshotProperties
>({
  instantiate: properties => ViewerServiceSnapshot(properties),
  prepare: (overrides, seed) => ({
    identifier: overrides.identifier ?? Builder(ServiceIdentifierFactory).buildWith(seed),
    name: overrides.name ?? Builder(StringFactory(1, 100)).buildWith(seed),
    url: overrides.url ?? Builder(URLFactory).buildWith(seed),
    enabled: overrides.enabled ?? seed % 2 === 0,
    speech: overrides.speech ?? seed % 2 === 0,
    color: overrides.color ?? Builder(RGBFactory).buildWith(seed),
    write: overrides.write ?? seed % 2 === 0,
    options: overrides.options ?? Builder(ServiceOptionsFactory).buildWith(seed),
  }),
  retrieve: instance => ({
    identifier: instance.identifier,
    name: instance.name,
    url: instance.url,
    enabled: instance.enabled,
    speech: instance.speech,
    color: instance.color,
    write: instance.write,
    options: instance.options,
  }),
});

export type ViewerServiceProperties = {
  identifier: ServiceIdentifier;
  name: string;
  url: URL;
  enabled: boolean;
  speech: boolean;
  color: RGB;
  write: boolean;
  options: ServiceOptions;
};

export const ViewerServiceFactory = Factory<ViewerService, ViewerServiceProperties>({
  instantiate: properties => ViewerService(properties),
  prepare: (overrides, seed) => ({
    identifier: overrides.identifier ?? Builder(ServiceIdentifierFactory).buildWith(seed),
    name: overrides.name ?? Builder(StringFactory(1, 100)).buildWith(seed),
    url: overrides.url ?? Builder(URLFactory).buildWith(seed),
    enabled: overrides.enabled ?? seed % 2 === 0,
    speech: overrides.speech ?? seed % 2 === 0,
    color: overrides.color ?? Builder(RGBFactory).buildWith(seed),
    write: overrides.write ?? seed % 2 === 0,
    options: overrides.options ?? Builder(ServiceOptionsFactory).buildWith(seed),
  }),
  retrieve: instance => ({
    identifier: instance.identifier,
    name: instance.name,
    url: instance.url,
    enabled: instance.enabled,
    speech: instance.speech,
    color: instance.color,
    write: instance.write,
    options: instance.options,
  }),
});

export type ServiceCreatedProperties = {
  identifier: string;
  occurredAt: ImmutableDate;
  service: ServiceIdentifier;
  stream: LiveStreamIdentifier;
};

export const ServiceCreatedFactory = Factory<ServiceCreated, ServiceCreatedProperties>({
  instantiate: properties => ServiceCreated(properties),
  prepare: (overrides, seed) => ({
    identifier: overrides.identifier ?? uuidV4FromSeed(seed),
    occurredAt: overrides.occurredAt ?? Builder(ImmutableDateFactory).buildWith(seed),
    service: overrides.service ?? Builder(ServiceIdentifierFactory).buildWith(seed),
    stream: overrides.stream ?? Builder(LiveStreamIdentifierFactory).buildWith(seed),
  }),
  retrieve: instance => ({
    identifier: instance.identifier,
    occurredAt: instance.occurredAt,
    service: instance.service,
    stream: instance.stream,
  }),
});

export type ViewerServiceRepositoryProperties = {
  instances: ImmutableList<ViewerService>;
  links?: ImmutableMap<LiveStreamIdentifier, ServiceIdentifier>;
  onPersist?: (instance: ViewerService) => void;
  onTerminate?: (instance: ViewerService) => void;
};

export const ViewerServiceRepositoryFactory = Factory<
  ViewerServiceRepository,
  ViewerServiceRepositoryProperties
>({
  instantiate: properties => {
    let services: ImmutableMap<ServiceIdentifier, ViewerService> = ImmutableMap.fromArray(
      properties.instances
        .map((instance): [ServiceIdentifier, ViewerService] => [instance.identifier, instance])
        .toArray()
    );

    let links: ImmutableMap<LiveStreamIdentifier, ServiceIdentifier> =
      properties.links ?? ImmutableMap.empty();

    return {
      next: (platform: PlatformType) => {
        let identifier = Builder(ServiceIdentifierFactory).build({ platform });

        while (services.contains(identifier)) {
          identifier = Builder(ServiceIdentifierFactory).build({ platform });
        }

        return okAsync(identifier);
      },
      find: (identifier: ServiceIdentifier) =>
        services.get(identifier).ifPresentOrElse(
          instance => okAsync<ViewerService, AggregateNotFoundError<ServiceIdentifier>>(instance),
          () =>
            errAsync<ViewerService, AggregateNotFoundError<ServiceIdentifier>>({
              type: 'aggregate-not-found',
              context: JSON.stringify(identifier),
              identifier,
            })
        ),
      search: () => okAsync(ImmutableList.fromArray(services.values())),
      persist: (instance: ViewerService) =>
        services.get(instance.identifier).ifPresentOrElse(
          _ => errAsync<void, CommonError>(conflict(JSON.stringify(instance))),
          () => {
            services = services.add(instance.identifier, instance);
            properties.onPersist?.(instance);
            return okAsync<void, CommonError>();
          }
        ),
      terminate: (identifier: ServiceIdentifier) =>
        services.get(identifier).ifPresentOrElse(
          instance => {
            services = services.remove(identifier);
            links = links.filter((_, sid) => !sid.equals(identifier));
            properties.onTerminate?.(instance);
            return okAsync<void, AggregateNotFoundError<ServiceIdentifier>>();
          },
          () =>
            errAsync<void, AggregateNotFoundError<ServiceIdentifier>>({
              type: 'aggregate-not-found',
              context: JSON.stringify(identifier),
              identifier,
            })
        ),
    };
  },
  prepare: (overrides, seed) => ({
    instances: Builder(ViewerServiceFactory).buildListWith(5, seed),
    ...overrides,
  }),
  retrieve: _ => {
    throw new Error('Repository cannot be retrieved.');
  },
});

expect.extend({
  toBeSameViewerService(actual: ViewerService, expected: ViewerService) {
    expect(actual.identifier).toEqualValueObject(expected.identifier);
    expect(actual.name).toBe(expected.name);
    expect(actual.url).toEqualValueObject(expected.url);
    expect(actual.enabled).toBe(expected.enabled);
    expect(actual.speech).toBe(expected.speech);
    expect(actual.color).toEqualValueObject(expected.color);
    expect(actual.write).toBe(expected.write);
    expect(actual.options).toEqualValueObject(expected.options);

    return {
      message: () => 'OK',
      pass: true,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSameViewerService(expected: ViewerService): R;
    }
  }
}
