import { ServiceIdentifier, ViewerService } from 'domains/viewer';

import { Builder } from 'tests/factories';
import {
  ServiceIdentifierFactory,
  ViewerServiceFactory,
} from 'tests/factories/domains/viewer/service';
import { Type as CommonType, Resource } from 'tests/mock/upstreams/common';

export type Overrides = { model: ViewerService; version: number };

export class TerminateResource extends Resource<CommonType, Overrides, object> {
  private static readonly CODE_PREFIX = 'one-comme/services/terminate';
  private readonly identifier: ServiceIdentifier;

  public constructor(type: CommonType, overrides?: Overrides) {
    super(type, overrides ?? { model: Builder(ViewerServiceFactory).build(), version: 1 });

    this.identifier = this.createIdentifier(this.overrides);
  }

  public code(): string {
    return `${TerminateResource.CODE_PREFIX}/${this.identifier.value}/${this.overrides.version}`;
  }

  public matches(request: Request, uri: string): boolean {
    if (request.method !== 'DELETE') {
      return false;
    }

    if (!uri.startsWith(`/services/${this.identifier.value}`)) {
      return false;
    }

    return true;
  }

  public content(): string {
    return JSON.stringify({});
  }

  protected createSuccessfulResponse(_: Request): Response {
    return new Response(this.content());
  }

  private createIdentifier(overrides?: Overrides): ServiceIdentifier {
    return overrides?.model.identifier ?? Builder(ServiceIdentifierFactory).build();
  }
}
