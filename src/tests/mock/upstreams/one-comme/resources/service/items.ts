import hash from 'hash-it';

import { ImmutableList, ImmutableRange } from 'domains/common/collections';
import { ViewerService } from 'domains/viewer';

import { Builder } from 'tests/factories';
import { ViewerServiceFactory } from 'tests/factories/domains/viewer/service';
import { Type as CommonType, Resource } from 'tests/mock/upstreams/common';

import { ServicesMedia } from '../../media/service/items';

export type Overrides = ImmutableList<{ model: ViewerService; version: number }>;

export class ServicesResource extends Resource<CommonType, Overrides, object> {
  private static readonly CODE_PREFIX = 'one-comme/services/items';
  private readonly media: ServicesMedia;

  public constructor(type: CommonType, overrides?: Overrides) {
    super(
      type,
      overrides ??
        ImmutableRange(0, 10).map(index => ({
          model: Builder(ViewerServiceFactory).buildWith(index),
          version: 1 + index,
        }))
    );

    this.media = new ServicesMedia(this.overrides.map(item => item.model));
  }

  public code(): string {
    const suffix = hash(this.overrides.toArray());

    return `${ServicesResource.CODE_PREFIX}/${suffix}`;
  }

  public matches(request: Request, uri: string): boolean {
    if (request.method !== 'GET') {
      return false;
    }

    if (!uri.startsWith(`/services`)) {
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
}
