import { swing } from '../../../humanoid.ts';
import type { Clip, Key } from '../../../types.ts';

/** A puff of steam: it swells out of the spout, rises and is gone. */
const RISE: Key[] = [[0, 0.2], [0.6, 1, 'out'], [1, 0.2, 'in']];

/**
 * De Sleep-in: someone is still asleep in the green tent at noon and wiggles
 * their toes now and then; the kettle on the camping stove never stops
 * steaming, and the sleeping bag airs out on the roof.
 */
const sleepInClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      feet: {
        rot: [[0, 0], [0.5, 0, 'hold'], [0.56, -10, 'out'], [0.62, 4, 'inOut'], [0.68, -8, 'inOut'], [0.76, 0, 'inOut'], [1, 0, 'hold']],
      },
      washing: { rot: swing(0.8), y: [[0, 0], [0.5, 1, 'sineInOut'], [1, 0, 'sineInOut']] },
      steam: { sx: RISE, sy: RISE, x: [[0, 0], [1, -6, 'out']], y: [[0, 0], [1, -16, 'linear']], rate: 2 },
    },
  },
};

export default sleepInClips;
