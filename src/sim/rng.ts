/** mulberry32: a small seeded generator. The state is one unsigned 32-bit integer. */
export function nextRng(state: number): number {
  return (state + 0x6d2b79f5) >>> 0;
}

/** An unsigned 32-bit value derived from the current state. */
export function rngValue(state: number): number {
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (t ^ (t >>> 14)) >>> 0;
}

/** Advances `holder.rng` and returns an integer in [0, n). */
export function randInt(holder: { rng: number }, n: number): number {
  holder.rng = nextRng(holder.rng);
  return rngValue(holder.rng) % n;
}
