import type { SimState } from './types.ts';

/** FNV-1a over the state's JSON. Two matches are identical exactly when their hashes match every tick. */
export function hashState(s: SimState): string {
  const text = JSON.stringify(s);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
