import { Type as CommonType, inject, Upstream } from '../common';
import { ServiceResource, Overrides as ServiceOverrides } from './resources/service/item';
import { ServicesResource, Overrides as ServicesOverrides } from './resources/service/items';
import {
  PersistenceResource,
  Overrides as PersistenceOverrides,
} from './resources/service/persistence';
import { TerminateResource, Overrides as TerminateOverrides } from './resources/service/terminate';

export class OneComme extends Upstream {
  public addService(type: CommonType, overrides?: ServiceOverrides): ServiceResource {
    const resource = new ServiceResource(type, overrides);
    this.add(resource);

    return resource;
  }

  public addServices(type: CommonType, overrides?: ServicesOverrides): ServicesResource {
    const resource = new ServicesResource(type, overrides);
    this.add(resource);

    return resource;
  }

  public addServicePersistence(
    type: CommonType,
    overrides?: PersistenceOverrides
  ): PersistenceResource {
    const resource = new PersistenceResource(type, overrides);
    this.add(resource);

    return resource;
  }

  public addServiceTermination(
    type: CommonType,
    overrides?: TerminateOverrides
  ): TerminateResource {
    const resource = new TerminateResource(type, overrides);
    this.add(resource);

    return resource;
  }
}

export const prepare = <R>(endpoint: string, registerer: (upstream: OneComme) => R): R => {
  const upstream = new OneComme(endpoint);

  const resources = registerer(upstream);

  inject(upstream);

  return resources;
};
