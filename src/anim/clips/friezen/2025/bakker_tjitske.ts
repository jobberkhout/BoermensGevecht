import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The loaf in her hand: gone the moment it leaves, and a fresh one out of the basket near the end. */
const LOAF: Key[] = [[0, 1], [0.44, 1, 'hold'], [0.46, 0, 'hold'], [0.86, 0, 'hold'], [1, 1, 'backOut']];

/**
 * Bakker Tjitske: shows off the loaf in her hand while she waits, the basket
 * swinging on her other arm. She lobs it underhand, high and sticky, and takes
 * the next one from the basket.
 */
const bakkerTjitske: ClipSet = {
  idle: idle(
    { seconds: 3, breathe: 0.03, armSway: 0 },
    {
      // She lifts the loaf a little, admires it, and lifts it again.
      arm_front: { rot: [[0, 0], [0.3, -10, 'sineInOut'], [0.55, -10, 'hold'], [0.8, 0, 'sineInOut'], [1, 0]] },
      head: { rot: [[0, 0], [0.3, 6, 'sineInOut'], [0.55, 6, 'hold'], [0.8, 0, 'sineInOut'], [1, 0]], y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_back: { rot: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      basket: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 24, legLen: 38, armSwing: 8, lean: 4, sway: 2, headNod: 2 },
    {
      arm_front: { rot: swing(5, -2) },
      basket: { rot: swing(10, 0) },
      head: { rot: bob(-2, 2) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // Back with the loaf, and an underhand lob up and over the front line.
      torso: { rot: [[0, 0], [0.26, -8, 'out'], [0.45, 10, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      hips: { x: [[0, 0], [0.26, -3, 'out'], [0.45, 3, 'in'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, -6, 'out'], [0.45, -10, 'in'], [0.7, -6, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, 75, 'out'], [0.45, -40, 'in'], [0.62, -58, 'out'], [1, 0, 'inOut']] },
      loaf: { sx: LOAF, sy: LOAF },
      // The basket arm dips for the next one.
      arm_back: { rot: [[0, 0], [0.45, 0, 'hold'], [0.7, -12, 'inOut'], [1, 0, 'inOut']] },
      basket: { rot: [[0, 0], [0.45, 6, 'out'], [0.7, -8, 'inOut'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 4, 'out'], [0.45, -10, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -3, 'out'], [0.45, 8, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    basket: { rot: rattle(10, 3) },
    loaf: { rot: rattle(12, 3) },
  }),

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // Home with the empty basket over her head against the rain.
      arm_back: { rot: swing(3, -170), y: [[0, -2]] },
      basket: { rot: [[0, 180]] },
      loaf: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  ),
};

export default bakkerTjitske;
