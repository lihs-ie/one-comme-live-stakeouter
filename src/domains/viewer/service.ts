import { ResultAsync } from 'neverthrow';
import { z } from 'zod';

import { CommonError, NotFoundError } from 'aspects/error';
import { functionSchemaReturning } from 'aspects/type';

import { createEvent, eventSchema } from '../common/event';
import { stringBasedIdentifierSchema } from '../common/identifier';
import { URL, urlSchema } from '../common/uri';
import { ValueObject, valueObjectSchema } from '../common/value-object';
import { LiveStreamIdentifier, liveStreamIdentifierSchema } from '../streaming/common';

export const serviceIdentifierSchema = stringBasedIdentifierSchema(1, 64).brand(
  'ServiceIdentifier'
);

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

const viewerBaseSchema = z.object({
  identifier: serviceIdentifierSchema,
  name: z.string().min(1).max(100),
  url: urlSchema,
  enabled: z.boolean(),
  speech: z.boolean(),
  color: rgbSchema,
  write: z.boolean(),
  options: serviceOptionsSchema,
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
  const enable = (enabled: boolean): ViewerService =>
    viewerServiceSchema.parse({
      ...properties,
      enabled,
      enable: () => enable(true),
      disable: () => disable(false),
    });

  const disable = (enabled: boolean): ViewerService =>
    viewerServiceSchema.parse({
      ...properties,
      enabled,
      enable: () => enable(true),
      disable: () => disable(false),
    });

  return viewerServiceSchema.parse({
    ...properties,
    enable: () => enable(true),
    disable: () => disable(false),
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

export interface ViewerServiceRepository {
  find: (identifier: ServiceIdentifier) => ResultAsync<ViewerService, NotFoundError>;
  findByStream: (stream: LiveStreamIdentifier) => ResultAsync<ViewerService, NotFoundError>;
  persist: (service: ViewerService) => ResultAsync<void, CommonError>;
  terminate: (identifier: ServiceIdentifier) => ResultAsync<void, NotFoundError>;
}
