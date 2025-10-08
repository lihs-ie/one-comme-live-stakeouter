import { ok, Result } from 'neverthrow';

import { RawEntryMedia } from 'acl/monitoring/channel';
import { toJSONError } from 'aspects/error';
import { HttpMethod } from 'aspects/http';
import {
  CreateChannelWorkflow,
  FindChannelWorkflow,
  MonitoringChannelWorkflow,
  TerminateChannelWorkflow,
  UpdateChannelWorkflow,
} from 'providers/plugin';

import { platformTypeSchema } from 'domains/common/platform';
import { ResultValueObject } from 'domains/common/value-object';
import { Channel, ChannelIdentifier } from 'domains/monitoring';

import { Handler, mapErrorResponse, PluginRequest, PluginResponse } from './common';

const encode = (channel: Channel): RawEntryMedia['response'] => ({
  identifier: {
    value: channel.identifier.value,
    platform: channel.identifier.platform,
  },
  setting: {
    isMonitoring: channel.setting.isMonitoring,
    checkInterval: channel.setting.checkInterval,
  },
  lastCheckedAt: channel.lastCheckedAt?.toISOString() ?? null,
  timestamp: {
    createdAt: channel.timestamp.createdAt.toISOString(),
    updatedAt: channel.timestamp.updatedAt.toISOString(),
  },
});

export const FindHandler: Handler<{
  resource: `platforms/${string}/channels/${string}`;
}> = Handler<{
  resource: `platforms/${string}/channels/${string}`;
}>('platforms/{platform}/channels/{identifier}', HttpMethod.GET, async request => {
  const [_, platform, identifier] =
    request.params.resource.match(/^platforms\/(.+)\/channels\/(.+)$/) ?? [];

  return ResultValueObject<ChannelIdentifier>(ChannelIdentifier)({
    value: identifier!,
    platform: platformTypeSchema.parse(platform),
  })
    .asyncAndThen(identifier => FindChannelWorkflow()({ identifier }))
    .match<PluginResponse>(
      channel => ({
        code: 200,
        response: encode(channel),
      }),
      error => mapErrorResponse(error)
    );
});

export const SearchHandler: Handler<{ resource: 'channels' }> = Handler<{ resource: 'channels' }>(
  'channels',
  HttpMethod.GET,
  async (_: PluginRequest) =>
    MonitoringChannelWorkflow().match<PluginResponse>(
      channels => ({
        code: 200,
        response: { channels: channels.map(encode).toArray() },
      }),
      error => mapErrorResponse(error)
    )
);

export const CreateHandler: Handler<{
  resource: `platforms/${string}/channels`;
  identifier: string;
}> = Handler<{ resource: `platforms/${string}/channels`; identifier: string }>(
  'platforms/{platform}/channels',
  HttpMethod.POST,
  async (request: PluginRequest) => {
    const [_, platform] = request.params.resource.match(/^platforms\/(.+)\/channels$/) ?? [];

    return Result.fromThrowable(
      () => JSON.parse(request.body ?? '') as { identifier: { value: string } },
      () => toJSONError(request.body ?? '')
    )()
      .asyncAndThen(body =>
        CreateChannelWorkflow()({
          identifier: body.identifier.value,
          platform: platformTypeSchema.parse(platform),
        })
      )
      .match<PluginResponse>(
        () => ({ code: 201, response: {} }),
        error => mapErrorResponse(error)
      );
  }
);

type UpdateBody = {
  setting: {
    isMonitoring: boolean;
    checkInterval: number | null;
  };
};

export const UpdateHandler: Handler<{
  resource: `platforms/${string}/channels/${string}`;
}> = Handler<{
  resource: `platforms/${string}/channels/${string}`;
}>(
  'platforms/{platform}/channels/{identifier}',
  HttpMethod.PUT,
  async (request: PluginRequest<{ resource: string }>) => {
    const [_, platform, identifier] =
      request.params.resource.match(/^platforms\/(.+)\/channels\/(.+)$/) ?? [];

    return Result.fromThrowable(
      () => JSON.parse(request.body ?? '') as UpdateBody,
      () => toJSONError(request.body ?? '')
    )()
      .andThen(body =>
        Result.combine([
          ResultValueObject<ChannelIdentifier>(ChannelIdentifier)({
            value: identifier!,
            platform: platformTypeSchema.parse(platform),
          }),
          ok({
            isMonitoring: body.setting.isMonitoring,
            checkInterval: body.setting.checkInterval,
          }),
        ])
      )
      .asyncAndThen(([identifier, setting]) => UpdateChannelWorkflow()({ identifier, ...setting }))
      .match<PluginResponse>(
        () => ({ code: 200, response: {} }),
        error => mapErrorResponse(error)
      );
  }
);

export const TerminateHandler: Handler<{
  resource: `platforms/${string}/channels/${string}`;
}> = Handler<{
  resource: `platforms/${string}/channels/${string}`;
}>(
  'platforms/{platform}/channels/{identifier}',
  HttpMethod.DELETE,
  async (request: PluginRequest<{ resource: string }>) => {
    const [_, platform, identifier] =
      request.params.resource.match(/^platforms\/(.+)\/channels\/(.+)$/) ?? [];

    return ResultValueObject<ChannelIdentifier>(ChannelIdentifier)({
      value: identifier!,
      platform: platformTypeSchema.parse(platform),
    })
      .asyncAndThen(identifier => TerminateChannelWorkflow()({ identifier }))
      .match<PluginResponse>(
        () => ({ code: 204, response: {} }),
        error => mapErrorResponse(error)
      );
  }
);

export const ChannelHandlers = [
  FindHandler,
  SearchHandler,
  CreateHandler,
  UpdateHandler,
  TerminateHandler,
] as Handler[];
