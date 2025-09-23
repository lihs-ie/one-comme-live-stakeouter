import ElectronStore from 'electron-store';

/**
 * ドット記法キー生成ユーティリティ（型膨張ガード付き）
 * - Index Signature（`string extends keyof T`）を検出した場合は再帰を打ち切り、`string` 相当へ短絡する。
 *   これにより巨大な共用体生成を抑止し、tsserver 負荷を軽減する。
 */
type DotNotationKeyOf<T extends Record<string, unknown>> =
  // Index Signature を持つ場合、再帰せず短絡
  string extends keyof T
    ? Extract<keyof T, string>
    : {
        [K in Extract<keyof Required<T>, string>]: Required<T>[K] extends Record<string, unknown>
          ? string extends keyof Required<T>[K]
            ? // 子も Index Signature を持つ場合はここで再帰を打ち切る
              K
            : K | `${K}.${DotNotationKeyOf<Required<T>[K]>}`
          : K;
      }[Extract<keyof Required<T>, string>];

/**
 * ドット記法キーに対応する値の型（型膨張ガード付き）
 * - 親または子が Index Signature を持つと判定された場合は `unknown` に短絡する。
 *   これにより深い再帰展開を防ぐ。
 */
type DotNotationValueOf<
  T extends Record<string, unknown>,
  K extends DotNotationKeyOf<T>,
> = string extends keyof T
  ? unknown
  : K extends `${infer Head}.${infer Tail}`
    ? Head extends Extract<keyof T, string>
      ? Required<T>[Head] extends Record<string, unknown>
        ? string extends keyof Required<T>[Head]
          ? unknown
          : DotNotationValueOf<
              Required<T>[Head],
              Extract<Tail, DotNotationKeyOf<Required<T>[Head]>>
            >
        : never
      : never
    : K extends Extract<keyof T, string>
      ? Required<T>[K]
      : never;

type MockElectronStoreOptions<T> = {
  defaults?: Partial<T>;
  name?: string;
};

/**
 * MockElectronStore implements the same interface as ElectronStore
 * This mock supports get, set, delete, has methods with dot notation
 */
export class MockElectronStore<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends ElectronStore<T> {
  private data: Record<string, unknown> = {};
  private defaultValues: Partial<T>;
  public override readonly path: string;

  constructor(options: MockElectronStoreOptions<T> = {}) {
    super();

    this.defaultValues = options.defaults || {};
    this.data = { ...this.defaultValues };
    this.path = `/mock/path/${options.name ?? 'config'}.json`;
  }

  static override initRenderer(): void {
    // noop
  }

  // ElectronStore-compatible get method signatures
  override get<Key extends keyof T>(key: Key): T[Key];
  override get<Key extends keyof T>(key: Key, defaultValue: Required<T>[Key]): Required<T>[Key];
  override get<Key extends DotNotationKeyOf<T>>(key: Key): DotNotationValueOf<T, Key>;
  override get<Key extends DotNotationKeyOf<T>>(
    key: Key,
    defaultValue: NonNullable<DotNotationValueOf<T, Key>>
  ): NonNullable<DotNotationValueOf<T, Key>>;
  override get<Key extends string, Value = unknown>(
    key: Exclude<Key, DotNotationKeyOf<T>>,
    defaultValue?: Value
  ): Value;
  override get(key: string, defaultValue?: unknown): unknown {
    const value = this.getByPath(key);
    return value !== undefined ? value : defaultValue;
  }

  // ElectronStore-compatible set method signatures
  override set<Key extends keyof T>(key: Key, value?: T[Key]): void;
  override set<Key extends DotNotationKeyOf<T>>(key: Key, value?: DotNotationValueOf<T, Key>): void;
  override set(key: string, value: unknown): void;
  override set(key: string, value?: unknown): void {
    this.setByPath(key, value);
  }

  // ElectronStore-compatible delete method signatures
  override delete<Key extends keyof T>(key: Key): void;
  override delete<Key extends DotNotationKeyOf<T>>(key: Key): void;
  override delete(key: string): void {
    this.deleteByPath(key);
  }

  // ElectronStore-compatible has method signatures
  override has<Key extends keyof T>(key: Key): boolean;
  override has<Key extends DotNotationKeyOf<T>>(key: Key): boolean;
  override has(key: string): boolean {
    return this.getByPath(key) !== undefined;
  }

  private getByPath(path: string): unknown {
    const keys = path.split('.');
    let current: unknown = this.data;

    for (const key of keys) {
      if (current !== null && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  private setByPath(path: string, value: unknown): void {
    const keys = path.split('.');
    let current = this.data;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (typeof key !== 'string' || key.length === 0) continue;

      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    if (typeof lastKey === 'string' && lastKey.length > 0) {
      current[lastKey] = value;
    }
  }

  private deleteByPath(path: string): void {
    const keys = path.split('.');
    let current = this.data;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (
        typeof key !== 'string' ||
        key.length === 0 ||
        !(key in current) ||
        typeof current[key] !== 'object' ||
        current[key] === null
      ) {
        return;
      }
      current = current[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    if (typeof lastKey === 'string' && lastKey.length > 0) {
      delete current[lastKey];
    }
  }
}
