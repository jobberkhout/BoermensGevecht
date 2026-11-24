import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * De dagjesmens: off the ship, two hours in town, and running. Standing still
 * is torture: he checks his watch and taps his foot. In a fight he lunges in
 * with the bum bag first and swings the camera round on its strap.
 */
const dagjesmens: ClipSet = {
  idle: idle(
    { seconds: 1.8, breathe: 0.05, armSway: 1 },
    {
      // A look at the watch, every time.
      arm_front: { rot: [[0, 0], [0.3, 0, 'hold'], [0.42, -50, 'out'], [0.7, -50, 'hold'], [0.82, 0, 'inOut'], [1, 0]] },
      head: { rot: [[0, 0], [0.3, 0, 'hold'], [0.42, 12, 'out'], [0.7, 12, 'hold'], [0.82, -4, 'inOut'], [1, 0, 'inOut']] },
      // Tap, tap, tap.
      leg_front: { rot: [[0, 0], [0.12, -8, 'out'], [0.2, 0, 'in'], [0.32, -8, 'out'], [0.4, 0, 'in'], [1, 0, 'hold']] },
      camera: { rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  // A flat-out run: long strides, arms pumping, leaning into it.
  walk: walk(
    { stride: 80, legSwing: 38, legLen: 38, armSwing: 40, armRest: -6, lean: 12, sway: 2, headNod: 3 },
    {
      camera: { rot: swing(14, 6), y: bob(1.6) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.44 },
    tracks: {
      // Bum bag first, then the camera on its strap, round and into whoever it is.
      hips: { x: [[0, 0], [0.26, -4, 'out'], [0.44, 6, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -8, 'out'], [0.44, 12, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, -5, 'out'], [0.44, 6, 'in'], [1, 0, 'inOut']] },
      camera: { rot: [[0, 0], [0.26, 35, 'out'], [0.44, -88, 'in'], [0.62, -50, 'out'], [0.8, 16, 'inOut'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, 30, 'out'], [0.44, -20, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, -20, 'out'], [0.44, 24, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.44, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.44, 12, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    camera: { rot: rattle(14, 3) },
  }),

  die: slinkOff(
    { legLen: 38, stride: 76 },
    {
      // Back to the ship, at the same speed.
      camera: { rot: swing(16, -10), y: bob(2) },
    },
  ),
};

export default dagjesmens;
