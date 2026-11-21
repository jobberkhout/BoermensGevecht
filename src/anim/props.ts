import type { Key, Track } from './types.ts';

/** Building blocks for things that are not walking characters: turrets, scenery, effects. */

/**
 * A mouth that chatters between `from` and `to` (0..1 of the clip) and stays
 * shut otherwise. Use on a mouth part's `sy`.
 */
export function chatter(from: number, to: number, flaps: number, shut = 0.18): Key[] {
  const keys: Key[] = [[0, shut]];
  if (from > 0) keys.push([from, shut, 'hold']);
  const step = (to - from) / flaps;
  for (let i = 0; i < flaps; i++) {
    // Not every syllable opens the mouth equally wide.
    const wide = 0.7 + 0.3 * ((i * 7) % 3) * 0.5;
    keys.push([from + (i + 0.5) * step, wide, 'sineInOut']);
    keys.push([from + (i + 1) * step, shut, 'sineInOut']);
  }
  if (to < 1) keys.push([1, shut, 'hold']);
  return keys;
}

/** Pops a part into view at `from`, keeps it there, and shrinks it away at `to`. `size` is how big it gets. */
export function pop(from: number, to: number, size = 1): Track {
  const grow = Math.min(0.06, (to - from) / 3);
  const keys: Key[] = [
    [0, 0],
    [Math.max(0.001, from), 0, 'hold'],
    [from + grow, size, 'backOut'],
    [to - grow * 0.7, size, 'hold'],
    [to, 0, 'in'],
    [1, 0, 'hold'],
  ];
  return { sx: keys, sy: keys };
}

/** Rattles a part left and right, `shakes` times, fading out. */
export function rattle(amount: number, shakes: number): Key[] {
  const keys: Key[] = [[0, 0]];
  for (let i = 1; i <= shakes; i++) {
    const fade = 1 - i / (shakes + 1);
    keys.push([i / (shakes + 1), (i % 2 === 0 ? -1 : 1) * amount * fade, 'sineInOut']);
  }
  keys.push([1, 0, 'sineInOut']);
  return keys;
}
