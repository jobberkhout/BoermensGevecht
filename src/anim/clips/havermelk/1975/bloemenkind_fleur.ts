import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Bloemenkind Fleur: sways to music nobody else hears, strolls along with her
 * flowers held out, and throws them overhand with her far arm, so the throw
 * passes behind her head and never in front of her face.
 */
const bloemenkindFleur: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.03, armSway: 6 },
    {
      hips: { x: swing(2.5) },
      torso: { rot: swing(3), sy: [[0, 1], [0.5, 1.03, 'sineInOut'], [1, 1, 'sineInOut']] },
      head: { rot: swing(-6), y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']] },
      hair: { rot: swing(6, 0, 0.88) },
      leg_front: { rot: swing(-2) },
      leg_back: { rot: swing(-2) },
      // She holds the flowers up to the sun, twice per sway.
      arm_back: { rot: [[0, 0], [0.25, -16, 'sineInOut'], [0.5, -3, 'sineInOut'], [0.75, -18, 'sineInOut'], [1, 0, 'sineInOut']] },
      prop: { rot: swing(9), rate: 2 },
    },
  ),

  walk: walk(
    { stride: 44, legSwing: 24, legLen: 38, armSwing: 22, lean: 2, sway: 3, headNod: 3 },
    {
      // The flower arm stays out in front; her hair swings behind her.
      arm_back: { rot: swing(5, -5) },
      prop: { rot: swing(7) },
      hair: { rot: swing(8, 5, 0.9) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: {
        x: [[0, 0], [0.26, -3, 'out'], [0.42, 5, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, 2, 'out'], [0.42, -4, 'in'], [0.62, 0, 'out'], [1, 0]],
      },
      torso: { rot: [[0, 0], [0.26, -10, 'out'], [0.42, 12, 'in'], [0.7, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 7, 'out'], [0.42, -6, 'in'], [1, 0, 'inOut']] },
      hair: { rot: [[0, 0], [0.26, -12, 'out'], [0.5, 22, 'in'], [0.78, -6, 'out'], [1, 0, 'inOut']] },
      // Up and back behind her head, then over the top.
      arm_back: { rot: [[0, 0], [0.26, -150, 'out'], [0.42, -28, 'in'], [0.6, 32, 'out'], [1, 0, 'inOut']] },
      // The bunch leaves her hand at the hit; a fresh one is there for the next throw.
      prop: {
        rot: [[0, 0], [0.26, -24, 'out'], [0.42, 30, 'in'], [1, 0]],
        sx: [[0, 1], [0.42, 0, 'hold'], [0.84, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.42, 0, 'hold'], [0.84, 0, 'hold'], [1, 1, 'backOut']],
      },
      arm_front: { rot: [[0, 0], [0.26, -26, 'out'], [0.42, 34, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 5, 'out'], [0.42, -12, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.42, 10, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    hair: { rot: [[0, 0], [0.3, -8, 'out'], [0.7, 5, 'inOut'], [1, 0, 'inOut']] },
    prop: { rot: [[0, 0], [0.3, -20, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // The flowers are gone, her hair streams out behind her.
      prop: { sx: [[0, 0]], sy: [[0, 0]] },
      hair: { rot: bob(8, 30) },
      arm_front: { rot: swing(30, -70) },
      arm_back: { rot: swing(-30, 36) },
    },
  ),
};

export default bloemenkindFleur;
