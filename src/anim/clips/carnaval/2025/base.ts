import type { Clip, Key } from '../../../types.ts';

/** A shuffle forward and back: half a step towards the door, which does not open any faster. */
const SHUFFLE: Key[] = [[0, 0], [0.2, 0, 'hold'], [0.3, 3, 'sineInOut'], [0.5, 3, 'hold'], [0.62, 0, 'sineInOut'], [1, 0]];

/**
 * De feesttent on the market square: the pennant on the gable flutters, the
 * bunting sways, the queue shuffles half a step towards the door and back, and
 * the green toilet's door swings open, somebody goes in, and it shuts again.
 */
const feesttentClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      pennant: { sx: [[0, 1], [0.25, 0.82, 'sineInOut'], [0.5, 1, 'sineInOut'], [0.75, 0.86, 'sineInOut'], [1, 1, 'sineInOut']], rot: [[0, 0], [0.25, 6, 'sineInOut'], [0.5, -2, 'sineInOut'], [0.75, 5, 'sineInOut'], [1, 0, 'sineInOut']] },
      bunting: { rot: [[0, 0], [0.25, 0.8, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -0.8, 'sineInOut'], [1, 0, 'sineInOut']], sy: [[0, 1], [0.5, 1.04, 'sineInOut'], [1, 1, 'sineInOut']] },
      queue: { x: SHUFFLE },
      // The door swings out on its hinge, stays open a moment, and bangs shut.
      dixi_door: { sx: [[0, 1], [0.55, 1, 'hold'], [0.62, 0.2, 'out'], [0.76, 0.2, 'hold'], [0.8, 1, 'in'], [0.84, 0.94, 'out'], [0.88, 1, 'in'], [1, 1]] },
    },
  },
};

export default feesttentClips;
