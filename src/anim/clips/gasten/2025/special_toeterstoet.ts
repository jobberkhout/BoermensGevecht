import { swing } from '../../../humanoid.ts';
import type { Clip, Key } from '../../../types.ts';

/** A car bouncing on its springs, a little out of step with the next one. */
const bounce = (lag: number): Key[] => {
  const at = (u: number) => (u + lag) % 1;
  const keys: Key[] = [[0, 0]];
  for (const [u, y] of [[0.25, -2.5], [0.5, 0], [0.75, -2.5]] as const) keys.push([at(u), y, 'sineInOut']);
  keys.sort((a, b) => a[0] - b[0]);
  keys.push([1, 0, 'sineInOut']);
  return keys.filter((k, i, all) => i === 0 || k[0] > all[i - 1]![0]);
};

/** Two honks per loop: toet, toet. */
const HONK: Key[] = [
  [0, 0], [0.04, 1.2, 'backOut'], [0.2, 1, 'hold'], [0.26, 0, 'in'],
  [0.38, 0, 'hold'], [0.42, 1.3, 'backOut'], [0.6, 1, 'hold'], [0.66, 0, 'in'], [1, 0, 'hold'],
];

/**
 * De Toeterstoet: the wedding convoy comes past, honking so that everyone knows.
 * The cars bounce along, the balloons sway, and the first car honks twice.
 */
const toeterstoetClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 1.2,
    tracks: {
      car_a: { y: bounce(0) },
      car_b: { y: bounce(0.15) },
      balloons_a: { rot: swing(6, 0, 0.1) },
      balloons_b: { rot: swing(7, 0, 0.45) },
      honk: { sx: HONK, sy: HONK },
    },
  },
};

export default toeterstoetClips;
