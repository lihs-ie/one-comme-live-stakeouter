import { Type as CommonType, inject, Upstream } from '../common';
import { Overrides as LiveStreamOverrides, LiveStreamResource } from './resources/live-stream/item';
import { Overrides as ProgramOverrides, ProgramResource } from './resources/live-stream/program';

export class NicoNico extends Upstream {
  public addProgram(type: CommonType, overrides?: ProgramOverrides): ProgramResource {
    const resource = new ProgramResource(type, overrides);
    this.add(resource);

    return resource;
  }

  public addLiveStream(type: CommonType, overrides?: LiveStreamOverrides): LiveStreamResource {
    const resource = new LiveStreamResource(type, overrides);
    this.add(resource);

    return resource;
  }
}

export const prepare = <R>(endpoint: string, registerer: (upstream: NicoNico) => R): R => {
  const upstream = new NicoNico(endpoint);

  const resources = registerer(upstream);

  inject(upstream);

  return resources;
};
