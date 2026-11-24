import type { Clip } from '../../../types.ts';

/**
 * Huurverhoging voor de locals. The estate agent's sign, planted in front of
 * the enemy's door: the board swings on its hooks and the arrow keeps going up.
 */
const huurverhoging: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 1.5,
    tracks: {
      board: { rot: [[0, -3], [0.5, 3, 'sineInOut'], [1, -3, 'sineInOut']] },
      arrow: { y: [[0, 0], [0.3, -5, 'out'], [0.5, 0, 'in'], [0.8, -5, 'out'], [1, 0, 'in']] },
    },
  },
};

export default huurverhoging;
