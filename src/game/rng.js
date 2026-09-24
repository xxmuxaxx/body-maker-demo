// Seeded PRNG (mulberry32): same seed, same sequence. Handy for tests and replays.
export const createRng = (seed = Date.now()) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pick = (rng, list) => list[Math.floor(rng() * list.length)];

// weights: { key: weight }
export const pickWeighted = (rng, weights) => {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = rng() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll < 0) return key;
  }
  return entries[entries.length - 1][0];
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
