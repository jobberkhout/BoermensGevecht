import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The container leaves her hand at the throw; she takes the next one off the stack on her back. */
const GONE_THEN_BACK: Key[] = [[0, 1], [0.44, 0, 'hold'], [0.82, 0, 'hold'], [0.9, 1, 'backOut'], [1, 1]];

/**
 * Stapelaar Sjaan. The last human on the quay, in a lifting harness, a stack
 * of parcel-sized containers on her back. Waiting, she weighs the next one on
 * her palm like it is nothing. She throws overhand, the harness doing half the
 * work, then reaches over her shoulder for the next one off the stack.
 */
const stapelaarSjaan: ClipSet = {
  idle: idle(
    { seconds: 2.6, breathe: 0.03, armSway: 0 },
    {
      // Up, catch. Up, catch. Light as a feather.
      arm_front: { rot: [[0, 0], [0.14, -10, 'out'], [0.28, 0, 'in'], [0.42, -10, 'out'], [0.56, 0, 'in'], [1, 0, 'hold']] },
      box: {
        y: [[0, 0], [0.16, -9, 'out'], [0.28, 0, 'in'], [0.44, -9, 'out'], [0.56, 0, 'in'], [1, 0, 'hold']],
        rot: [[0, 0], [0.16, -30, 'out'], [0.28, 0, 'in'], [0.44, 30, 'out'], [0.56, 0, 'in'], [1, 0, 'hold']],
      },
      // A look round at the stack: all there.
      head: {
        y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.62, 0, 'hold'], [0.7, -10, 'inOut'], [0.86, -10, 'hold'], [0.94, 0, 'inOut'], [1, 0]],
      },
      hat: { rot: [[0, 0], [0.62, 0, 'hold'], [0.7, -2, 'inOut'], [0.94, 0, 'inOut'], [1, 0]] },
      stack: { rot: [[0, 0], [0.5, 1, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_back: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 24, legLen: 38, armSwing: 8, lean: 4, sway: 2, headNod: 2 },
    {
      // The box hand stays ready, the other on her hip; the stack sways with every step.
      arm_front: { rot: swing(5, -4) },
      arm_back: { rot: swing(-4, 0) },
      box: { rot: swing(4) },
      stack: { rot: swing(3, 0, 0.15), y: bob(1.2) },
      hat: { rot: bob(1.5) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.44 },
    tracks: {
      hips: {
        x: [[0, 0], [0.26, -4, 'out'], [0.44, 6, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, 2, 'out'], [0.44, -2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.26, -12, 'out'], [0.44, 14, 'in'], [0.66, 6, 'out'], [0.84, -6, 'inOut'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 6, 'out'], [0.44, -8, 'in'], [0.84, -8, 'inOut'], [1, 0, 'inOut']] },
      hat: { rot: [[0, 0], [0.44, 0, 'hold'], [0.5, -6, 'out'], [0.66, 0, 'inOut'], [1, 0]] },
      // Overhand: up in front, back past her ear, and over the top. Then back over the shoulder for the next one.
      arm_front: { rot: [[0, 0], [0.26, -200, 'out'], [0.44, -56, 'in'], [0.62, -16, 'out'], [0.82, -190, 'inOut'], [1, 0, 'inOut']] },
      box: { sx: GONE_THEN_BACK, sy: GONE_THEN_BACK },
      arm_back: { rot: [[0, 0], [0.26, -30, 'out'], [0.44, 30, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 7, 'out'], [0.44, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -5, 'out'], [0.44, 12, 'in'], [1, 0, 'inOut']] },
      stack: { rot: [[0, 0], [0.26, -4, 'out'], [0.44, 6, 'in'], [0.62, -3, 'out'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    stack: { rot: rattle(6, 3) },
    hat: { rot: [[0, 0], [0.25, -12, 'out'], [1, 0, 'inOut']], y: [[0, 0], [0.25, -3, 'out'], [1, 0, 'inOut']] },
    box: { rot: [[0, 0], [0.3, -20, 'out'], [1, 0, 'inOut']] },
    // The hand stays on the hip: she has had worse.
    arm_back: { rot: [[0, 0], [0.3, 6, 'out'], [1, 0, 'inOut']] },
  }),

  // Home, the stack rattling on her back, the box she was holding left behind.
  die: slinkOff(
    { legLen: 38, stride: 62 },
    {
      arm_front: { rot: swing(30, 12) },
      arm_back: { rot: swing(-20, 10) },
      box: { sx: [[0, 0]], sy: [[0, 0]] },
      stack: { y: bob(2.4), rot: swing(6) },
      hat: { rot: bob(3, 4) },
    },
  ),
};

export default stapelaarSjaan;
