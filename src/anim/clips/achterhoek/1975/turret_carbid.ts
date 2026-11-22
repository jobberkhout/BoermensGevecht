import { rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/**
 * The drawing shows the bang itself: flash at the mouth, lid in mid-flight.
 * These put the lid back on the churn, where it is the rest of the time.
 */
const LID_X: Key[] = [[0, -24]];
const LID_Y: Key[] = [[0, 12.4]];
const LID_ROT: Key[] = [[0, -30]];
const HIDDEN: Key[] = [[0, 0]];

const TALLER: Key[] = [[0, 1], [0.5, 1.3, 'sineInOut'], [1, 1, 'sineInOut']];
const THINNER: Key[] = [[0, 1], [0.5, 0.82, 'sineInOut'], [1, 1, 'sineInOut']];

/**
 * Carbidschieten. While nothing is in range the one with the stick keeps
 * bringing the flame up to the touch-hole and losing his nerve, and the other
 * one, fingers in his ears, ducks every single time. When the turret fires it
 * goes off for real: flash, smoke, the lid is gone and both of them jump.
 */
const carbidClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      lid: { x: LID_X, y: LID_Y, rot: LID_ROT },
      flash: { sx: HIDDEN, sy: HIDDEN },
      smoke: { sx: HIDDEN, sy: HIDDEN },
      // Up it comes... nearly... and down again.
      a_arm: { rot: [[0, 30], [0.3, 26, 'sineInOut'], [0.52, 5, 'inOut'], [0.63, 7, 'sineInOut'], [0.74, 32, 'out'], [1, 30, 'sineInOut']] },
      a_body: { rot: [[0, -3], [0.3, -2, 'sineInOut'], [0.52, 6, 'inOut'], [0.63, 5, 'sineInOut'], [0.74, -5, 'out'], [1, -3, 'sineInOut']] },
      a_head: { rot: [[0, 0], [0.52, 5, 'inOut'], [0.74, -6, 'out'], [1, 0, 'sineInOut']] },
      flame: { sy: TALLER, sx: THINNER, rot: [[0, -8], [0.5, 8, 'sineInOut'], [1, -8, 'sineInOut']], rate: 9 },
      // His elbow shivers all the time, and he ducks away whenever the flame gets close.
      b_body: { rot: [[0, -3], [0.36, -3, 'hold'], [0.52, -13, 'inOut'], [0.66, -12, 'sineInOut'], [0.8, -3, 'inOut'], [1, -3, 'hold']] },
      b_head: { rot: [[0, 0], [0.36, 0, 'hold'], [0.52, 9, 'inOut'], [0.66, 8, 'sineInOut'], [0.8, 0, 'inOut'], [1, 0, 'hold']] },
      b_arm: { rot: [[0, 0], [0.5, 3, 'linear'], [1, 0, 'linear']], rate: 12 },
    },
  },

  attack: {
    loop: false,
    seconds: 0.6,
    tracks: {
      // The clip starts at the bang.
      flash: {
        sx: [[0, 1.2], [0.1, 1, 'out'], [0.28, 0, 'in'], [1, 0, 'hold']],
        sy: [[0, 1.2], [0.1, 1, 'out'], [0.28, 0, 'in'], [1, 0, 'hold']],
        rot: [[0, 0], [0.28, 30, 'linear'], [1, 30, 'hold']],
      },
      smoke: {
        sx: [[0, 0.5], [0.25, 1.1, 'out'], [0.7, 1.3, 'linear'], [1, 0, 'in']],
        sy: [[0, 0.5], [0.25, 1.1, 'out'], [0.7, 1.3, 'linear'], [1, 0, 'in']],
        x: [[0, 8], [1, -8, 'out']],
        y: [[0, 10], [1, -10, 'out']],
      },
      // The lid is the projectile now. A new one goes on just before the next shot.
      lid: {
        x: LID_X,
        y: LID_Y,
        rot: LID_ROT,
        sx: [[0, 0], [0.82, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 0], [0.82, 0, 'hold'], [1, 1, 'backOut']],
      },
      churn: {
        x: [[0, 0], [0.12, -7, 'out'], [0.5, 0, 'inOut'], [1, 0, 'hold']],
        rot: [[0, 0], [0.12, -8, 'out'], [0.4, 2, 'inOut'], [0.65, 0, 'inOut'], [1, 0, 'hold']],
      },
      a_body: {
        y: [[0, 0], [0.2, -10, 'out'], [0.45, 0, 'in'], [1, 0, 'hold']],
        x: [[0, 0], [0.25, -6, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.2, -13, 'out'], [1, -3, 'inOut']],
      },
      a_arm: { rot: [[0, 0], [0.2, -75, 'out'], [0.55, -20, 'inOut'], [1, 30, 'inOut']] },
      a_head: { rot: [[0, 0], [0.2, -12, 'out'], [1, 0, 'inOut']] },
      flame: { sy: TALLER, sx: THINNER, rate: 4 },
      b_body: {
        y: [[0, 0], [0.18, -12, 'out'], [0.42, 0, 'in'], [1, 0, 'hold']],
        x: rattle(2, 6),
        rot: [[0, -3], [0.18, -15, 'out'], [0.55, -6, 'inOut'], [1, -3, 'inOut']],
      },
      b_head: { rot: [[0, 0], [0.18, 10, 'out'], [1, 0, 'inOut']] },
      b_arm: { rot: [[0, 0], [0.18, -8, 'out'], [1, 0, 'inOut']] },
    },
  },
};

export default carbidClips;
