import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { chatter, rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The trimmer is always on: a fine shiver, many times a cycle. */
const BUZZ: Key[] = [[0, 0], [0.25, 1.4, 'linear'], [0.5, 0, 'linear'], [0.75, -1.4, 'linear'], [1, 0, 'linear']];
/** The buzz lines flicker in and out. */
const FLICKER: Key[] = [[0, 1], [0.5, 0.4, 'hold'], [1, 1, 'hold']];
/** One blink per cycle. */
const BLINK: Key[] = [[0, 1], [0.62, 0.12, 'hold'], [0.66, 1, 'hold'], [1, 1, 'hold']];

/**
 * De Kapbot. A barber robot with four arms: the trimmer, the comb, the mirror,
 * and a fourth for gesturing, because a haircut here comes with the talk, and
 * the talk is the point. Its mouth never stops. It attacks with a quick
 * clean-up of the neckline. Beaten, it walks home still talking.
 */
const kapbot: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.02, armSway: 0 },
    {
      // Telling you all about it, with the free hand.
      mouth: { sy: chatter(0.04, 0.92, 11, 0.5) },
      arm_talk: { rot: [[0, 0], [0.12, -22, 'inOut'], [0.24, -6, 'inOut'], [0.36, -26, 'inOut'], [0.5, 0, 'inOut'], [0.66, -30, 'inOut'], [0.8, -10, 'inOut'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.2, -5, 'inOut'], [0.5, 3, 'inOut'], [0.8, -4, 'inOut'], [1, 0, 'inOut']], y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      eyes: { sy: BLINK },
      // Meanwhile the other hands keep working: a flick of the comb, the mirror turned to show the back.
      arm_comb: { rot: [[0, 0], [0.4, 0, 'hold'], [0.46, -18, 'out'], [0.52, 0, 'in'], [0.58, -18, 'out'], [0.64, 0, 'in'], [1, 0]] },
      arm_back: { rot: [[0, 0], [0.5, 8, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: [[0, -6], [0.5, -2, 'sineInOut'], [1, -6, 'sineInOut']] },
      trimmer: { y: BUZZ, rate: 14 },
      buzz: { sx: FLICKER, sy: FLICKER, rate: 7 },
      pole: { rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 24, legLen: 37, armSwing: 14, lean: 3, sway: 1.5, headNod: 2 },
    {
      // Even on the way, it is still talking.
      mouth: { sy: chatter(0, 1, 6, 0.5) },
      arm_talk: { rot: swing(-16, -10), rate: 2 },
      arm_comb: { rot: swing(12) },
      arm_back: { rot: swing(-6, 4) },
      trimmer: { y: BUZZ, rate: 10 },
      buzz: { sx: FLICKER, sy: FLICKER, rate: 6 },
      pole: { rot: swing(4, 0, 0.25) },
      eyes: { sy: BLINK },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: { x: [[0, 0], [0.25, -3, 'out'], [0.45, 7, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.25, -8, 'out'], [0.45, 14, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.25, 5, 'out'], [0.45, -10, 'in'], [1, 0, 'inOut']] },
      // The neckline: trimmer up and back, then one clean stroke down the front.
      arm_front: { rot: [[0, 0], [0.25, -46, 'out'], [0.45, 40, 'in'], [0.66, 26, 'out'], [1, 0, 'inOut']] },
      trimmer: { rot: [[0, 0], [0.25, -20, 'out'], [0.45, 24, 'in'], [1, 0, 'inOut']], y: rattle(2, 8) },
      buzz: { sx: [[0, 1], [0.4, 1, 'hold'], [0.46, 2.2, 'out'], [0.8, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.4, 1, 'hold'], [0.46, 2.2, 'out'], [0.8, 1, 'inOut'], [1, 1]] },
      // The comb goes in first, the mirror is held up after: "and the back?"
      arm_comb: { rot: [[0, 0], [0.2, -26, 'out'], [0.42, 10, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.5, 0, 'hold'], [0.66, 18, 'out'], [0.86, 18, 'hold'], [1, 0, 'inOut']] },
      arm_talk: { rot: [[0, 0], [0.25, 18, 'out'], [0.45, -24, 'in'], [1, 0, 'inOut']] },
      mouth: { sy: chatter(0.5, 1, 3, 0.5) },
      leg_front: { rot: [[0, 0], [0.25, 6, 'out'], [0.45, -18, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.25, -4, 'out'], [0.45, 12, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    eyes: { sx: [[0, 1], [0.2, 1.4, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.2, 0.3, 'out'], [1, 1, 'inOut']] },
    pole: { rot: rattle(14, 3) },
    arm_talk: { rot: [[0, 0], [0.3, -30, 'out'], [1, 0, 'inOut']] },
    mouth: { sy: [[0, 0.5], [0.2, 1.6, 'out'], [1, 0.5, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 37, stride: 66 },
    {
      // Off home, and still talking, now to nobody.
      mouth: { sy: chatter(0, 1, 8, 0.5) },
      arm_talk: { rot: swing(-24, -20), rate: 2 },
      arm_comb: { rot: swing(20, 40) },
      arm_back: { rot: swing(10, 50) },
      // The trimmer hangs, switched off.
      arm_front: { rot: swing(10, 34), rate: 2 },
      trimmer: { rot: [[0, 40]] },
      buzz: { sx: [[0, 0]], sy: [[0, 0]] },
      pole: { rot: bob(6, -10) },
      eyes: { sy: [[0, 0.4]], y: [[0, 1]] },
    },
  ),
};

export default kapbot;
