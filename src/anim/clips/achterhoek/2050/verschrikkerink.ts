import { bob, flinch, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** The eye's glow breathing. */
const PULSE: Key[] = [[0, 1], [0.5, 1.28, 'sineInOut'], [1, 1, 'sineInOut']];
const pulse = (rate: number): Track => ({ sx: PULSE, sy: PULSE, rate });
/** The head on its spring, settling after a jolt. */
const BOING: Key[] = [[0, 0], [0.12, -16, 'out'], [0.3, 11, 'sineInOut'], [0.5, -7, 'sineInOut'], [0.72, 4, 'sineInOut'], [1, 0, 'sineInOut']];

/**
 * Verschrikkerink: a scarecrow that walks. Stiff as the pole he hangs on, arms
 * out, head panning like a security camera. To shoot he tips his head back, the
 * eye charges up and fires, and the head bobbles on its spring afterwards.
 */
const verschrikkerink: ClipSet = {
  idle: {
    loop: true,
    seconds: 3,
    tracks: {
      torso: { rot: swing(1.6) },
      // Looks left, holds, looks right, holds.
      head: {
        rot: [[0, -7], [0.1, -7, 'hold'], [0.4, 8, 'sineInOut'], [0.6, 8, 'hold'], [0.9, -7, 'sineInOut'], [1, -7]],
        y: [[0, 0], [0.4, 0, 'hold'], [0.45, -2, 'out'], [0.52, 0, 'in'], [0.9, 0, 'hold'], [0.95, -2, 'out'], [1, 0, 'in']],
      },
      glow: pulse(4),
      // The sleeves creak in the wind.
      arm_front: { rot: swing(3, 0, 0.1) },
      arm_back: { rot: swing(3, 0, 0.35) },
    },
  },

  walk: walk(
    { stride: 40, legSwing: 21, legLen: 38, armSwing: 5, lean: 2, sway: 5, headNod: 5 },
    {
      // No elbows, no knees worth the name: everything rocks from side to side instead.
      arm_front: { rot: swing(6, -2) },
      arm_back: { rot: swing(6, 2) },
      head: { rot: bob(-5), y: bob(-1.6) },
      glow: pulse(2),
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      hips: { x: [[0, 0], [0.3, -3, 'out'], [0.4, 3, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.3, -7, 'out'], [0.4, 6, 'in'], [0.6, -2, 'out'], [1, 0, 'inOut']] },
      // The head tips back while the eye charges, snaps forward, then bobbles.
      head: {
        rot: [[0, 0], [0.3, -13, 'out'], [0.4, 9, 'in'], [0.52, -8, 'sineInOut'], [0.66, 6, 'sineInOut'], [0.8, -3, 'sineInOut'], [1, 0, 'sineInOut']],
        y: [[0, 0], [0.4, 0, 'hold'], [0.46, -3, 'out'], [0.56, 1, 'sineInOut'], [0.7, 0, 'sineInOut'], [1, 0]],
      },
      glow: {
        sx: [[0, 1], [0.34, 1.7, 'in'], [0.4, 2.3, 'out'], [0.5, 0.5, 'out'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.34, 1.7, 'in'], [0.4, 2.3, 'out'], [0.5, 0.5, 'out'], [1, 1, 'inOut']],
      },
      // The recoil throws his arms up.
      arm_front: { rot: [[0, 0], [0.3, 5, 'out'], [0.44, -24, 'out'], [0.7, 4, 'inOut'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.3, -5, 'out'], [0.44, 24, 'out'], [0.7, -4, 'inOut'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.3, 4, 'out'], [0.4, -6, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    head: { rot: BOING },
    arm_front: { rot: [[0, 0], [0.3, -22, 'out'], [1, 0, 'inOut']] },
    arm_back: { rot: [[0, 0], [0.3, 22, 'out'], [1, 0, 'inOut']] },
    glow: { sx: [[0, 1], [0.2, 0.3, 'hold'], [0.5, 1.4, 'hold'], [0.7, 0.3, 'hold'], [1, 1, 'hold']], sy: [[0, 1], [0.2, 0.3, 'hold'], [0.5, 1.4, 'hold'], [0.7, 0.3, 'hold'], [1, 1, 'hold']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 56 },
    {
      // Arms flapping like the crows he was built to scare.
      arm_front: { rot: swing(24, 4) },
      arm_back: { rot: swing(-24, 20) },
      torso: { rot: bob(4, 12) },
      head: { rot: bob(8, 10), y: bob(-2.5) },
      // The eye has gone dim.
      glow: { sx: [[0, 0.35]], sy: [[0, 0.35]] },
    },
  ),
};

export default verschrikkerink;
