import type { Clip, Key } from '../../../types.ts';

/** The same keys with the sign flipped, for the right arm, which is the left one mirrored. */
const flip = (keys: readonly Key[]): Key[] => keys.map((k): Key => [k[0], -k[1], k[2]]);

/**
 * One loop: a tug that rolls each sleeve a notch higher (left, then right),
 * then both arms flex, biceps swelling, fists turning in. Meanwhile the
 * stopwatch hand races round and the watch jumps at every lap.
 */

/** A sleeve rolled a notch up its arm and thicker for it, then (unseen, under the flex) back for the next loop. */
function roll(at: number): { x: Key[]; y: Key[]; sy: Key[]; sx: Key[] } {
  return {
    x: [[0, 0], [at, 0, 'hold'], [at + 0.06, -1.5, 'out'], [at + 0.12, -3, 'inOut'], [0.86, -3, 'hold'], [1, 0, 'inOut']],
    y: [[0, 0], [at, 0, 'hold'], [at + 0.06, -3, 'out'], [at + 0.12, -6, 'inOut'], [0.86, -6, 'hold'], [1, 0, 'inOut']],
    sy: [[0, 1], [at, 1, 'hold'], [at + 0.06, 1.12, 'out'], [at + 0.12, 1.25, 'inOut'], [0.86, 1.25, 'hold'], [1, 1, 'inOut']],
    sx: [[0, 1], [at, 1, 'hold'], [at + 0.12, 1.04, 'inOut'], [0.86, 1.04, 'hold'], [1, 1, 'inOut']],
  };
}

/** Flex: the forearm curls in, holds, lets go. */
const CURL: Key[] = [[0, 0], [0.42, 0, 'hold'], [0.52, -16, 'out'], [0.56, -12, 'inOut'], [0.6, -17, 'inOut'], [0.64, -12, 'inOut'], [0.68, -17, 'inOut'], [0.8, 0, 'inOut'], [1, 0, 'hold']];
const SWELL: Key[] = [[0, 1], [0.42, 1, 'hold'], [0.52, 1.3, 'backOut'], [0.56, 1.22, 'inOut'], [0.6, 1.32, 'inOut'], [0.64, 1.22, 'inOut'], [0.68, 1.32, 'inOut'], [0.8, 1, 'inOut'], [1, 1, 'hold']];
const LIFT: Key[] = [[0, 0], [0.42, 0, 'hold'], [0.52, 4, 'out'], [0.68, 4, 'hold'], [0.8, 0, 'inOut'], [1, 0, 'hold']];

const sleeveL = roll(0.06);
const sleeveR = roll(0.22);

const mouwenClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      // A tug at each sleeve: the arm gives a little jerk as it is rolled.
      arm_l: { rot: [[0, 0], [0.06, 0, 'hold'], [0.1, -3, 'out'], [0.18, 0, 'inOut'], [0.42, 0, 'hold'], [0.52, 4, 'out'], [0.68, 4, 'hold'], [0.8, 0, 'inOut'], [1, 0, 'hold']] },
      arm_r: { rot: [[0, 0], [0.22, 0, 'hold'], [0.26, 3, 'out'], [0.34, 0, 'inOut'], [0.42, 0, 'hold'], [0.52, -4, 'out'], [0.68, -4, 'hold'], [0.8, 0, 'inOut'], [1, 0, 'hold']] },
      cuff_l: sleeveL,
      cuff_r: { ...sleeveR, x: flip(sleeveR.x) },
      fore_l: { rot: flip(CURL) },
      fore_r: { rot: CURL },
      bicep_l: { sx: SWELL, sy: SWELL },
      bicep_r: { sx: SWELL, sy: SWELL },
      lip: { y: flip(LIFT).map((k): Key => [k[0], k[1] * 0.25, k[2]]) },
      // The hand races round twice a loop; the watch hops at each lap.
      watch_hand: { rot: [[0, 0], [1, 360, 'linear']], rate: 2 },
      watch: {
        y: [[0, 0], [0.04, -3, 'out'], [0.1, 0, 'in'], [0.5, 0, 'hold'], [0.54, -3, 'out'], [0.6, 0, 'in'], [1, 0, 'hold']],
        rot: [[0, 0], [0.04, -3, 'out'], [0.1, 2, 'inOut'], [0.16, 0, 'inOut'], [0.5, 0, 'hold'], [0.54, 3, 'out'], [0.6, -2, 'inOut'], [0.66, 0, 'inOut'], [1, 0, 'hold']],
      },
    },
  },
};

export default mouwenClips;
