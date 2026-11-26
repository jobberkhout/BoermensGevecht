import type { Clip, Key } from '../../../types.ts';

/** The beacon on the crane's cab flashes twice a cycle. */
const FLASH: Key[] = [[0, 1], [0.1, 1.5, 'out'], [0.2, 1, 'in'], [0.5, 1, 'hold'], [0.6, 1.5, 'out'], [0.7, 1, 'in'], [1, 1, 'hold']];

/**
 * De Stapel. A tower of containers and tipped cubes on a pontoon: the water
 * laps at its foot, and up on the roof the little quay crane, the last one that
 * still does anything, lets its one container swing while its beacon flashes.
 */
const base: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      load: { rot: [[0, -3], [0.5, 3, 'sineInOut'], [1, -3, 'sineInOut']] },
      beacon: { sx: FLASH, sy: FLASH },
      ripple: { x: [[0, -3], [0.5, 3, 'sineInOut'], [1, -3, 'sineInOut']] },
    },
  },
};

export default base;
