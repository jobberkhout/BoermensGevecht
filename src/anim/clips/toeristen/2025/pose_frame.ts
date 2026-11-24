import type { Clip, Key } from '../../../types.ts';

/** On, off: the record dot blinks once a second. */
const BLINK: Key[] = [[0, 1], [0.5, 1, 'hold'], [0.56, 0.05, 'in'], [0.94, 0.05, 'hold'], [1, 1, 'out']];

/** The frame over the head of whoever is posing for Ivy: it breathes a little, and the dot blinks. */
const poseFrame: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 1,
    tracks: {
      frame: { sx: [[0, 1], [0.5, 1.05, 'sineInOut'], [1, 1, 'sineInOut']], sy: [[0, 1], [0.5, 1.05, 'sineInOut'], [1, 1, 'sineInOut']] },
      dot: { sx: BLINK, sy: BLINK },
    },
  },
};

export default poseFrame;
