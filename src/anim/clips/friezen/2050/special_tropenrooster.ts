import type { Clip, Key } from '../../../types.ts';

/** The red keeps pushing out of the top, in boils. */
const BOIL: Key[] = [[0, 0.8], [0.2, 1.25, 'out'], [0.45, 0.9, 'in'], [0.7, 1.2, 'out'], [1, 0.8, 'in']];

/**
 * Tropenrooster. The sign planted in front of the enemy's base: too hot to
 * work, everyone home at noon. The board sways in the heat, the thermometer
 * boils over at the top, and the sun in its sunglasses turns slowly, pleased
 * with itself. A deck chair stands ready below.
 */
const tropenrooster: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 1.6,
    tracks: {
      board: { rot: [[0, -2.4], [0.5, 2.4, 'sineInOut'], [1, -2.4, 'sineInOut']] },
      mercury: { sy: [[0, 1], [0.5, 1.04, 'sineInOut'], [1, 1, 'sineInOut']] },
      burst: { sx: BOIL, sy: BOIL },
      sun: { rot: [[0, -8], [0.5, 8, 'sineInOut'], [1, -8, 'sineInOut']] },
    },
  },
};

export default tropenrooster;
