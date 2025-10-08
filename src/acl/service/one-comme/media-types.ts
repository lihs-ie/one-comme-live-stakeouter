import { ok, Result } from 'neverthrow';

import { toJSONError, ToJSONError } from 'aspects/error';

import { ImmutableList } from 'domains/common/collections';

import { BaseReader, BaseWriter } from '../common';
import { ServiceDTO } from './translator';

export type RawMedia = {
  id: string;
  name: string;
  url: string;
  speech: boolean;
  write: boolean;
  enabled: boolean;
  color: { r: number; g: number; b: number };
  options: { outputLogs?: boolean; version: number; platform: string };
};

export type Media = {
  id: string;
  name: string;
  url: string;
  speech: boolean;
  write: boolean;
  enabled: boolean;
  color: { red: number; green: number; blue: number };
  options: { outputLogs: boolean; version: number; platform: string };
};

export const Reader: BaseReader<Media> = {
  read: (payload: string): Result<Media, ToJSONError> =>
    Result.fromThrowable(
      () => JSON.parse(payload) as RawMedia,
      () => toJSONError(payload)
    )().andThen(raw =>
      ok({
        ...raw,
        color: { red: raw.color.r, green: raw.color.g, blue: raw.color.b },
      } as Media)
    ),
  readEntries: (payload: string): Result<ImmutableList<Media>, ToJSONError> =>
    Result.fromThrowable(
      () => JSON.parse(payload) as RawMedia[],
      () => toJSONError(payload)
    )().andThen<Result<ImmutableList<Media>, ToJSONError>>(raws =>
      ok(
        ImmutableList.fromArray(
          raws.map(
            (raw): Media =>
              ({
                ...raw,
                color: { red: raw.color.r, green: raw.color.g, blue: raw.color.b },
              }) as Media
          )
        )
      )
    ),
};

type Body = {
  id: string;
  name: string;
  url: string;
  speech: boolean;
  write: boolean;
  enabled: boolean;
  color: { r: number; g: number; b: number };
  options: {
    outputLogs: boolean;
    version: number;
    platform: string;
  };
  keyword: string;
};

export const Writer: BaseWriter<ServiceDTO> = {
  write: (input: ServiceDTO): string => {
    return JSON.stringify({
      id: input.id,
      name: input.name,
      url: input.url,
      speech: input.speech,
      write: input.write,
      enabled: input.enabled,
      color: { r: input.color.red, g: input.color.green, b: input.color.blue },
      options: {
        outputLogs: input.options.outputLogs,
        version: input.version,
        platform: input.platform,
      },
      keyword: input.name,
    } as Body);
  },
};
