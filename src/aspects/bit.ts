const utf8Bytes = (input: string): Uint8Array => new TextEncoder().encode(input);

const toBytes = (seed: string | number | bigint | Uint8Array): Uint8Array => {
  if (seed instanceof Uint8Array) return seed;
  if (typeof seed === 'string') return utf8Bytes(seed);
  if (typeof seed === 'number') return utf8Bytes(String(seed));
  return utf8Bytes(seed.toString());
};

export const fnv1a64 = (seed: string | number | bigint | Uint8Array): bigint => {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (const b of toBytes(seed)) {
    hash ^= BigInt(b);
    hash = (hash * prime) & 0xffffffffffffffffn;
  }
  return hash;
};

export const splitmix64 = (x: bigint): bigint => {
  x = (x + 0x9e3779b97f4a7c15n) & 0xffffffffffffffffn;
  let z = x;
  z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & 0xffffffffffffffffn;
  z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & 0xffffffffffffffffn;
  z = z ^ (z >> 31n);
  return z & 0xffffffffffffffffn;
};

export const mapU64ToRange = (u64: bigint, min: bigint, max: bigint): bigint => {
  const range = max - min + 1n;
  const mapped = (u64 * range) >> 64n;
  return min + mapped;
};
