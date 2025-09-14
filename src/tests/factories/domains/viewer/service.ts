import { ImmutableDate } from 'domains/common/date';
import { URL } from 'domains/common/uri';
import { LiveStreamIdentifier } from 'domains/streaming';
import {
  RGB,
  ServiceCreated,
  ServiceIdentifier,
  ServiceMeta,
  ServiceOptions,
  ViewerService,
} from 'domains/viewer';

import { Builder, Factory, StringFactory } from 'tests/factories/builder';
import { uuidV4FromSeed } from 'tests/helpers';

import { ImmutableDateFactory } from '../common/date';
import { URLFactory } from '../common/uri';
import { LiveStreamIdentifierFactory } from '../streaming';

export type ServiceIdentifierProperties = {
  value: string;
};

export const ServiceIdentifierFactory = Factory<ServiceIdentifier, ServiceIdentifierProperties>({
  instantiate: properties => ServiceIdentifier(properties),
  prepare: (overrides, seed) => ({
    value: overrides.value ?? uuidV4FromSeed(seed),
  }),
  retrieve: properties => ({
    value: properties.value,
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
};

export const ServiceMetaFactory = Factory<ServiceMeta, ServiceMetaProperties>({
  instantiate: properties => ServiceMeta(properties),
  prepare: (overrides, seed) => ({
    title: overrides.title ?? Builder(StringFactory(1, 255)).buildWith(seed),
    url: overrides.url ?? (seed % 2 === 0 ? Builder(URLFactory).buildWith(seed) : null),
    isLive: overrides.isLive ?? (seed % 3 === 0 ? true : seed % 3 === 1 ? false : null),
    isReconnecting:
      overrides.isReconnecting ?? (seed % 3 === 0 ? true : seed % 3 === 1 ? false : null),
  }),
  retrieve: properties => ({
    title: properties.title,
    url: properties.url,
    isLive: properties.isLive,
    isReconnecting: properties.isReconnecting,
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
