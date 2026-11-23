import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * De Nachtploeg: straight from the night shift. Standing still he nods off,
 * chin sinking onto his chest, and jerks awake again; the spanner taps his
 * leg. He walks with the lunch tin clamped under his arm, and when it comes
 * to it the spanner goes up and comes down like at the works.
 */
const nachtploeg: ClipSet = {
  idle: idle(
    { seconds: 3.6, breathe: 0.03, armSway: 1 },
    {
      // Dozing off... dozing... and awake.
      head: {
        y: [[0, 0], [0.62, 2, 'sineInOut'], [0.66, -1.5, 'out'], [0.8, 0, 'inOut'], [1, 0, 'hold']],
        rot: [[0, 0], [0.55, 16, 'sineIn'], [0.62, 17, 'linear'], [0.66, -5, 'out'], [0.8, 0, 'inOut'], [1, 0, 'hold']],
      },
      torso: {
        sy: [[0, 1], [0.5, 1.03, 'sineInOut'], [1, 1, 'sineInOut']],
        rot: [[0, 0], [0.6, 4, 'sineIn'], [0.66, -2, 'out'], [0.8, 0, 'inOut'], [1, 0, 'hold']],
      },
      // The spanner sags with him, and snaps up when he wakes.
      arm_front: { rot: [[0, 0], [0.6, 12, 'sineIn'], [0.66, -4, 'out'], [0.8, 0, 'inOut'], [1, 0, 'hold']] },
      prop: { rot: [[0, 0], [0.6, 10, 'sineIn'], [0.66, -6, 'out'], [0.8, 0, 'inOut'], [1, 0, 'hold']] },
      arm_back: { rot: [[0, 0]] },
    },
  ),

  walk: walk(
    { stride: 50, legSwing: 28, legLen: 38, armSwing: 22, lean: 5, sway: 2.5, headNod: 3 },
    {
      // The tin stays clamped under his arm.
      arm_back: { rot: swing(-4) },
      arm_front: { rot: swing(18, -4) },
      prop: { rot: swing(8, 4) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.44 },
    tracks: {
      hips: {
        x: [[0, 0], [0.28, -4, 'out'], [0.44, 5, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.28, -2, 'out'], [0.44, 2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.28, -10, 'out'], [0.44, 13, 'in'], [0.7, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, 7, 'out'], [0.44, -8, 'in'], [1, 0, 'inOut']] },
      // Up over his shoulder and down, as on a stuck bolt.
      arm_front: { rot: [[0, 0], [0.28, -96, 'out'], [0.44, -18, 'in'], [0.62, -8, 'out'], [1, 0, 'inOut']] },
      prop: { rot: [[0, 0], [0.28, -70, 'out'], [0.44, 56, 'in'], [0.62, 30, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.28, 8, 'out'], [0.44, -6, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 6, 'out'], [0.44, -18, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -5, 'out'], [0.44, 14, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    arm_back: { rot: [[0, 0], [0.3, 6, 'out'], [1, 0, 'inOut']] },
    prop: { rot: [[0, 0], [0.3, 18, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 66 },
    {
      // Home to bed: the tin under his arm, the spanner dragging behind.
      arm_back: { rot: swing(5, -6) },
      arm_front: { rot: swing(16, 34) },
      prop: { rot: swing(8, 96) },
      head: { rot: bob(4, 14) },
    },
  ),
};

export default nachtploeg;
