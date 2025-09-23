import { ImmutableList } from 'domains/common/collections';

import { BaseTranslator } from '../common';
import { Media } from './media-types';

export type ServiceDTO = {
  id: string;
  name: string;
  url: string;
  speech: boolean;
  write: boolean;
  enabled: boolean;
  color: {
    red: number;
    green: number;
    blue: number;
  };
  options: {
    outputLogs: boolean;
  };
  platform: string;
  version: number;
};

export const Translator: BaseTranslator<Media, ImmutableList<Media>, ServiceDTO> = {
  translate: (media: Media): ServiceDTO => ({
    id: media.id,
    name: media.name,
    url: media.url,
    speech: media.speech,
    write: media.write,
    enabled: media.enabled,
    color: {
      red: media.color.red,
      green: media.color.green,
      blue: media.color.blue,
    },
    options: {
      outputLogs: media.options.outputLogs,
    },
    platform: media.options.platform,
    version: media.options.version,
  }),
  translateEntries: (medias: ImmutableList<Media>) =>
    medias.map(media => Translator.translate(media)),
};
