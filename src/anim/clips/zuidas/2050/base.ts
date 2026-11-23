import type { Clip } from '../../../types.ts';

/**
 * The Spiegelpaleis of 2050 stands still. The weather round it does not: the
 * cloud its top is in shifts a little, a lower cloud wanders across the shaft
 * and back, and the window cleaner hangs in his cradle from cables that come
 * down out of the cloud, wiping the same pane.
 */
const spiegelpaleisClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 9,
    tracks: {
      cloud_top: { x: [[0, -6], [0.5, 6, 'sineInOut'], [1, -6, 'sineInOut']], y: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']], rate: 1 },
      cloud_low: { x: [[0, -26], [0.5, 22, 'sineInOut'], [1, -26, 'sineInOut']], y: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      cloud_wisp: { x: [[0, 8], [0.5, -10, 'sineInOut'], [1, 8, 'sineInOut']] },
      cradle: {
        y: [[0, 0], [0.5, 5, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, -0.8], [0.5, 0.8, 'sineInOut'], [1, -0.8, 'sineInOut']],
        rate: 2,
      },
      wiper: { rot: [[0, -18], [0.5, 34, 'sineInOut'], [1, -18, 'sineInOut']], rate: 9 },
    },
  },
};

export default spiegelpaleisClips;
