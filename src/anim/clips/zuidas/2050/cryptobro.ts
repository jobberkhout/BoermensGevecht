import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

const GONE: Key[] = [[0, 0]];

/** A coin flipped while walking: up at each step, back in the fingers between them. */
const TOSS: Key[] = [[0, 0], [0.25, -6, 'out'], [0.5, 0, 'in'], [0.75, -6, 'out'], [1, 0, 'in']];
/** It goes up a little forward of his nose, not into it. */
const CLEAR: Key[] = [[0, 0], [0.25, 3, 'out'], [0.5, 0, 'in'], [0.75, 3, 'out'], [1, 0, 'in']];

/**
 * The Cryptobro. One hand flips a coin of his own making, the other holds the
 * price. The coin has a habit of being gone before it lands, which he takes
 * well: there is always a next one. He does not throw so much as flick. Beaten,
 * he runs home with the glasses down his nose and the chart upside down.
 */
const cryptobro: ClipSet = {
  idle: idle(
    { seconds: 3.4, breathe: 0.03, armSway: 0 },
    {
      // Flip. It spins, and at the top it is simply not there any more.
      arm_front: { rot: [[0, 0], [0.08, 9, 'in'], [0.16, -14, 'out'], [0.32, 0, 'inOut'], [0.84, 0, 'hold'], [0.9, -8, 'out'], [1, 0, 'inOut']] },
      coin: {
        y: [[0, 0], [0.08, 3, 'in'], [0.36, -30, 'out'], [0.8, 0, 'hold'], [1, 0]],
        sx: [[0, 1], [0.1, 1, 'hold'], [0.15, 0.1, 'sineInOut'], [0.2, 1, 'sineInOut'], [0.25, 0.1, 'sineInOut'], [0.3, 1, 'sineInOut'], [0.35, 0.1, 'sineInOut'], [0.39, 0, 'in'], [0.84, 0, 'hold'], [0.9, 1, 'backOut'], [1, 1]],
        sy: [[0, 1], [0.34, 1, 'hold'], [0.39, 0, 'in'], [0.84, 0, 'hold'], [0.9, 1, 'backOut'], [1, 1]],
      },
      // What is left of it drifts off.
      bits: {
        y: [[0, 0], [0.08, 3, 'in'], [0.36, -30, 'out'], [0.56, -40, 'out'], [0.8, 0, 'hold'], [1, 0]],
        sx: [[0, 1], [0.34, 1, 'hold'], [0.42, 2.4, 'out'], [0.56, 0, 'in'], [0.86, 0, 'hold'], [0.94, 1, 'out'], [1, 1]],
        sy: [[0, 1], [0.34, 1, 'hold'], [0.42, 2.4, 'out'], [0.56, 0, 'in'], [0.86, 0, 'hold'], [0.94, 1, 'out'], [1, 1]],
      },
      // He watches it go up, looks at the empty air, then at the price, and feels better.
      head: {
        rot: [[0, 0], [0.12, 0, 'hold'], [0.3, -14, 'out'], [0.48, -14, 'hold'], [0.58, 12, 'inOut'], [0.8, 12, 'hold'], [0.9, 0, 'inOut'], [1, 0]],
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      arm_back: { rot: [[0, 0], [0.5, 0, 'hold'], [0.6, -9, 'inOut'], [0.8, -9, 'hold'], [0.9, 0, 'inOut'], [1, 0]] },
    },
  ),

  walk: walk(
    { stride: 44, legSwing: 24, legLen: 38, armSwing: 0, lean: 3, sway: 2, headNod: 0 },
    {
      // Eyes on the phone, the coin going up and down by itself.
      head: { rot: bob(2, 9) },
      arm_back: { rot: swing(3, -5), rate: 2 },
      arm_front: { rot: [[0, 0], [0.2, -5, 'out'], [0.5, 2, 'in'], [0.7, -5, 'out'], [1, 2, 'in']] },
      coin: { y: TOSS, x: CLEAR, sx: [[0, 1], [0.12, 0.2, 'sineInOut'], [0.25, 1, 'sineInOut'], [0.38, 0.2, 'sineInOut'], [0.5, 1, 'sineInOut'], [0.62, 0.2, 'sineInOut'], [0.75, 1, 'sineInOut'], [0.88, 0.2, 'sineInOut'], [1, 1, 'sineInOut']] },
      bits: { y: TOSS, x: CLEAR },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: { x: [[0, 0], [0.24, -3, 'out'], [0.42, 5, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.24, -9, 'out'], [0.42, 12, 'in'], [0.7, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, 5, 'out'], [0.42, -7, 'in'], [1, 0, 'inOut']] },
      // Drawn back to the chest, then flicked off the thumb. The hand kicks up after it.
      arm_front: {
        rot: [[0, 0], [0.24, 16, 'out'], [0.42, -10, 'in'], [0.56, -32, 'out'], [1, 0, 'inOut']],
        x: [[0, 0], [0.24, -7, 'out'], [0.42, 9, 'in'], [0.7, 3, 'out'], [1, 0, 'inOut']],
      },
      // Gone from his fingers at the marker; the next one is there before he is ready again.
      coin: {
        sx: [[0, 1], [0.42, 0, 'hold'], [0.84, 0, 'hold'], [0.93, 1, 'backOut'], [1, 1]],
        sy: [[0, 1], [0.42, 0, 'hold'], [0.84, 0, 'hold'], [0.93, 1, 'backOut'], [1, 1]],
      },
      bits: {
        sx: [[0, 1], [0.36, 1, 'hold'], [0.46, 2, 'out'], [0.62, 0, 'in'], [0.88, 0, 'hold'], [0.97, 1, 'out'], [1, 1]],
        sy: [[0, 1], [0.36, 1, 'hold'], [0.46, 2, 'out'], [0.62, 0, 'in'], [0.88, 0, 'hold'], [0.97, 1, 'out'], [1, 1]],
      },
      arm_back: { rot: [[0, 0], [0.24, 7, 'out'], [0.42, -6, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.24, 6, 'out'], [0.42, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.42, 10, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    // The glasses hop, and for a moment he does not look so sure.
    shades: { y: [[0, 0], [0.3, -6, 'out'], [1, 0, 'in']], rot: [[0, 0], [0.3, -12, 'out'], [1, 0, 'inOut']] },
    arm_back: { rot: [[0, 0], [0.3, -10, 'out'], [1, 0, 'inOut']] },
    arm_front: { rot: [[0, 0], [0.3, -18, 'out'], [1, 0, 'inOut']] },
    coin: { y: [[0, 0], [0.3, -7, 'out'], [1, 0, 'in']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // No coin left. He holds the phone up as he runs: the line on it now points the other way.
      torso: { rot: bob(3, 13) },
      head: { rot: bob(4, 6) },
      shades: { y: [[0, 5.6]], rot: [[0, 12]] },
      arm_back: { rot: swing(5, -34), rate: 2 },
      chart: { sy: [[0, -1]] },
      arm_front: { rot: swing(34, 46) },
      coin: { sx: GONE, sy: GONE },
      bits: { sx: GONE, sy: GONE },
    },
  ),
};

export default cryptobro;
