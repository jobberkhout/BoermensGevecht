import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Bootwerker Aad: stands rocking on his heels with the hook in his fist and
 * taps it in his palm while he waits; walks like he owns the quay; and hands
 * out a Rotterdamse fooi: the hook comes up over his shoulder and down in one
 * swing, the way he pulls a bale out of the hold.
 */
const bootwerkerAad: ClipSet = {
  idle: idle(
    { seconds: 2.6, breathe: 0.035, armSway: 0 },
    {
      // Rocking on his heels, chest out.
      hips: { y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      torso: { rot: [[0, -2], [0.5, 1, 'sineInOut'], [1, -2, 'sineInOut']], sy: [[0, 1], [0.5, 1.035, 'sineInOut'], [1, 1, 'sineInOut']] },
      // The hook weighed in his hand: up, and down again, twice.
      arm_front: { rot: [[0, 0], [0.12, -10, 'out'], [0.24, 0, 'in'], [0.36, -10, 'out'], [0.48, 0, 'in'], [1, 0, 'hold']] },
      hook: { rot: [[0, 0], [0.12, -8, 'out'], [0.24, 0, 'in'], [0.36, -8, 'out'], [0.48, 0, 'in'], [1, 0, 'hold']] },
      arm_back: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        // a nod at whoever is looking: "Wat moet je?"
        rot: [[0, 0], [0.62, 0, 'hold'], [0.7, -7, 'out'], [0.8, 2, 'inOut'], [0.9, 0, 'inOut'], [1, 0, 'hold']],
      },
    },
  ),

  walk: walk(
    { stride: 50, legSwing: 26, legLen: 38, armSwing: 16, lean: 2, sway: 3, headNod: 2 },
    {
      // A swagger: the shoulders roll, the hook hand stays up.
      torso: { rot: bob(3, 1) },
      arm_front: { rot: swing(10, -4) },
      arm_back: { rot: swing(-14, 0) },
      hook: { rot: swing(6) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: {
        x: [[0, 0], [0.28, -4, 'out'], [0.45, 7, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.28, -1, 'out'], [0.45, 2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.28, -12, 'out'], [0.45, 16, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, 6, 'out'], [0.45, -8, 'in'], [1, 0, 'inOut']] },
      // Up behind his shoulder and down in one pull.
      arm_front: { rot: [[0, 0], [0.28, -150, 'out'], [0.45, -20, 'in'], [0.62, 10, 'out'], [1, 0, 'inOut']] },
      hook: { rot: [[0, 0], [0.28, -30, 'out'], [0.45, 40, 'in'], [0.62, 30, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.28, 20, 'out'], [0.45, -30, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 6, 'out'], [0.45, -16, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -5, 'out'], [0.45, 12, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    hook: { rot: [[0, 0], [0.3, -16, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // Off home, the hook hanging from one finger, shoulders down.
      arm_front: { rot: swing(18, 28) },
      hook: { rot: swing(10, 70) },
    },
  ),
};

export default bootwerkerAad;
