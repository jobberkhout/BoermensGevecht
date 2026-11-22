import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Barista Bo: struts with her cup held steady, swings it back and lobs a
 * haver-flat-white underhand. The bun bounces along with everything she does.
 */
const baristaBo: ClipSet = {
  idle: idle(
    { seconds: 2.6, breathe: 0.035, armSway: 3 },
    {
      head: { rot: [[0, 0], [0.3, 4, 'sineInOut'], [0.7, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      bun: { rot: [[0, 0], [0.35, -6, 'sineInOut'], [0.75, 5, 'sineInOut'], [1, 0, 'sineInOut']] },
      // She sips now and then: the cup comes up to her mouth and back.
      arm_front: { rot: [[0, 0], [0.55, 0, 'hold'], [0.7, -38, 'inOut'], [0.85, -38, 'hold'], [1, 0, 'inOut']] },
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 27, legLen: 38, armSwing: 20, lean: 3, sway: 2.5, headNod: 3 },
    {
      // The cup arm barely moves; spilling is not an option.
      arm_front: { rot: swing(5, -6) },
      bun: { y: bob(2.2), rot: swing(7) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.44 },
    tracks: {
      // An underhand lob: dip and swing the cup back, then straighten up and let it fly.
      hips: {
        x: [[0, 0], [0.3, -3, 'out'], [0.44, 4, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.3, 3, 'out'], [0.44, -2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.3, 12, 'out'], [0.44, -8, 'in'], [0.7, -3, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, -9, 'out'], [0.44, 5, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.3, 100, 'out'], [0.44, -35, 'in'], [0.6, -52, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.3, -28, 'out'], [0.44, 32, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.3, 6, 'out'], [0.44, -11, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.3, -4, 'out'], [0.44, 9, 'in'], [1, 0, 'inOut']] },
      bun: { rot: [[0, 0], [0.3, -14, 'out'], [0.5, 18, 'in'], [0.75, -8, 'out'], [1, 0, 'inOut']] },
      // The cup leaves her hand at the hit; a fresh one pops up for the next throw.
      prop: {
        sx: [[0, 1], [0.44, 0, 'hold'], [0.82, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.44, 0, 'hold'], [0.82, 0, 'hold'], [1, 1, 'backOut']],
      },
    },
  },

  hit: flinch({
    bun: { rot: [[0, 0], [0.3, 22, 'out'], [1, 0, 'inOut']] },
    prop: { rot: [[0, 0], [0.3, -18, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 66 },
    {
      bun: { y: bob(3), rot: swing(14) },
      // The cup is gone; she is not coming back for it.
      prop: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  ),
};

export default baristaBo;
