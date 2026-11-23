import { swing } from '../../../humanoid.ts';
import type { Clip } from '../../../types.ts';

/**
 * Het Pension: the washing on the line sways in the wind, and the factory
 * chimney behind it keeps on smoking, day shift and night shift alike.
 */
const pensionBase: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      washing: { rot: swing(0.8), y: [[0, 0], [0.5, 1.2, 'sineInOut'], [1, 0, 'sineInOut']] },
      smoke: {
        x: [[0, 0], [1, 24, 'out']],
        y: [[0, 0], [1, -6, 'out']],
        sx: [[0, 0.4], [0.3, 1, 'out'], [0.8, 1.1, 'linear'], [1, 0.2, 'in']],
        sy: [[0, 0.4], [0.3, 1, 'out'], [0.8, 1.1, 'linear'], [1, 0.2, 'in']],
        rate: 2,
      },
    },
  },
};

export default pensionBase;
