import type { Clip } from '../../../types.ts';

/**
 * De container, standing on the lane where the crane put it down. The slings
 * and the hook sway a little above it, the way they do once the load is down
 * and the crane driver has gone for coffee.
 */
const containerClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 2.6,
    tracks: {
      hook: { rot: [[0, -1.4], [0.5, 1.4, 'sineInOut'], [1, -1.4, 'sineInOut']], x: [[0, 0.6], [0.5, -0.6, 'sineInOut'], [1, 0.6, 'sineInOut']] },
    },
  },
};

export default containerClips;
