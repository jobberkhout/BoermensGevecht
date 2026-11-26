import { swing } from '../../../humanoid.ts';
import type { Clip } from '../../../types.ts';

/**
 * De loods aan de kade: the crane's hook sways on its cables, and a gull
 * hangs on the wind over the roof, drifting and dipping.
 */
const loodsBase: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 5,
    tracks: {
      hook: { rot: swing(3.5) },
      gull: {
        x: [[0, 0], [0.5, -22, 'sineInOut'], [1, 0, 'sineInOut']],
        y: [[0, 0], [0.25, -6, 'sineInOut'], [0.5, 2, 'sineInOut'], [0.75, -4, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.25, -6, 'sineInOut'], [0.5, 4, 'sineInOut'], [0.75, -3, 'sineInOut'], [1, 0, 'sineInOut']],
        sy: [[0, 1], [0.1, 0.7, 'sineInOut'], [0.2, 1, 'sineInOut'], [0.6, 1, 'hold'], [0.7, 0.7, 'sineInOut'], [0.8, 1, 'sineInOut'], [1, 1, 'hold']],
      },
    },
  },
};

export default loodsBase;
