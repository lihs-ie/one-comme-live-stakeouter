import { ServiceIdentifier, ViewerService } from 'domains/viewer';

import { Builder } from 'tests/factories';
import {
  ServiceIdentifierFactory,
  ViewerServiceFactory,
} from 'tests/factories/domains/viewer/service';
import { Type as CommonType, Resource } from 'tests/mock/upstreams/common';

export type Overrides = { model: ViewerService; version: number };

type Body = {
  id: string;
  name: string;
  url: string;
  speech: boolean;
  write: boolean;
  enabled: boolean;
  color: {
    r: number;
    g: number;
    b: number;
  };
  options: {
    outputLogs: boolean;
    version: number;
    platform: string;
  };
};

export class PersistenceResource extends Resource<CommonType, Overrides, object> {
  private static readonly CODE_PREFIX = 'one-comme/service';
  private readonly identifier: ServiceIdentifier;

  public constructor(type: CommonType, overrides?: Overrides) {
    super(type, overrides ?? { model: Builder(ViewerServiceFactory).build(), version: 1 });

    this.identifier = this.createIdentifier(this.overrides);
  }

  public code(): string {
    return `${PersistenceResource.CODE_PREFIX}/${this.identifier.value}/${this.overrides.version}`;
  }

  public matches(request: Request, uri: string, bodyText: string | null): boolean {
    if (bodyText === null) {
      return false;
    }

    if (this.overrides.version === 1) {
      if (request.method !== 'POST') {
        return false;
      }

      if (!uri.startsWith('/services')) {
        return false;
      }
    } else {
      if (request.method !== 'PUT') {
        return false;
      }

      if (!uri.startsWith(`/services/${this.identifier.value}`)) {
        return false;
      }
    }

    const body: Body = JSON.parse(bodyText) as Body;

    if (body.id !== this.identifier.value) {
      return false;
    }

    if (body.name !== this.overrides.model.name) {
      return false;
    }

    if (body.url !== this.overrides.model.url.value) {
      return false;
    }

    if (body.speech !== this.overrides.model.speech) {
      return false;
    }

    if (body.write !== this.overrides.model.write) {
      return false;
    }

    if (body.enabled !== this.overrides.model.enabled) {
      return false;
    }

    if (body.color.r !== this.overrides.model.color.red) {
      return false;
    }

    if (body.color.g !== this.overrides.model.color.green) {
      return false;
    }

    if (body.color.b !== this.overrides.model.color.blue) {
      return false;
    }

    if (body.options.outputLogs !== this.overrides.model.options.outputLog) {
      return false;
    }

    if (body.options.version !== this.overrides.version) {
      return false;
    }

    if (body.options.platform !== this.identifier.platform) {
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
