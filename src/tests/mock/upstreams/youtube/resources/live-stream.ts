import { ZodObject } from 'zod';

import { RawMedia } from 'acl/live-stream/youtube';

import { ChannelIdentifier } from 'domains/monitoring';
import { LiveStream, LiveStreamIdentifier, liveStreamSchema } from 'domains/streaming';

import { Builder, StringFactory } from 'tests/factories';
import { ChannelIdentifierFactory } from 'tests/factories/domains/monitoring';
import {
  LiveStreamFactory,
  LiveStreamIdentifierFactory,
  LiveStreamURLFactory,
} from 'tests/factories/domains/streaming';
import { Type as CommonType, Resource } from 'tests/mock/upstreams/common';

import { LiveStreamMedia } from '../media/live-stream';

export type Overrides = {
  model?: LiveStream;
  media?: Partial<RawMedia>;
  apiKey: string;
  channel?: ChannelIdentifier;
};

type Query = {
  part: string;
  channelId: string;
  eventType: string;
  type: string;
  key: string;
};

export class LiveStreamResource extends Resource<CommonType, Overrides, Query> {
  private static readonly CODE_PREFIX = 'youtube/live-stream';
  private readonly media: LiveStreamMedia;
  private readonly identifier: LiveStreamIdentifier;
  private readonly channel: ChannelIdentifier;

  public constructor(type: CommonType, overrides?: Overrides) {
    const channel =
      overrides?.channel ??
      overrides?.model?.url.channel ??
      Builder(ChannelIdentifierFactory).build();

    super(
      type,
      overrides ?? {
        model: Builder(LiveStreamFactory).build({
          url: Builder(LiveStreamURLFactory).build({
            channel,
          }),
        }),
        apiKey: Builder(StringFactory(36, 36)).build(),
      }
    );

    this.channel = channel;
    this.identifier = this.createIdentifier(this.overrides);
    this.media = new LiveStreamMedia(overrides?.media ?? overrides?.model ?? this.overrides.model!);
  }

  public code(): string {
    return `${LiveStreamResource.CODE_PREFIX}/${this.identifier.value}`;
  }

  public matches(request: Request, uri: string): boolean {
    if (request.method !== 'GET') {
      return false;
    }

    if (!uri.startsWith(`/v3/search`)) {
      return false;
    }

    const query = this.parseQuery(uri);

    if (query.part !== 'snippet') {
      return false;
    }

    if (query.type !== 'video') {
      return false;
    }

    if (query.eventType !== 'live') {
      return false;
    }

    if (query.channelId !== this.channel.value) {
      return false;
    }

    if (query.key !== this.overrides.apiKey) {
      return false;
    }

    return true;
  }

  public content(): string {
    return this.media.createSuccessfulContent();
  }

  protected createSuccessfulResponse(_: Request): Response {
    return new Response(this.content());
  }

  protected override isModel<T extends Overrides>(
    schema: ZodObject,
    overrides?: Overrides
  ): overrides is T {
    if (!overrides) {
      return false;
    }

    return schema.safeParse(overrides.model).success;
  }

  private createIdentifier(overrides?: Overrides): LiveStreamIdentifier {
    if (this.isModel(liveStreamSchema, overrides)) {
      return overrides.model!.identifier;
    }

    return this.createDefaultIdentifier();
  }

  private createDefaultIdentifier(): LiveStreamIdentifier {
    return Builder(LiveStreamIdentifierFactory).build();
  }
}
