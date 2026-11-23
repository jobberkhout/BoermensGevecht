import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The holograms flicker now and then, as cheap ones do. */
const FLICKER: Key[] = [[0, 1], [0.3, 1, 'hold'], [0.32, 0.7, 'hold'], [0.34, 1.04, 'hold'], [0.36, 1, 'hold'], [0.8, 1, 'hold'], [0.82, 0.8, 'hold'], [0.84, 1, 'hold'], [1, 1]];

/**
 * De Prijzenvader. The trip south takes forty minutes now, and still he visits
 * twenty travel agencies, holograms these days, and writes every price in his
 * notebook. Standing, he looks from one agency to the other and back at his
 * book. He throws the tickets he did not buy. Beaten, he goes home holding the
 * notebook to his chest: the prices are safe.
 */
const prijzenvader: ClipSet = {
  idle: idle(
    { seconds: 3.6, breathe: 0.03, armSway: 2 },
    {
      // The agency on the left, then the book, then the agency again. Hm.
      head: {
        rot: [[0, 0], [0.12, -14, 'inOut'], [0.34, -14, 'hold'], [0.44, 12, 'inOut'], [0.66, 12, 'hold'], [0.76, -10, 'inOut'], [0.9, -10, 'hold'], [1, 0, 'inOut']],
      },
      notebook: { rot: [[0, 0], [0.38, 0, 'hold'], [0.46, -10, 'inOut'], [0.66, -10, 'hold'], [0.74, 0, 'inOut'], [1, 0]] },
      arm_back: { rot: [[0, 0], [0.38, 0, 'hold'], [0.46, -8, 'inOut'], [0.66, -8, 'hold'], [0.74, 0, 'inOut'], [1, 0]] },
      // The tickets get a little shake: these, he did not buy.
      arm_front: { rot: [[0, 0], [0.5, 0, 'hold'], [0.56, -8, 'out'], [0.62, 0, 'in'], [0.68, -8, 'out'], [0.74, 0, 'in'], [1, 0]] },
      holo: { y: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']], sx: FLICKER },
    },
  ),

  walk: walk(
    { stride: 48, legSwing: 22, legLen: 38, armSwing: 12, lean: 4, sway: 1.5, headNod: 2 },
    {
      // The book stays up while he walks; he is still reading.
      arm_back: { rot: swing(-4, -4) },
      notebook: { rot: swing(3) },
      arm_front: { rot: swing(14, 6) },
      head: { rot: [[0, 4], [0.5, 6, 'sineInOut'], [1, 4, 'sineInOut']] },
      // The agencies trail after him, a little late.
      holo: { y: bob(-2.4), x: swing(2, 0, 0.2), sx: FLICKER },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: { x: [[0, 0], [0.3, -4, 'out'], [0.45, 5, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.3, -12, 'out'], [0.45, 12, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, -6, 'out'], [0.45, 8, 'in'], [1, 0, 'inOut']] },
      // Back over the shoulder, and away with them.
      arm_front: { rot: [[0, 0], [0.3, 84, 'out'], [0.45, -26, 'in'], [0.66, -14, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.3, -10, 'out'], [0.45, 8, 'in'], [1, 0, 'inOut']] },
      notebook: { rot: [[0, 0], [0.3, -6, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.3, 6, 'out'], [0.45, -16, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.3, -4, 'out'], [0.45, 10, 'in'], [1, 0, 'inOut']] },
      holo: { sx: [[0, 1], [0.44, 1, 'hold'], [0.48, 1.2, 'out'], [0.7, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.44, 1, 'hold'], [0.48, 1.2, 'out'], [0.7, 1, 'inOut'], [1, 1]] },
    },
  },

  hit: flinch({
    arm_front: { rot: [[0, 0], [0.3, 18, 'out'], [1, 0, 'inOut']] },
    holo: { sx: [[0, 1], [0.15, 0.4, 'hold'], [0.3, 1.1, 'hold'], [0.45, 0.7, 'hold'], [0.6, 1, 'hold'], [1, 1]] },
    // The book is held up as a shield. It has seen worse.
    notebook: { rot: [[0, 0], [0.3, -18, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 68 },
    {
      // The notebook clutched to his chest: whatever happens, the prices are safe.
      arm_back: { rot: [[0, -26]] },
      notebook: { rot: [[0, -14]] },
      arm_front: { rot: swing(16, 40), rate: 2 },
      head: { rot: bob(4, 14) },
      holo: { sx: [[0, 0.6]], sy: [[0, 0.6]], y: bob(-3) },
    },
  ),
};

export default prijzenvader;
