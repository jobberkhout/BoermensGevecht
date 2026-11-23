import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/**
 * De Dönerbaas: the long knife held upright in one hand, a pita in the other.
 * The knife only ever goes up and down a little, like a salute; it is the pita
 * that flies, flat and spinning, with a flick of the wrist.
 */
const donerbaas: ClipSet = {
  idle: idle(
    { seconds: 2.6, breathe: 0.035, armSway: 0 },
    {
      // A little salute with the knife now and then; the pita bobs in his hand.
      arm_back: { rot: [[0, 0], [0.5, 0, 'hold'], [0.6, -6, 'out'], [0.75, -6, 'hold'], [0.88, 0, 'inOut'], [1, 0]] },
      arm_front: { rot: [[0, 0], [0.25, -6, 'sineInOut'], [0.5, 0, 'sineInOut'], [1, 0]] },
      head: { rot: [[0, 0], [0.55, 0, 'hold'], [0.62, -4, 'out'], [0.8, -4, 'hold'], [0.9, 0, 'inOut'], [1, 0]] },
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 24, legLen: 38, armSwing: 10, lean: 3, sway: 2, headNod: 2 },
    {
      // The knife stays upright whatever his legs do.
      arm_back: { rot: swing(3) },
      knife: { rot: swing(-3) },
      arm_front: { rot: swing(12, -4) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.44 },
    tracks: {
      // A sideways flick, like skimming a stone.
      hips: { x: [[0, 0], [0.3, -3, 'out'], [0.44, 4, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.3, -9, 'out'], [0.44, 9, 'in'], [0.7, 3, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, 6, 'out'], [0.44, -5, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.3, 55, 'out'], [0.44, -60, 'in'], [0.62, -72, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: STILL },
      knife: { rot: STILL },
      leg_front: { rot: [[0, 0], [0.3, 5, 'out'], [0.44, -10, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.3, -4, 'out'], [0.44, 8, 'in'], [1, 0, 'inOut']] },
      // The pita leaves his hand at the hit; the next one is there for the next throw.
      pita: {
        sx: [[0, 1], [0.44, 0, 'hold'], [0.82, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.44, 0, 'hold'], [0.82, 0, 'hold'], [1, 1, 'backOut']],
      },
    },
  },

  hit: flinch({
    arm_back: { rot: [[0, 0], [0.3, 6, 'out'], [1, 0, 'inOut']] },
    pita: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 66 },
    {
      // Home, knife held safely down along his side, the pita kept for himself.
      arm_back: { rot: [[0, 40]] },
      knife: { rot: [[0, 150]] },
      arm_front: { rot: swing(20, -50) },
      head: { rot: bob(4, 10) },
    },
  ),
};

export default donerbaas;
