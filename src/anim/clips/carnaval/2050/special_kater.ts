import type { Clip, Key, Track } from '../../../types.ts';

/** How far things fall out of the cloud before they are gone: from under it to about y = +170. */
const DROP = 116;

/**
 * Something falling out of the cloud. It hangs in its place until `from`,
 * falls DROP pixels by `to`, shrinking away at the end, and grows back in its
 * place, done by `back`. With `back` < `from` the fall ends at the end of the
 * loop, and it is still gone when the loop begins again.
 */
function fall(from: number, to: number, back: number, dist = DROP): Track {
  if (back > to) {
    const s: Key[] = [[0, 1], [to - 0.08, 1, 'hold'], [to, 0, 'in'], [back - 0.1, 0, 'hold'], [back, 1, 'backOut'], [1, 1, 'hold']];
    return { y: [[0, 0], [from, 0, 'hold'], [to, dist, 'in'], [to + 0.01, 0, 'hold'], [1, 0, 'hold']], sx: s, sy: s };
  }
  const s: Key[] = [[0, 0], [back - 0.1, 0, 'hold'], [back, 1, 'backOut'], [to - 0.08, 1, 'hold'], [to, 0, 'in']];
  return { y: [[0, 0], [from, 0, 'hold'], [to, dist, 'in']], sx: s, sy: s };
}

/** A herring wriggles on the way down. */
const WRIGGLE: Key[] = [[0, 0], [0.125, 12, 'sineInOut'], [0.25, -10, 'sineInOut'], [0.375, 12, 'sineInOut'], [0.5, -10, 'sineInOut'], [0.625, 12, 'sineInOut'], [0.75, -10, 'sineInOut'], [0.875, 12, 'sineInOut'], [1, 0, 'sineInOut']];

/**
 * De Kater, the morning after. A grey cloud with bags under its eyes and a
 * queasy mouth hangs over the enemy, and it rains herring: a few silver fish
 * and a few grey drops fall past their faces and are gone. The cloud sags
 * and heaves; behind it a pale sun peeps out, as if it would rather not.
 */
const kater: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      cloud: {
        y: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']],
        sy: [[0, 1], [0.5, 0.97, 'sineInOut'], [1, 1, 'sineInOut']],
        sx: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']],
      },
      sun: { y: [[0, 2], [0.5, -2, 'sineInOut'], [1, 2, 'sineInOut']], rot: [[0, -4], [0.5, 4, 'sineInOut'], [1, -4, 'sineInOut']] },
      herring_a: { ...fall(0.06, 0.6, 0.86), rot: WRIGGLE },
      herring_b: { ...fall(0.42, 1, 0.24), rot: WRIGGLE },
      herring_c: { ...fall(0.24, 0.8, 0.98), rot: WRIGGLE },
      drop_a: { ...fall(0.1, 0.45, 0.7, 100), rate: 2 },
      drop_b: { ...fall(0.5, 0.85, 0.3, 100), rate: 2 },
      drop_c: { ...fall(0.3, 0.62, 0.96, 90), rate: 2 },
      drop_d: { ...fall(0.6, 0.95, 0.42, 96), rate: 2 },
    },
  },
};

export default kater;
