import { AggregateSchema } from 'infrastructures/common';
import { SerializedChannel } from 'infrastructures/monitoring';
import { bootstrapPlugin, type PluginLifecycle } from 'providers/plugin';

import { APIExecutor } from './api';
import { PluginRequest, PluginResponse } from './api/common';

import type ElectronStore from 'electron-store';

type SendType =
  | 'connected'
  | 'comments'
  | 'systemComment'
  | 'clear'
  | 'deleted'
  | 'meta'
  | 'meta.clear'
  | 'config'
  | 'userDatas'
  | 'services'
  | 'notification'
  | 'pinned'
  | 'waitingList'
  | 'bookmarked'
  | 'setList'
  | 'reactions'
  | 'wp.update'
  | 'wp.exec'
  | 'setList.request'
  | 'yt.survey.start'
  | 'yt.survey.update'
  | 'yt.survey.finish'
  | 'ni.survey.start'
  | 'ni.survey.finish'
  | 'toast';

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface Service {
  id: string;
  name: string;
  url: string;
  speech: boolean;
  write: boolean;
  enabled: boolean;
  color: RGBColor;
  persist?: boolean;
  meta?: Record<string, unknown>;
}

interface ConnectedData {
  services?: Service[];
  connected?: boolean;
}

interface PluginAPI {
  dir: string;
  filepath: string;
  store: ElectronStore<AggregateSchema<'channels', SerializedChannel>>;
}

type Plugin<T extends Record<string, unknown> = Record<string, unknown>> = {
  uid: string;
  name: string;
  version: string;
  permissions: SendType[];
  author?: string;
  url?: string;
  defaultState: Record<string, unknown>;
  migrations?: Record<string, unknown>;
  init?(api: PluginAPI, initialData: Partial<ConnectedData>): Promise<void> | void;
  subscribe?(type: SendType, ...args: unknown[]): void;
  destroy?(): void;
  request?(request: PluginRequest): Promise<PluginResponse> | PluginResponse;
} & T;

let lifecycle: PluginLifecycle | null = null;

const plugin: Plugin = {
  name: 'わんコメンテーター',
  uid: 'one-commentator',
  version: '0.1.0',
  permissions: ['services', 'connected'],
  author: 'lihs',
  url: 'http://localhost:11180/plugins/one-commentator/static/index.html',
  defaultState: {},

  init(api: PluginAPI, _initialData: Partial<ConnectedData>) {
    void (async () => {
      await bootstrapPlugin(api.store, {
        eventWorkerIntervalMs: 100,
        monitoringTickMs: 60000,
      }).match(
        pluginLifecycle => {
          lifecycle = pluginLifecycle;
          pluginLifecycle.logger.info('[Plugin] Initialized successfully');
        },
        error => {
          console.error('[Plugin] Init failed', error);
        }
      );
    })();
  },

  destroy() {
    if (!lifecycle) {
      console.warn('[Plugin] Already destroyed or not initialized');
      return;
    }

    lifecycle.shutdown();
    lifecycle = null;
  },

  async request(request: PluginRequest): Promise<PluginResponse> {
    return APIExecutor.execute(request);
  },
};

module.exports = plugin;
