import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Rugzak-Robin: a backpacker who has lost his way and does not mind. Standing
 * still he looks round for the tulips, the sleeping bag dangling from his fist.
 * He ambles along barefoot with the rucksack bouncing, and when someone is in
 * the way the sleeping bag goes up over his head on its strap and comes down
 * on them, soft but heavy.
 */
const rugzakRobin: ClipSet = {
  idle: idle(
    { seconds: 3.8, breathe: 0.03, armSway: 2 },
    {
      // Where are the tulips? Left... up... and a happy shrug.
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.18, -10, 'sineInOut'], [0.36, -10, 'hold'], [0.5, 8, 'sineInOut'], [0.66, 8, 'hold'], [0.78, 0, 'sineInOut'], [1, 0, 'hold']],
      },
      torso: {
        sy: [[0, 1], [0.5, 1.03, 'sineInOut'], [1, 1, 'sineInOut']],
        rot: [[0, 0], [0.18, -3, 'sineInOut'], [0.5, 2, 'sineInOut'], [0.78, 0, 'sineInOut'], [1, 0]],
      },
      pack: { rot: [[0, 0], [0.18, 1.5, 'sineInOut'], [0.5, -1, 'sineInOut'], [0.78, 0, 'sineInOut'], [1, 0]] },
      bag: { rot: swing(6) },
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 26, legLen: 38, armSwing: 18, lean: 5, sway: 2.5, headNod: 3 },
    {
      // The far hand stays on the strap; the rucksack and its guitar bounce; the sleeping bag swings.
      arm_back: { rot: swing(-5) },
      pack: { rot: bob(-2.5), y: bob(-1.5) },
      bag: { rot: swing(-16, 4, 0.12) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.46 },
    tracks: {
      hips: {
        x: [[0, 0], [0.3, -4, 'out'], [0.46, 5, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.3, -2, 'out'], [0.46, 2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.3, -10, 'out'], [0.46, 14, 'in'], [0.7, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, 8, 'out'], [0.46, -8, 'in'], [1, 0, 'inOut']] },
      pack: { rot: [[0, 0], [0.3, 3, 'out'], [0.52, -4, 'in'], [0.75, 1.5, 'out'], [1, 0, 'inOut']] },
      // Up over his head, round, and down.
      arm_front: { rot: [[0, 0], [0.3, -165, 'out'], [0.46, -40, 'in'], [0.66, -24, 'out'], [1, 0, 'inOut']] },
      // The bag trails behind the arm, then whips over and lands.
      bag: { rot: [[0, 0], [0.22, 40, 'out'], [0.34, 70, 'inOut'], [0.46, -10, 'in'], [0.6, 18, 'out'], [0.8, -6, 'inOut'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.3, 10, 'out'], [0.46, -6, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.3, 6, 'out'], [0.46, -18, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.3, -5, 'out'], [0.46, 14, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    pack: { rot: [[0, 0], [0.3, 4, 'out'], [1, 0, 'inOut']] },
    bag: { rot: [[0, 0], [0.3, 24, 'out'], [0.7, -8, 'inOut'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // Back to the hostel: the rucksack bounces, the sleeping bag drags behind.
      pack: { rot: bob(4, -3) },
      arm_front: { rot: swing(12, 30) },
      bag: { rot: swing(10, 60) },
      arm_back: { rot: swing(-20, -60) },
      head: { rot: bob(4, 14) },
    },
  ),
};

export default rugzakRobin;
