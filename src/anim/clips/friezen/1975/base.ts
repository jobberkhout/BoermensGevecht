import type { Clip } from '../../../types.ts';

/** The stove is going: a puff of smoke rises from the chimney, swells and drifts off. */
const baseClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 3,
    tracks: {
      smoke: {
        y: [[0, 6], [1, -22, 'linear']],
        x: [[0, 0], [1, 10, 'sineIn']],
        sx: [[0, 0.3], [0.2, 1, 'out'], [0.8, 1.2, 'linear'], [1, 0, 'in']],
        sy: [[0, 0.3], [0.2, 1, 'out'], [0.8, 1.2, 'linear'], [1, 0, 'in']],
      },
    },
  },
};

export default baseClips;
