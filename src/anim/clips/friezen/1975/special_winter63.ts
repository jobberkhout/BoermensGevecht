import type { Clip, Key } from '../../../types.ts';

/** Grown in at the top, falling, shrunk away at the bottom: one layer of snow per cycle. */
const SNOW_A = {
  y: [[0, -14], [1, 22, 'linear']] as Key[],
  sx: [[0, 0], [0.12, 1, 'out'], [0.84, 1, 'hold'], [1, 0, 'in']] as Key[],
  sy: [[0, 0], [0.12, 1, 'out'], [0.84, 1, 'hold'], [1, 0, 'in']] as Key[],
};

/** The same half a cycle later, so there is always snow coming down. */
const SNOW_B = {
  y: [[0, 4], [0.5, 22, 'linear'], [0.5001, -14, 'hold'], [1, 4, 'linear']] as Key[],
  sx: [[0, 1], [0.42, 1, 'hold'], [0.5, 0, 'in'], [0.62, 1, 'out'], [1, 1, 'hold']] as Key[],
  sy: [[0, 1], [0.42, 1, 'hold'], [0.5, 0, 'in'], [0.62, 1, 'out'], [1, 1, 'hold']] as Key[],
};

/**
 * De winter van '63. Pake rocks in his chair on the ice and tells it, finger
 * up, nodding at his own story, while the snow of that winter comes down all
 * over again.
 */
const winter63Clips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      chair: { rot: [[0, -3], [0.5, 4, 'sineInOut'], [1, -3, 'sineInOut']] },
      pake_head: { rot: [[0, 0], [0.25, 5, 'sineInOut'], [0.5, -2, 'sineInOut'], [0.75, 5, 'sineInOut'], [1, 0, 'sineInOut']] },
      // The finger wags: "achttien graden vorst".
      pake_arm: { rot: [[0, 0], [0.5, -10, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      snow_a: SNOW_A,
      snow_b: SNOW_B,
    },
  },
};

export default winter63Clips;
