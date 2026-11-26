import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The band's glow: steady, then a blink of green when it is scanned. */
const SCAN: Key[] = [[0, 1], [0.3, 1, 'hold'], [0.36, 1.6, 'out'], [0.42, 1, 'in'], [0.48, 1.6, 'out'], [0.56, 1, 'in'], [1, 1, 'hold']];

/**
 * De Tijdslot-hosser. Carnival in 2050 comes with a time slot: the kiel is
 * smart and its emblems glow, the band on his wrist lets him in, and his beer
 * hangs on a chain round his neck, alcohol-free, so nobody swaps it. Standing,
 * he checks his band (it blinks green: still his slot) and hosses on the spot
 * with joy. He walks out hossing, one arm in the air. He fights belly first,
 * and the bottle swings out on its chain and gets there first. Beaten, he
 * slinks home with the cap drooping: slot over.
 */
const tijdslotHosser: ClipSet = {
  idle: idle(
    { seconds: 2.8, breathe: 0.03, armSway: 2 },
    {
      // The wrist comes up to the eyes, the band blinks: still his slot. Then two happy hops.
      arm_front: { rot: [[0, 0], [0.12, 0, 'hold'], [0.26, -44, 'inOut'], [0.54, -44, 'hold'], [0.64, 0, 'inOut'], [1, 0]] },
      head: { rot: [[0, 0], [0.14, 0, 'hold'], [0.26, 10, 'inOut'], [0.54, 10, 'hold'], [0.64, -4, 'inOut'], [0.8, 0, 'inOut'], [1, 0]] },
      band_glow: { sx: SCAN, sy: SCAN },
      hips: { y: [[0, 0], [0.66, 0, 'hold'], [0.72, -4, 'out'], [0.78, 0, 'in'], [0.84, -4, 'out'], [0.9, 0, 'in'], [1, 0]] },
      cap: { rot: [[0, 0], [0.68, 0, 'hold'], [0.75, -7, 'out'], [0.82, 5, 'inOut'], [0.9, -4, 'inOut'], [1, 0, 'inOut']] },
      beer: { rot: [[0, 0], [0.68, 0, 'hold'], [0.76, 10, 'out'], [0.86, -8, 'inOut'], [0.94, 4, 'inOut'], [1, 0, 'inOut']] },
    },
  ),

  // Hossing his way to the front: a bounce in every step, the far arm flung up behind him.
  walk: walk(
    { stride: 48, legSwing: 26, legLen: 38, armSwing: 12, lean: 2, sway: 2.5, headNod: 3 },
    {
      hips: { y: bob(-3.4) },
      arm_back: { rot: [[0, 118], [0.25, 136, 'out'], [0.5, 118, 'in'], [0.75, 136, 'out'], [1, 118, 'in']] },
      arm_front: { rot: swing(-10, -6) },
      beer: { rot: swing(9), rate: 2 },
      cap: { rot: bob(5), y: bob(-1.2) },
    },
  ),

  // Belly first, and the bottle on its chain swings out ahead of him.
  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: {
        x: [[0, 0], [0.28, -4, 'out'], [0.45, 8, 'in'], [0.7, 3, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.28, 2, 'out'], [0.4, -4, 'in'], [0.5, 0, 'in'], [1, 0]],
      },
      torso: { rot: [[0, 0], [0.28, 10, 'out'], [0.45, -9, 'in'], [0.7, -4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, -6, 'out'], [0.45, 8, 'in'], [1, 0, 'inOut']] },
      beer: { rot: [[0, 0], [0.28, 34, 'out'], [0.45, -80, 'in'], [0.6, -64, 'out'], [0.8, 14, 'inOut'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.28, 30, 'out'], [0.45, 50, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.28, -20, 'out'], [0.45, 40, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 6, 'out'], [0.45, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -4, 'out'], [0.45, 14, 'in'], [1, 0, 'inOut']] },
      cap: { rot: [[0, 0], [0.45, 0, 'hold'], [0.52, -14, 'out'], [0.7, 8, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    beer: { rot: [[0, 0], [0.3, 34, 'out'], [0.7, -10, 'inOut'], [1, 0, 'inOut']] },
    cap: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
    band_glow: { sx: [[0, 1], [0.2, 0, 'hold'], [0.5, 1, 'hold'], [1, 1]], sy: [[0, 1], [0.2, 0, 'hold'], [0.5, 1, 'hold'], [1, 1]] },
  }),

  // Slot over: home with the cap drooping and the band gone dark.
  die: slinkOff(
    { legLen: 38, stride: 66 },
    {
      cap: { rot: [[0, 16], [0.5, 10, 'sineInOut'], [1, 16, 'sineInOut']] },
      beer: { rot: swing(14, 20), rate: 2 },
      band_glow: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  ),
};

export default tijdslotHosser;
