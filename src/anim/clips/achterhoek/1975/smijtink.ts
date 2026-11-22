import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The beet is gone from his hand at the throw; he has a fresh one out of the basket for the next. */
const GONE_THEN_BACK: Key[] = [[0, 1], [0.42, 0, 'hold'], [0.84, 0, 'hold'], [1, 1, 'backOut']];

/**
 * Smijtink: weighs a fodder beet in his hand while he waits, stomps along in
 * his boots with the basket bouncing on his back, and throws overhand: arm up
 * past his ear, back to the basket, and over the top.
 */
const smijtink: ClipSet = {
  idle: idle(
    { seconds: 2.4, breathe: 0.035, armSway: 2 },
    {
      // Up, catch, up, catch: is this one heavy enough?
      arm_front: { rot: [[0, 0], [0.14, -9, 'out'], [0.3, 0, 'in'], [0.44, -9, 'out'], [0.6, 0, 'in'], [1, 0, 'hold']] },
      prop: {
        y: [[0, 0], [0.16, -7, 'out'], [0.3, 0, 'in'], [0.46, -7, 'out'], [0.6, 0, 'in'], [1, 0, 'hold']],
        rot: [[0, 0], [0.3, 0, 'hold'], [0.6, 0], [0.8, -10, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.6, 0, 'hold'], [0.75, 5, 'sineInOut'], [0.9, 5, 'hold'], [1, 0, 'sineInOut']],
      },
      basket: { rot: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 40, legSwing: 23, legLen: 38, armSwing: 20, lean: 4, sway: 3.5, headNod: 3 },
    {
      // The beet hand stays ready.
      arm_front: { rot: swing(5, -4) },
      prop: { rot: swing(6) },
      basket: { y: bob(1.8), rot: swing(4) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: {
        x: [[0, 0], [0.26, -4, 'out'], [0.42, 6, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, 2, 'out'], [0.42, -2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.26, -14, 'out'], [0.42, 16, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 8, 'out'], [0.42, -10, 'in'], [1, 0, 'inOut']] },
      // Overhand: the arm goes up in front of him and back behind his head, then whips over the top.
      arm_front: { rot: [[0, 0], [0.26, -205, 'out'], [0.42, -52, 'in'], [0.6, -12, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, -50, 'out'], [0.42, 40, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 7, 'out'], [0.42, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -5, 'out'], [0.42, 12, 'in'], [1, 0, 'inOut']] },
      basket: { rot: [[0, 0], [0.26, -7, 'out'], [0.42, 11, 'in'], [0.62, -4, 'out'], [1, 0, 'inOut']] },
      prop: { sx: GONE_THEN_BACK, sy: GONE_THEN_BACK },
    },
  },

  hit: flinch({
    basket: { rot: [[0, 0], [0.3, -12, 'out'], [0.65, 5, 'inOut'], [1, 0, 'inOut']] },
    prop: { rot: [[0, 0], [0.3, -20, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 62 },
    {
      basket: { y: bob(3), rot: swing(11) },
      // Elbows pumping; his bent arm would otherwise end up in front of his face.
      arm_front: { rot: swing(30, 12) },
      // The beet he was holding stays behind.
      prop: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  ),
};

export default smijtink;
