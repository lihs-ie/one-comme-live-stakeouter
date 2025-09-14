import { Type as CommonType, inject, Upstream } from '../common';
import { Overrides as LiveStreamOverrides, LiveStreamResource } from './resources/live-stream';

export class Youtube extends Upstream {
  public addLiveStream(type: CommonType, overrides?: LiveStreamOverrides): LiveStreamResource {
    const resource = new LiveStreamResource(type, overrides);
    this.add(resource);

    return resource;
  }
}

export const prepare = <R>(endpoint: string, registerer: (upstream: Youtube) => R): R => {
  const upstream = new Youtube(endpoint);

  const resources = registerer(upstream);

  inject(upstream);

  return resources;
};
