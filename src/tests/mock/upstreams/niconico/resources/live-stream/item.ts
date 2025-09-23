import { RawLiveStreamMedia } from 'acl/live-stream/niconico';

import { LiveStream, LiveStreamIdentifier, liveStreamSchema } from 'domains/streaming';

import { Builder } from 'tests/factories';
import { LiveStreamFactory, LiveStreamIdentifierFactory } from 'tests/factories/domains/streaming';
import { Type as CommonType, Resource } from 'tests/mock/upstreams/common';

import { LiveStreamMedia } from '../../media/live-stream/item';

export type Overrides = LiveStream | Partial<RawLiveStreamMedia>;

export class LiveStreamResource extends Resource<CommonType, Overrides, object> {
  private static readonly CODE_PREFIX = 'niconico/live-stream/item';
  private readonly media: LiveStreamMedia;
  private readonly identifier: LiveStreamIdentifier;

  public constructor(type: CommonType, overrides?: Overrides) {
    super(type, overrides ?? Builder(LiveStreamFactory).build());

    this.identifier = this.createIdentifier(this.overrides);
    this.media = new LiveStreamMedia(this.overrides);
  }

  public code(): string {
    return `${LiveStreamResource.CODE_PREFIX}/${this.identifier.value}`;
  }

  public matches(request: Request, uri: string): boolean {
    if (request.method !== 'GET') {
      return false;
    }

    if (!uri.startsWith(`/watch/${this.identifier.value}/programinfo`)) {
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

  private createIdentifier(overrides?: Overrides): LiveStreamIdentifier {
    if (this.isModel<LiveStream>(liveStreamSchema, overrides)) {
      return overrides.identifier;
    }

    return this.createDefaultIdentifier();
  }

  private createDefaultIdentifier(): LiveStreamIdentifier {
    return Builder(LiveStreamIdentifierFactory).build();
  }
}
