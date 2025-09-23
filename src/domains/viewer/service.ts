import { ResultAsync } from 'neverthrow';
import { z } from 'zod';

import { CommonError } from 'aspects/error';
import { createFunctionSchema, functionSchemaReturning } from 'aspects/type';

import { ImmutableList } from 'domains/common/collections';

import { createEvent, eventSchema } from '../common/event';
import { uuidV4BasedIdentifierSchema } from '../common/identifier';
import { platformTypeSchema } from '../common/platform';
import { URL, urlSchema } from '../common/uri';
import { ValueObject, valueObjectSchema } from '../common/value-object';
import { liveStreamIdentifierSchema } from '../streaming/common';

export const serviceIdentifierSchema = uuidV4BasedIdentifierSchema
  .extend({
    platform: platformTypeSchema,
  })
  .brand('ServiceIdentifier');

export type ServiceIdentifier = ValueObject<z.infer<typeof serviceIdentifierSchema>>;

export const ServiceIdentifier = ValueObject<ServiceIdentifier>(serviceIdentifierSchema);

export const rgbSchema = valueObjectSchema
  .extend({
    red: z.number().min(0).max(255),
    green: z.number().min(0).max(255),
    blue: z.number().min(0).max(255),
  })
  .brand('RGB');

export type RGB = ValueObject<z.infer<typeof rgbSchema>>;

export const RGB = ValueObject<RGB>(rgbSchema);

export const serviceOptionsSchema = valueObjectSchema
  .extend({
    outputLog: z.boolean(),
  })
  .brand('ServiceOptions');

export type ServiceOptions = ValueObject<z.infer<typeof serviceOptionsSchema>>;

export const ServiceOptions = ValueObject<ServiceOptions>(serviceOptionsSchema);

export const serviceMetaSchema = valueObjectSchema
  .extend({
    title: z.string().min(1).max(255).nullable(),
    url: urlSchema.nullable(),
    isLive: z.boolean().nullable(),
    isReconnecting: z.boolean().nullable(),
    startTime: z.number().int().min(0).nullable(),
    viewer: z.number().int().min(0).nullable(),
    total: z.number().int().min(0).nullable(),
    loggedIn: z.boolean().nullable(),
    loggedName: z.string().min(1).max(255).nullable(),
  })
  .brand('ServiceMeta');

export type ServiceMeta = ValueObject<z.infer<typeof serviceMetaSchema>>;

export const ServiceMeta = ValueObject<ServiceMeta>(serviceMetaSchema);

export const viewerServiceSnapshotSchema = valueObjectSchema
  .extend({
    identifier: serviceIdentifierSchema,
    name: z.string().min(1).max(100),
    url: urlSchema,
    enabled: z.boolean(),
    speech: z.boolean(),
    color: rgbSchema,
    write: z.boolean(),
    options: serviceOptionsSchema,
  })
  .brand('ViewerServiceSnapshot');

export type ViewerServiceSnapshot = ValueObject<z.infer<typeof viewerServiceSnapshotSchema>>;

export const ViewerServiceSnapshot = ValueObject<ViewerServiceSnapshot>(
  viewerServiceSnapshotSchema
);

const viewerBaseSchema = z.object({
  identifier: serviceIdentifierSchema,
  name: z.string().min(1).max(100),
  url: urlSchema,
  enabled: z.boolean(),
  speech: z.boolean(),
  color: rgbSchema,
  write: z.boolean(),
  options: serviceOptionsSchema,
  snapshot: createFunctionSchema(z.function({ input: [], output: viewerServiceSnapshotSchema })),
});

export interface ViewerServiceProperties extends z.infer<typeof viewerBaseSchema> {
  enable: () => ViewerServiceProperties;
  disable: () => ViewerServiceProperties;
}

export const viewerServiceSchema: z.ZodType<ViewerServiceProperties> = viewerBaseSchema
  .extend({
    enable: functionSchemaReturning(z.lazy(() => viewerServiceSchema)),
    disable: functionSchemaReturning(z.lazy(() => viewerServiceSchema)),
  })
  .brand('ViewerService');

export type ViewerService = z.infer<typeof viewerServiceSchema>;

export const ViewerService = (properties: {
  identifier: ServiceIdentifier;
  name: string;
  url: URL;
  enabled: boolean;
  speech: boolean;
  color: RGB;
  write: boolean;
  options: ServiceOptions;
}) => {
  const snapshot =
    (candidates: {
      identifier: ServiceIdentifier;
      name: string;
      url: URL;
      enabled: boolean;
      speech: boolean;
      color: RGB;
      write: boolean;
      options: ServiceOptions;
    }) =>
    (): ViewerServiceSnapshot =>
      ViewerServiceSnapshot(candidates);

  const enable = (enabled: boolean): ViewerService =>
    viewerServiceSchema.parse({
      identifier: properties.identifier,
      name: properties.name,
      url: properties.url,
      color: properties.color,
      speech: properties.speech,
      write: properties.write,
      options: properties.options,
      enabled,
      enable: () => enable(true),
      disable: () => disable(false),
      snapshot: snapshot({
        identifier: properties.identifier,
        name: properties.name,
        url: properties.url,
        color: properties.color,
        speech: properties.speech,
        write: properties.write,
        options: properties.options,
        enabled,
      }),
    });

  const disable = (enabled: boolean): ViewerService =>
    viewerServiceSchema.parse({
      identifier: properties.identifier,
      name: properties.name,
      url: properties.url,
      color: properties.color,
      speech: properties.speech,
      write: properties.write,
      options: properties.options,
      enabled,
      enable: () => enable(true),
      disable: () => disable(false),
      snapshot: snapshot({
        identifier: properties.identifier,
        name: properties.name,
        url: properties.url,
        color: properties.color,
        speech: properties.speech,
        write: properties.write,
        options: properties.options,
        enabled,
      }),
    });

  return viewerServiceSchema.parse({
    ...properties,
    enable: () => enable(true),
    disable: () => disable(false),
    snapshot: snapshot(properties),
  });
};

export const serviceCreatedEventSchema = eventSchema(z.literal('ServiceCreated'))
  .extend({
    service: serviceIdentifierSchema,
    stream: liveStreamIdentifierSchema,
  })
  .brand('ServiceCreatedEvent');

export type ServiceCreated = z.infer<typeof serviceCreatedEventSchema>;

export const ServiceCreated = createEvent<ServiceCreated>(
  serviceCreatedEventSchema,
  'ServiceCreated'
);

export const serviceUpdatedEventSchema = eventSchema(z.literal('ServiceUpdated'))
  .extend({
    before: viewerServiceSnapshotSchema,
  })
  .brand('ServiceUpdatedEvent');

export type ServiceUpdated = z.infer<typeof serviceUpdatedEventSchema>;

export const ServiceUpdated = createEvent<ServiceUpdated>(
  serviceUpdatedEventSchema,
  'ServiceUpdated'
);

export interface ViewerServiceRepository {
  find: (identifier: ServiceIdentifier) => ResultAsync<ViewerService, CommonError>;
  search: () => ResultAsync<ImmutableList<ViewerService>, CommonError>;
  persist: (service: ViewerService) => ResultAsync<void, CommonError>;
  terminate: (identifier: ServiceIdentifier) => ResultAsync<void, CommonError>;
}
