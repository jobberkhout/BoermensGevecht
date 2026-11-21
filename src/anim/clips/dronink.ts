import { bob, flinch, idle, slinkOff, swing, walk } from '../humanoid.ts';
import type { ClipSet, Key, Track } from '../types.ts';

/** Rotor blur: squashes sideways many times per cycle. */
const WHIRR: Key[] = [[0, 1], [0.5, 0.35, 'linear'], [1, 1, 'linear']];
const rotors = (rate: number): Record<string, Track> => ({
  rotor_back: { sx: WHIRR, rate },
  rotor_front: { sx: WHIRR, rate: rate + 1 },
});

/**
 * Dronink: clomps along on his klompen with his thumbs on the sticks while the
 * spray drone hovers ahead of him. To attack he jabs the controller forward and
 * the drone dips its nose and squirts.
 */
export const dronink: ClipSet = {
  idle: idle(
    { seconds: 2.2, breathe: 0.03, armSway: 2 },
    {
      prop: { rot: [[0, 0], [0.25, -6, 'sineInOut'], [0.75, 6, 'sineInOut'], [1, 0, 'sineInOut']] },
      drone: {
        y: [[0, 0], [0.5, -5, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, -3], [0.5, 4, 'sineInOut'], [1, -3, 'sineInOut']],
        x: [[0, 0], [0.25, 3, 'sineInOut'], [0.75, -3, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      ...rotors(12),
    },
  ),

  walk: walk(
    { stride: 42, legSwing: 24, legLen: 38, armSwing: 6, lean: 5, sway: 3, headNod: 3 },
    {
      // Both hands stay on the controller.
      arm_front: { rot: swing(3, -4) },
      arm_back: { rot: swing(3, -4) },
      drone: { y: bob(-4), rot: [[0, 8]], x: swing(2) },
      ...rotors(5),
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.36 },
    tracks: {
      hips: { x: [[0, 0], [0.22, -3, 'out'], [0.36, 4, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.22, -6, 'out'], [0.36, 9, 'in'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.22, 5, 'out'], [0.36, -6, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.22, 10, 'out'], [0.36, -22, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.22, 10, 'out'], [0.36, -22, 'in'], [1, 0, 'inOut']] },
      prop: { rot: [[0, 0], [0.36, -14, 'in'], [1, 0, 'inOut']] },
      // The drone rears back, dips its nose and kicks as it squirts.
      drone: {
        rot: [[0, 0], [0.22, -14, 'out'], [0.36, 24, 'in'], [0.52, 8, 'out'], [1, 0, 'inOut']],
        x: [[0, 0], [0.22, -6, 'out'], [0.36, 8, 'in'], [0.52, -4, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.22, -6, 'out'], [0.36, 5, 'in'], [1, 0, 'inOut']],
      },
      ...rotors(6),
    },
  },

  hit: flinch({
    drone: { rot: [[0, 0], [0.25, -22, 'out'], [0.6, 14, 'inOut'], [1, 0, 'inOut']], y: [[0, 0], [0.3, 7, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 60 },
    {
      // He still has the controller; the drone wobbles home after him.
      arm_front: { rot: swing(10, -20) },
      arm_back: { rot: swing(-10, -20) },
      drone: { rot: swing(26), y: bob(9), x: swing(6) },
      ...rotors(3),
    },
  ),
};
