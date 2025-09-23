import { LiveStream, LiveStreamIdentifier, liveStreamSchema } from 'domains/streaming';

import { Builder } from 'tests/factories';
import { LiveStreamFactory, LiveStreamIdentifierFactory } from 'tests/factories/domains/streaming';
import { Type as CommonType, Resource } from 'tests/mock/upstreams/common';

import { ProgramMedia } from '../../media/live-stream/program';

export type Overrides = LiveStream;

export class ProgramResource extends Resource<CommonType, Overrides, object> {
  private static readonly CODE_PREFIX = 'niconico/live-stream/program';
  private readonly media: ProgramMedia;
  private readonly identifier: LiveStreamIdentifier;

  public constructor(type: CommonType, overrides?: Overrides) {
    super(type, overrides ?? Builder(LiveStreamFactory).build());

    this.identifier = this.createIdentifier(this.overrides);
    this.media = new ProgramMedia(this.overrides);
  }

  public code(): string {
    return `${ProgramResource.CODE_PREFIX}/${this.identifier.hashCode()}`;
  }

  public matches(request: Request, uri: string): boolean {
    if (request.method !== 'GET') {
      return false;
    }

    if (!uri.startsWith(`/tool/v1/broadcasters/user/${this.overrides.url.channel.value}/program`)) {
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
