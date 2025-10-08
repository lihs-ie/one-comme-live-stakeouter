type Entry = {
  identifier: number;
  delay: number;
  callback: () => void;
  active: boolean;
  elapsed: number;
};

export const MockTimer = (): [
  {
    set: typeof setInterval;
    clear: typeof clearInterval;
  },
  advanceBy: (deltaMs: number) => void,
] => {
  let currentIdentifier = 1;
  const entries = new Map<number, Entry>();

  const set = (callback: (_: void) => void, delay?: number): NodeJS.Timeout => {
    const identifier = currentIdentifier++;

    entries.set(identifier, {
      identifier,
      delay: delay ?? 0,
      callback,
      active: true,
      elapsed: 0,
    });

    return {
      hasRef: () => true,
      ref: () => set(callback, delay),
      refresh: () => set(callback, delay),
      unref: () => set(callback, delay),
      [Symbol.toPrimitive]: () => identifier,
      close: () => set(callback, delay),
      [Symbol.dispose]: () => set(callback, delay),
    } as unknown as NodeJS.Timeout;
  };

  const clear: typeof clearInterval = (timeout: NodeJS.Timeout | string | number | undefined) => {
    const entry = entries.get((timeout as NodeJS.Timeout)[Symbol.toPrimitive]());

    if (entry) {
      entry.active = false;
    }

    return;
  };

  const advanceBy = (deltaMs: number) => {
    for (const entry of entries.values()) {
      if (!entry.active) {
        continue;
      }

      entry.elapsed += deltaMs;

      while (entry.active && entry.delay > 0 && entry.elapsed >= entry.delay) {
        entry.elapsed -= entry.delay;
        entry.callback();
      }
    }
  };

  return [
    {
      set: set as typeof setInterval,
      clear,
    },
    advanceBy,
  ];
};
