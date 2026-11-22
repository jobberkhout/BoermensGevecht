import type { Clip } from '../../../types.ts';

/** The Love-in heart beats softly while it floats up. */
const loveinClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 0.9,
    tracks: {
      heart: {
        sx: [[0, 1], [0.18, 1.14, 'out'], [0.4, 0.98, 'inOut'], [0.58, 1.08, 'out'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.18, 1.14, 'out'], [0.4, 0.98, 'inOut'], [0.58, 1.08, 'out'], [1, 1, 'inOut']],
        rot: [[0, -4], [0.5, 4, 'sineInOut'], [1, -4, 'sineInOut']],
      },
    },
  },
};

export default loveinClips;
