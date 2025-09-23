import { ServiceIdentifier, ViewerService } from 'domains/viewer';

import { Builder } from 'tests/factories';
import {
  ServiceIdentifierFactory,
  ViewerServiceFactory,
} from 'tests/factories/domains/viewer/service';
import { Type as CommonType, Resource } from 'tests/mock/upstreams/common';

import { ServiceMedia } from '../../media/service/item';

export type Overrides = { model: ViewerService; version: number };

export class ServiceResource extends Resource<CommonType, Overrides, object> {
  private static readonly CODE_PREFIX = 'one-comme/services/item';
  private readonly media: ServiceMedia;
  private readonly identifier: ServiceIdentifier;

  public constructor(type: CommonType, overrides?: Overrides) {
    super(type, overrides ?? { model: Builder(ViewerServiceFactory).build(), version: 1 });

    this.identifier = this.createIdentifier(this.overrides);
    this.media = new ServiceMedia(this.overrides.model);
  }

  public code(): string {
    return `${ServiceResource.CODE_PREFIX}/${this.identifier.value}/${this.overrides.version}`;
  }

  public matches(request: Request, uri: string, _: string | null): boolean {
    if (request.method !== 'GET') {
      return false;
    }

    if (!uri.startsWith(`/services/${this.identifier.value}`)) {
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

  private createIdentifier(overrides?: Overrides): ServiceIdentifier {
    return overrides?.model.identifier ?? Builder(ServiceIdentifierFactory).build();
  }
}
