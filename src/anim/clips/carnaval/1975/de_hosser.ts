import { bob, flinch, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** Four hops to the loop: up off both feet, and down again on the beat. */
const HOP: Key[] = [
  [0, 0], [0.12, -6, 'out'], [0.25, 0, 'in'],
  [0.37, -6, 'out'], [0.5, 0, 'in'],
  [0.62, -6, 'out'], [0.75, 0, 'in'],
  [0.87, -6, 'out'], [1, 0, 'in'],
];

/** Squashed a little on every landing. */
const LAND: Key[] = [
  [0, 0.96], [0.08, 1.02, 'out'], [0.25, 0.96, 'in'],
  [0.33, 1.02, 'out'], [0.5, 0.96, 'in'],
  [0.58, 1.02, 'out'], [0.75, 0.96, 'in'],
  [0.83, 1.02, 'out'], [1, 0.96, 'in'],
];

/** Fists pumping on every hop. */
const pump = (mid: number, amp: number): Key[] => [
  [0, mid], [0.12, mid - amp, 'out'], [0.25, mid, 'in'],
  [0.37, mid - amp, 'out'], [0.5, mid, 'in'],
  [0.62, mid - amp, 'out'], [0.75, mid, 'in'],
  [0.87, mid - amp, 'out'], [1, mid, 'in'],
];

/**
 * De Hosser: hosses on the spot, up and down with his fists pumping, the
 * beer mats bouncing on his chest. He walks the same way, in hops, and he
 * attacks belly first: a step back, and then the whole belly into the enemy.
 * Beaten, he goes home with his head down and his hands hanging.
 */
const deHosser: ClipSet = {
  idle: {
    loop: true,
    seconds: 1.8,
    tracks: {
      hips: { y: HOP },
      torso: { rot: [[0, -4]], sy: LAND },
      head: { rot: pump(0, -5) },
      // Fists up at chest height: a raised front arm would hide his face.
      arm_front: { rot: pump(-35, 40) },
      arm_back: { rot: pump(-25, 40) },
      leg_front: { rot: pump(0, -6) },
      leg_back: { rot: pump(0, 6) },
    },
  },

  walk: walk(
    { stride: 50, legSwing: 26, legLen: 38, armSwing: 26, lean: -3, sway: 3, headNod: 3 },
    {
      // Not a walk so much as a skip: off the ground at every step.
      hips: { y: [[0, 0], [0.25, -5, 'out'], [0.5, 0, 'in'], [0.75, -5, 'out'], [1, 0, 'in']] },
      torso: { rot: bob(3, -3), sy: [[0, 0.97], [0.12, 1.02, 'out'], [0.5, 0.97, 'in'], [0.62, 1.02, 'out'], [1, 0.97, 'in']] },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // A step back to take a run at it, then the belly goes in.
      hips: {
        x: [[0, 0], [0.3, -6, 'out'], [0.45, 11, 'in'], [0.65, 7, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.3, 2, 'out'], [0.45, -3, 'in'], [0.65, 0, 'out'], [1, 0, 'inOut']],
      },
      torso: {
        rot: [[0, 0], [0.3, 8, 'out'], [0.45, -18, 'in'], [0.65, -12, 'out'], [1, 0, 'inOut']],
        sx: [[0, 1], [0.3, 0.97, 'out'], [0.45, 1.08, 'in'], [0.6, 1, 'out'], [1, 1, 'hold']],
      },
      head: { rot: [[0, 0], [0.3, -6, 'out'], [0.45, 12, 'in'], [0.65, 8, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.3, -30, 'out'], [0.45, 55, 'in'], [0.7, 42, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.3, -24, 'out'], [0.45, 50, 'in'], [0.7, 38, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.3, 6, 'out'], [0.45, -16, 'in'], [0.65, -10, 'out'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.3, -6, 'out'], [0.45, 20, 'in'], [0.65, 12, 'out'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    arm_front: { rot: [[0, 0], [0.3, 24, 'out'], [1, 0, 'inOut']] },
    // The belly takes it, and wobbles.
    torso: {
      rot: [[0, 0], [0.25, -12, 'out'], [1, 0, 'inOut']],
      sx: [[0, 1], [0.25, 0.94, 'out'], [0.55, 1.04, 'sineInOut'], [1, 1, 'sineInOut']],
    },
  }),

  die: slinkOff(
    { legLen: 38, stride: 52 },
    {
      // No more hossen: head down, hands hanging, a slow shuffle home.
      torso: { rot: bob(2, 12) },
      head: { rot: bob(3, 20), y: [[0, 2]] },
      arm_front: { rot: swing(7, 4) },
      arm_back: { rot: swing(-7, 4) },
    },
  ),
};

export default deHosser;
