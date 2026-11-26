import type { Clip } from '../../../types.ts';

/**
 * De bananenschil: lies on the road where Het Bananenpak gave up, and waits.
 * It wobbles a little, the way a peel does that has only just been dropped.
 */
const bananenschilClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 2,
    tracks: {
      peel: {
        rot: [[0, 0], [0.25, -2.5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 2, 'sineInOut'], [1, 0, 'sineInOut']],
        sy: [[0, 1], [0.25, 1.04, 'sineInOut'], [0.5, 0.97, 'sineInOut'], [0.75, 1.03, 'sineInOut'], [1, 1, 'sineInOut']],
      },
    },
  },
};

export default bananenschilClips;
