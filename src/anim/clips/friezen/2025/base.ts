import type { Clip } from '../../../types.ts';

/**
 * De Stjelp in the rain: the village wind turbine turns, the drizzle keeps
 * coming down the front, a drop falls from the overflowing gutter into the
 * puddle, and the milking robot reaches in under the cow and out again.
 */
const stjelpClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      rotor: { rot: [[0, 0], [1, 120, 'linear']] },
      // The drizzle slides down one gap between drops and starts over, which looks like it never stops.
      rain: { y: [[0, -20], [1, 20, 'linear']], rate: 3 },
      drop: {
        y: [[0, -20], [0.7, 6, 'in'], [0.72, -20, 'hold'], [1, -20, 'hold']],
        sy: [[0, 1], [0.7, 1, 'hold'], [0.72, 0, 'hold'], [0.9, 0, 'hold'], [1, 1]],
        sx: [[0, 1], [0.7, 1, 'hold'], [0.72, 0, 'hold'], [0.9, 0, 'hold'], [1, 1]],
      },
      robot_arm: { x: [[0, 0], [0.3, -6, 'inOut'], [0.6, -6, 'hold'], [0.8, 0, 'inOut'], [1, 0]] },
    },
  },
};

export default stjelpClips;
