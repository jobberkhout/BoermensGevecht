import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/**
 * De Gastvrouw: the stack of msemen on one arm, a flat house slipper in the
 * other hand. Nobody leaves her house hungry. She waggles the slipper while
 * she waits, and brings it down with a smack on whoever is in front of her.
 * The stack stays level through all of it.
 */
const deGastvrouw: ClipSet = {
  idle: idle(
    { seconds: 2.4, breathe: 0.03, armSway: 0 },
    {
      // The slipper wags like a finger: go on, eat something.
      arm_front: { rot: [[0, 0], [0.12, -10, 'inOut'], [0.24, 4, 'inOut'], [0.36, -10, 'inOut'], [0.48, 0, 'inOut'], [1, 0]] },
      slipper: { rot: [[0, 0], [0.12, -8, 'inOut'], [0.24, 6, 'inOut'], [0.36, -8, 'inOut'], [0.48, 0, 'inOut'], [1, 0]] },
      arm_back: { rot: STILL },
      head: { rot: [[0, 0], [0.5, 0, 'hold'], [0.6, -6, 'inOut'], [0.75, 4, 'inOut'], [0.9, 0, 'inOut'], [1, 0]] },
    },
  ),

  walk: walk(
    { stride: 42, legSwing: 20, legLen: 38, armSwing: 6, lean: 3, sway: 1.5, headNod: 2 },
    {
      // The stack does not move, whatever her legs do; the slipper stays up.
      arm_back: { rot: swing(2) },
      arm_front: { rot: swing(6, -4) },
      slipper: { rot: swing(6) },
      stack: { rot: swing(1.5) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // Up high, and down with a smack.
      hips: { x: [[0, 0], [0.3, -2, 'out'], [0.45, 5, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.3, -8, 'out'], [0.45, 12, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, 6, 'out'], [0.45, -6, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.3, -70, 'out'], [0.45, 70, 'in'], [0.62, 58, 'out'], [1, 0, 'inOut']] },
      slipper: { rot: [[0, 0], [0.3, -20, 'out'], [0.45, 30, 'in'], [0.62, 20, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: STILL },
      stack: { rot: [[0, 0], [0.45, 0, 'hold'], [0.52, -3, 'out'], [0.7, 0, 'inOut'], [1, 0]] },
      leg_front: { rot: [[0, 0], [0.3, 5, 'out'], [0.45, -10, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.3, -4, 'out'], [0.45, 8, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    // Whatever hits her, the stack stays level.
    arm_back: { rot: STILL },
    stack: { rot: [[0, 0], [0.3, -4, 'out'], [1, 0, 'inOut']] },
    slipper: { rot: [[0, 0], [0.3, 16, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 60 },
    {
      // Going home, the stack held close: these are for the family now.
      arm_back: { rot: [[0, -20]] },
      arm_front: { rot: swing(18, -40) },
      stack: { rot: [[0, 18]] },
      slipper: { rot: swing(10, 10) },
      head: { rot: bob(3, 8) },
    },
  ),
};

export default deGastvrouw;
