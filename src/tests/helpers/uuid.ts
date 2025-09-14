import { v4 as UUIDV4 } from 'uuid';

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;

  return function () {
    t += 0x6d2b79f5;

    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);

    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

export const uuidV4FromSeed = (seed: number): string => {
  const rand = mulberry32(seed);

  const bytes = new Uint8Array(16);

  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(rand() * 256);

  return UUIDV4({ random: bytes });
};
