import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** A puff of exhaust: it swells as it leaves the pipe, drifts up and thins out. */
const PUFF: Key[] = [[0, 0.15], [0.35, 1, 'out'], [0.8, 1.15, 'sineInOut'], [1, 0.15, 'in']];
const smoke = (rate: number, size = 1): Track => ({
  sx: PUFF.map((k): Key => [k[0], k[1] * size, k[2]]),
  sy: PUFF.map((k): Key => [k[0], k[1] * size, k[2]]),
  y: [[0, 0], [0.8, -9, 'out'], [1, 0, 'hold']],
  rate,
});

/**
 * Exo-Mepperink: stomps along in his home-welded frame with the engine on his
 * back chugging. To attack he hauls the fork arm back and the piston punches
 * the pitchfork out further than any arm could reach.
 */
const exoMepperink: ClipSet = {
  idle: idle(
    { seconds: 1.8, breathe: 0.025, armSway: 2 },
    {
      // The engine keeps the whole frame trembling.
      hips: { y: [[0, 0], [0.5, -0.9, 'sineInOut'], [1, 0, 'sineInOut']], rate: 6 },
      head: { rot: [[0, 0], [0.3, 3, 'sineInOut'], [0.7, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      // He tests the piston now and then.
      prop: { x: [[0, 0], [0.5, 0, 'hold'], [0.6, 6, 'out'], [0.7, -1, 'in'], [0.78, 0, 'out'], [1, 0]] },
      smoke: smoke(3),
    },
  ),

  walk: walk(
    { stride: 52, legSwing: 26, legLen: 38, armSwing: 16, lean: 6, sway: 4, headNod: 3 },
    {
      // The fork stays level, pointed at whoever is next.
      arm_front: { rot: swing(4, -3) },
      prop: { x: bob(2) },
      smoke: smoke(2),
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: {
        x: [[0, 0], [0.26, -5, 'out'], [0.42, 7, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, 2, 'out'], [0.42, -1, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.26, -10, 'out'], [0.42, 13, 'in'], [0.62, 8, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 6, 'out'], [0.42, -8, 'in'], [1, 0, 'inOut']] },
      // The arm draws back with the rod pulled in, then the piston fires.
      arm_front: { rot: [[0, 0], [0.26, 16, 'out'], [0.42, -12, 'in'], [0.62, -10, 'out'], [1, 0, 'inOut']] },
      prop: { x: [[0, 0], [0.26, -7, 'out'], [0.42, 16, 'in'], [0.56, 13, 'out'], [0.8, 0, 'inOut'], [1, 0]] },
      arm_back: { rot: [[0, 0], [0.26, -30, 'out'], [0.42, 34, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 7, 'out'], [0.42, -17, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -5, 'out'], [0.42, 14, 'in'], [1, 0, 'inOut']] },
      // The engine coughs out a big cloud with the effort.
      smoke: {
        sx: [[0, 0.3], [0.3, 0.3, 'hold'], [0.46, 1.7, 'out'], [0.8, 1.5, 'sineInOut'], [1, 0.3, 'in']],
        sy: [[0, 0.3], [0.3, 0.3, 'hold'], [0.46, 1.7, 'out'], [0.8, 1.5, 'sineInOut'], [1, 0.3, 'in']],
        x: [[0, 0], [0.3, 0, 'hold'], [0.9, -9, 'out'], [1, 0, 'hold']],
        y: [[0, 0], [0.3, 0, 'hold'], [0.9, -10, 'out'], [1, 0, 'hold']],
      },
    },
  },

  hit: flinch({
    prop: { x: rattle(3, 3) },
    smoke: { sx: [[0, 1], [0.3, 1.6, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.3, 1.6, 'out'], [1, 1, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 66 },
    {
      // The fork arm hangs; the hydraulics have given up before he has.
      arm_front: { rot: swing(9, 42) },
      prop: { x: [[0, -6]] },
      arm_back: { rot: swing(-30, -70) },
      // The engine sputters.
      smoke: smoke(5, 0.8),
    },
  ),
};

export default exoMepperink;
