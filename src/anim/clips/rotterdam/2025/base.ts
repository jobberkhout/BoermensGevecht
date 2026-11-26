import type { Clip } from '../../../types.ts';

/**
 * De Markthal: behind it the building crane runs its trolley out along the jib
 * and back, the bundle of formwork panels swinging under it. The city is never
 * finished.
 */
const markthalClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 7,
    tracks: {
      crane_load: {
        x: [[0, 0], [0.4, 26, 'sineInOut'], [0.55, 26, 'hold'], [0.95, 0, 'sineInOut'], [1, 0]],
        rot: [[0, 0], [0.1, -3, 'sineInOut'], [0.4, 0, 'sineInOut'], [0.47, 4, 'sineInOut'], [0.55, -2, 'sineInOut'], [0.62, 1, 'sineInOut'], [0.7, 0, 'sineInOut'], [0.95, 2, 'sineInOut'], [1, 0, 'sineInOut']],
      },
    },
  },
};

export default markthalClips;
