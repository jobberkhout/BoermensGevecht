import type { Clip, Key } from '../../../types.ts';

/** A wave: up, a little to the side and back, twice per loop. */
const WAVE: Key[] = [[0, -14], [0.25, 14, 'sineInOut'], [0.5, -14, 'sineInOut'], [0.75, 14, 'sineInOut'], [1, -14, 'sineInOut']];

/**
 * De Bezemwagen. The old bus that follows the tour and picks up everyone who
 * could not go on, the broom lashed to its front bumper. It stands beside the
 * base with the engine running for as long as it is shown: the bus shakes, the
 * exhaust puffs, the broom quivers, and two of the passengers wave out of the
 * windows, wrapped in blankets and ready to have another go.
 */
const bezemwagenClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 1.2,
    tracks: {
      bus: { y: [[0, 0], [0.25, -1.2, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_a: { rot: WAVE },
      arm_c: { rot: [[0, 12], [0.25, -12, 'sineInOut'], [0.5, 12, 'sineInOut'], [0.75, -12, 'sineInOut'], [1, 12, 'sineInOut']] },
      broom: { rot: [[0, -2], [0.25, 2, 'sineInOut'], [0.5, -2, 'sineInOut'], [0.75, 2, 'sineInOut'], [1, -2, 'sineInOut']] },
      puff: {
        x: [[0, 0], [1, -10, 'out']],
        y: [[0, 0], [1, -8, 'out']],
        sx: [[0, 0.4], [0.3, 1, 'out'], [1, 1.5, 'out']],
        sy: [[0, 0.4], [0.3, 1, 'out'], [1, 1.5, 'out']],
      },
    },
  },
};

export default bezemwagenClips;
