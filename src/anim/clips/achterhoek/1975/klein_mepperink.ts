import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Klein Mepperink: leans on his riek and chews his grass stalk, marches with
 * the fork as a walking staff, and when it comes to it heaves it over his head
 * and brings it down on whoever stands in the way.
 */
const kleinMepperink: ClipSet = {
  idle: idle(
    { seconds: 2.6, breathe: 0.03, armSway: 1.5 },
    {
      // Leaning on the fork: his weight shifts onto it and back.
      hips: { x: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        // Chewing: quick little nods, then a look around.
        rot: [[0, 0], [0.12, 3, 'sineInOut'], [0.24, 0, 'sineInOut'], [0.36, 3, 'sineInOut'], [0.48, 0, 'sineInOut'], [0.7, -6, 'sineInOut'], [0.9, -6, 'hold'], [1, 0, 'sineInOut']],
      },
      prop: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 54, legSwing: 30, legLen: 38, armSwing: 26, lean: 6, sway: 2.5, headNod: 3 },
    {
      // The fork arm barely swings: he plants the riek like a staff, once per two steps.
      arm_front: { rot: swing(5, -8) },
      prop: { rot: swing(6, 4) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.43 },
    tracks: {
      hips: {
        x: [[0, 0], [0.28, -4, 'out'], [0.43, 5, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.28, -2, 'out'], [0.43, 2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.28, -10, 'out'], [0.43, 12, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, 8, 'out'], [0.43, -8, 'in'], [1, 0, 'inOut']] },
      // A mep, as the name says: up goes the riek, over his head, and down it comes, tines first.
      arm_front: { rot: [[0, 0], [0.28, -95, 'out'], [0.43, -98, 'in'], [0.62, -72, 'out'], [1, 0, 'inOut']] },
      prop: { rot: [[0, 0], [0.28, 80, 'out'], [0.43, 241, 'in'], [0.62, 226, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.28, 30, 'out'], [0.43, -34, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 6, 'out'], [0.43, -18, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -5, 'out'], [0.43, 14, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    prop: { rot: [[0, 0], [0.3, 16, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 70 },
    {
      // He is not leaving the riek behind: it goes home over his shoulder.
      arm_front: { rot: swing(10, -34) },
      prop: { rot: swing(8, -62) },
      head: { rot: bob(4, 10) },
    },
  ),
};

export default kleinMepperink;
