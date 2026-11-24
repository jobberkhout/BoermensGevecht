import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** Rotor blades, seen edge on: they blur wide and narrow, very fast. */
const SPIN: Key[] = [[0, 1], [0.25, 0.2, 'linear'], [0.5, 1, 'linear'], [0.75, 0.2, 'linear'], [1, 1, 'linear']];
const ROTORS: Record<string, Track> = {
  rotor_l: { sx: SPIN, rate: 6 },
  rotor_r: { sx: SPIN, rate: 7 },
};

/** The hologram flickers the way cheap ones do. */
const FLICKER: Key[] = [[0, 1], [0.4, 1, 'hold'], [0.42, 0.6, 'hold'], [0.44, 1.05, 'hold'], [0.46, 1, 'hold'], [1, 1]];

/**
 * Eénster-Eli. Smart glasses, a chest cam, a drone in front, and a rating over
 * the shoulder for everyone to see: one star out of five. Standing, Eli
 * narrates to the drone, then looks round for something to rate. Eli throws the one-star review, as a throwing star. Beaten, Eli goes
 * home still filming, and the drone follows to get the angle.
 */
const eensterEli: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.03, armSway: 2 },
    {
      // Talking to the drone, then a look round for something to rate.
      head: { rot: [[0, 0], [0.1, -8, 'inOut'], [0.4, -8, 'hold'], [0.5, 6, 'inOut'], [0.8, 6, 'hold'], [0.9, 0, 'inOut'], [1, 0]] },
      drone: { y: [[0, 0], [0.5, -4, 'sineInOut'], [1, 0, 'sineInOut']], x: [[0, 0], [0.25, 2, 'sineInOut'], [0.75, -2, 'sineInOut'], [1, 0, 'sineInOut']], rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      rating: { y: [[0, 0], [0.5, -2.4, 'sineInOut'], [1, 0, 'sineInOut']], sx: FLICKER },
      ...ROTORS,
    },
  ),

  walk: walk(
    { stride: 50, legSwing: 24, legLen: 38, armSwing: 14, lean: 4, sway: 1.5, headNod: 2 },
    {
      // The drone flies backwards in front, to keep the face in frame.
      drone: { y: bob(-3), x: swing(3, 0, 0.2), rot: [[0, -6]] },
      rating: { y: bob(-2), x: swing(1.6, 0, 0.3), sx: FLICKER },
      ...ROTORS,
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: { x: [[0, 0], [0.3, -4, 'out'], [0.45, 5, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.3, -12, 'out'], [0.45, 12, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, -6, 'out'], [0.45, 8, 'in'], [1, 0, 'inOut']] },
      // Back over the shoulder, and away with the star.
      arm_front: { rot: [[0, 0], [0.3, 88, 'out'], [0.45, -28, 'in'], [0.66, -14, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.3, -14, 'out'], [0.45, 10, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.3, 6, 'out'], [0.45, -16, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.3, -4, 'out'], [0.45, 10, 'in'], [1, 0, 'inOut']] },
      // The drone swoops in for the close-up.
      drone: { x: [[0, 0], [0.3, -4, 'out'], [0.5, 8, 'inOut'], [1, 0, 'inOut']], y: [[0, 0], [0.5, 4, 'inOut'], [1, 0, 'inOut']], rot: [[0, 0], [0.5, 12, 'inOut'], [1, 0, 'inOut']] },
      rating: { sx: [[0, 1], [0.44, 1, 'hold'], [0.5, 1.25, 'out'], [0.75, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.44, 1, 'hold'], [0.5, 1.25, 'out'], [0.75, 1, 'inOut'], [1, 1]] },
      ...ROTORS,
    },
  },

  hit: flinch({
    drone: { y: [[0, 0], [0.2, -8, 'out'], [1, 0, 'inOut']], rot: [[0, 0], [0.2, -18, 'out'], [1, 0, 'inOut']] },
    rating: { sx: [[0, 1], [0.15, 0.3, 'hold'], [0.3, 1.1, 'hold'], [0.45, 0.6, 'hold'], [0.6, 1, 'hold'], [1, 1]] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 70 },
    {
      // Still filming: the drone hangs on to the end.
      drone: { y: bob(-4, -4), x: [[0, 10]], rot: [[0, -10]] },
      rating: { sx: [[0, 0.7]], sy: [[0, 0.7]], y: bob(-2, 6) },
      ...ROTORS,
    },
  ),
};

export default eensterEli;
