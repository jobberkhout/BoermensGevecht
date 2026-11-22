import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/** The plane leaves his fingers at the hit; the next one is folded before he is upright again. */
const NEXT_PLANE: Key[] = [[0, 1], [0.44, 0, 'hold'], [0.84, 0, 'hold'], [1, 1, 'backOut']];

/**
 * Mr. Declarabel: walks in small stately steps under his gown, the stopwatch
 * swinging on its cord, and sends every invoice off as a paper plane with a
 * flick from the shoulder. The pile on his far arm never gets any smaller.
 */
const mrDeclarabel: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.02, armSway: 1 },
    {
      // Every few seconds he looks down at the stopwatch. It is still running.
      head: { rot: [[0, 0], [0.5, 0, 'hold'], [0.62, 15, 'inOut'], [0.84, 15, 'hold'], [1, 0, 'inOut']] },
      watch: { rot: [[0, -4], [0.5, 4, 'sineInOut'], [1, -4, 'sineInOut']] },
      arm_back: { rot: STILL },
      // Meanwhile the plane taps the air: he is aiming already.
      arm_front: { rot: [[0, 0], [0.12, -6, 'sineInOut'], [0.24, 0, 'sineInOut'], [0.36, -6, 'sineInOut'], [0.48, 0, 'sineInOut'], [1, 0]] },
    },
  ),

  walk: walk(
    { stride: 48, legSwing: 20, legLen: 38, armSwing: 4, lean: 2, sway: 1.5, headNod: 1.5 },
    {
      arm_back: { rot: STILL },
      arm_front: { rot: swing(4, -4) },
      watch: { rot: swing(10) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.44 },
    tracks: {
      hips: { x: [[0, 0], [0.28, -4, 'out'], [0.44, 5, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.28, -10, 'out'], [0.44, 12, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, 6, 'out'], [0.44, -6, 'in'], [1, 0, 'inOut']] },
      // Up beside his chin, then a chop forward: the invoice is on its way.
      arm_front: { rot: [[0, 0], [0.28, -26, 'out'], [0.44, 26, 'in'], [0.62, 34, 'out'], [1, 0, 'inOut']] },
      prop: { rot: [[0, 0], [0.28, 20, 'out'], [0.44, 0, 'in'], [1, 0]], sx: NEXT_PLANE, sy: NEXT_PLANE },
      arm_back: { rot: STILL },
      watch: { rot: [[0, 0], [0.28, 16, 'out'], [0.44, -24, 'in'], [0.7, 10, 'inOut'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 5, 'out'], [0.44, -9, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -4, 'out'], [0.44, 7, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    arm_back: { rot: [[0, 0], [0.3, 5, 'out'], [1, 0, 'inOut']] },
    watch: { rot: [[0, 0], [0.3, 28, 'out'], [0.65, -10, 'inOut'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 58 },
    {
      // He gathers the pile and leaves. There is nothing in his hand: the last invoice has been sent.
      arm_back: { rot: bob(3, -6) },
      arm_front: { rot: swing(8, 26) },
      prop: { sx: STILL, sy: STILL },
      watch: { rot: swing(22, -16) },
    },
  ),
};

export default mrDeclarabel;
