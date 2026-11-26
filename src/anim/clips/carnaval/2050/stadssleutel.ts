import type { Clip } from '../../../types.ts';

/**
 * The key of the city, hanging from its ribbon over a turret the Reuzenprins
 * has taken: it swings slowly, a few degrees each way. The bow it hangs from
 * gives a little with it.
 */
const stadssleutel: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 1.6,
    tracks: {
      key: { rot: [[0, -5], [0.5, 5, 'sineInOut'], [1, -5, 'sineInOut']] },
      bow: { rot: [[0, -1.5], [0.5, 1.5, 'sineInOut'], [1, -1.5, 'sineInOut']] },
    },
  },
};

export default stadssleutel;
