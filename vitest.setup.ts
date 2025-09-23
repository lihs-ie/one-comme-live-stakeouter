import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

import './src/tests/expect';

const fetchMocker = createFetchMock(vi);

fetchMocker.enableMocks();

// ElectronStoreのモック設定
vi.mock('electron-store', () => {
  // ベースクラスのモック実装
  const MockElectronStoreBase = class {
    data: Record<string, unknown>;
    options: { defaults?: Record<string, unknown> };

    constructor(options: { defaults?: Record<string, unknown> } = {}) {
      this.options = options;
      this.data = { ...options.defaults } as Record<string, unknown>;
    }

    get(key: string, defaultValue: unknown) {
      return this.data[key] ?? defaultValue;
    }

    set(key: string, value: unknown) {
      this.data[key] = value;
    }

    delete(key: string) {
      delete this.data[key];
    }

    has(key: string) {
      return key in this.data;
    }

    static initRenderer() {
      // noop
    }
  };

  return {
    default: MockElectronStoreBase,
  };
});
