import type { Clip } from '../../../types.ts';

/** Eerst thee: the tray floats up, swaying gently so nothing spills. */
const theeClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 1.2,
    tracks: {
      tray: {
        rot: [[0, -5], [0.5, 5, 'sineInOut'], [1, -5, 'sineInOut']],
        y: [[0, 0], [0.25, -1.2, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        sx: [[0, 1], [0.5, 1.06, 'sineInOut'], [1, 1, 'sineInOut']],
        sy: [[0, 1], [0.5, 1.06, 'sineInOut'], [1, 1, 'sineInOut']],
      },
    },
  },
};

export default theeClips;
