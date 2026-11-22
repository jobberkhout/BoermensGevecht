import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Padel-Pepijn: bounces on his toes, jogs with his racket held high, and
 * finishes every argument with an overhead smash.
 */
const padelPepijn: ClipSet = {
  idle: idle(
    { seconds: 0.9, breathe: 0.02, armSway: 4 },
    {
      // Never stands still: a little bounce, the racket ticking like a metronome.
      hips: { y: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      leg_front: { rot: [[0, 0], [0.5, -5, 'sineInOut'], [1, 0, 'sineInOut']] },
      leg_back: { rot: [[0, 0], [0.5, 5, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: [[0, -38], [0.5, -46, 'sineInOut'], [1, -38, 'sineInOut']] },
      prop: { rot: [[0, 12], [0.5, 30, 'sineInOut'], [1, 12, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 58, legSwing: 34, legLen: 38, armSwing: 32, lean: 9, sway: 2, headNod: 2 },
    {
      // The racket arm stays up and ready.
      arm_front: { rot: swing(10, -52) },
      prop: { rot: swing(8, 22) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.43 },
    tracks: {
      hips: {
        x: [[0, 0], [0.28, -4, 'out'], [0.43, 7, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.28, 3, 'out'], [0.43, -3, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.28, -10, 'out'], [0.43, 16, 'in'], [0.7, 8, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, 6, 'out'], [0.43, -8, 'in'], [1, 0, 'inOut']] },
      // A forehand: the racket is cocked back behind his hip, then whips through at chest height.
      arm_front: { rot: [[0, -38], [0.28, 75, 'out'], [0.43, -78, 'in'], [0.6, -112, 'out'], [1, -38, 'inOut']] },
      prop: { rot: [[0, 12], [0.28, -150, 'out'], [0.43, 22, 'in'], [0.6, 40, 'out'], [1, 12, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.28, -36, 'out'], [0.43, 40, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 8, 'out'], [0.43, -20, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -6, 'out'], [0.43, 16, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    prop: { rot: [[0, 0], [0.3, 26, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 72 },
    {
      // He keeps hold of the racket, whatever happens, and shelters under it.
      arm_front: { rot: swing(22, -150) },
      prop: { rot: swing(24, 24) },
      head: { rot: bob(4, 10) },
    },
  ),
};

export default padelPepijn;
