import { okAsync, ResultAsync } from 'neverthrow';

import { RouteError, ToJSONError, ValidationError } from 'aspects/error';
import { HttpClient, mapHttpClientError } from 'aspects/http';

import { ImmutableList } from 'domains/common/collections';

import { BaseReader, BaseTranslator, BaseWriter } from '../common';
import { Media } from './media-types';
import { ServiceDTO } from './translator';

export interface ViewerServiceAdaptor {
  find: (id: string) => ResultAsync<ServiceDTO, RouteError | ToJSONError | ValidationError>;
  search: () => ResultAsync<ImmutableList<ServiceDTO>, RouteError | ToJSONError | ValidationError>;
  persist: (service: ServiceDTO) => ResultAsync<void, RouteError>;
  terminate: (id: string) => ResultAsync<void, RouteError>;
}

export const ViewerServiceAdaptor = (
  http: HttpClient,
  reader: BaseReader<Media>,
  writer: BaseWriter<ServiceDTO>,
  translator: BaseTranslator<Media, ImmutableList<Media>, ServiceDTO>
): ViewerServiceAdaptor => {
  return {
    find: (id: string) =>
      http
        .get(`services/${id}`)
        .mapErr<RouteError>(error => mapHttpClientError(error))
        .andThen(response => reader.read(response.bodyText))
        .andThen(media => okAsync(translator.translate(media))),
    search: () =>
      http
        .get('services')
        .mapErr<RouteError>(error => mapHttpClientError(error))
        .andThen(response => reader.readEntries(response.bodyText))
        .andThen(medias => okAsync(translator.translateEntries(medias))),
    persist: (service: ServiceDTO) =>
      http
        .request(service.version === 1 ? 'POST' : 'PUT', 'services', {
          body: writer.write(service),
        })
        .mapErr(error => mapHttpClientError(error))
        .andThen(() => okAsync()),
    terminate: (id: string) =>
      http
        .del(`services/${id}`)
        .mapErr(error => mapHttpClientError(error))
        .andThen(() => okAsync()),
  };
};
