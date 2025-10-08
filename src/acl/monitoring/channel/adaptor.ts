import { okAsync, ResultAsync } from 'neverthrow';

import { CommonError } from 'aspects/error';
import { HttpClient, mapHttpClientError } from 'aspects/http';

import { ImmutableList } from 'domains/common/collections';
import { Channel, ChannelIdentifier } from 'domains/monitoring';

import { BaseReader, BaseTranslator, BaseWriter } from '../common';
import { EntriesMedia, EntryMedia } from './media-types';

export interface ChannelAdaptor {
  find: (identifier: ChannelIdentifier) => ResultAsync<Channel, CommonError>;
  search: () => ResultAsync<ImmutableList<Channel>, CommonError>;
  persist: (channel: Channel) => ResultAsync<void, CommonError>;
  terminate: (identifier: ChannelIdentifier) => ResultAsync<void, CommonError>;
}

export const ChannelAdaptor = (
  http: HttpClient,
  reader: BaseReader<EntryMedia, EntriesMedia>,
  writer: BaseWriter<Channel>,
  translator: BaseTranslator<EntryMedia, Channel, EntriesMedia>
): ChannelAdaptor => {
  const find: ChannelAdaptor['find'] = (
    identifier: ChannelIdentifier
  ): ResultAsync<Channel, CommonError> =>
    http
      .get('', {
        query: { resource: `platforms/${identifier.platform}/channels/${identifier.value}` },
      })
      .mapErr(mapHttpClientError)
      .andThen(response => reader.read(response.bodyText))
      .andThen(media => translator.translate(media));

  const search: ChannelAdaptor['search'] = (): ResultAsync<ImmutableList<Channel>, CommonError> =>
    http
      .get('', { query: { resource: 'channels' } })
      .mapErr(mapHttpClientError)
      .andThen(response => reader.readEntries(response.bodyText))
      .andThen(medias => translator.translateEntries(medias));

  const persist: ChannelAdaptor['persist'] = (channel: Channel): ResultAsync<void, CommonError> =>
    http
      .post('', {
        body: writer.write(channel),
        query: { resource: `platforms/${channel.identifier.platform}/channels` },
      })
      .mapErr(error => mapHttpClientError(error))
      .andThen(() => okAsync());

  const terminate: ChannelAdaptor['terminate'] = (
    identifier: ChannelIdentifier
  ): ResultAsync<void, CommonError> =>
    http
      .del(``, {
        query: { resource: `platforms/${identifier.platform}/channels/${identifier.value}` },
      })
      .mapErr(error => mapHttpClientError(error))
      .andThen(() => okAsync());

  return {
    find,
    search,
    persist,
    terminate,
  };
};
