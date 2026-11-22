import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** Both buns bounce, the far one a beat behind the near one. */
const buns = (amount: number): Record<string, Track> => ({
  bun_front: { y: bob(amount), rot: swing(amount * 3) },
  bun_back: { y: bob(amount, 0), rot: swing(-amount * 3, 0, 0.2) },
});

/** A cheek full of air: it swells while she breathes in and is gone the moment she blows. */
const PUFF: Key[] = [[0, 1], [0.34, 2.7, 'out'], [0.43, 2.9, 'hold'], [0.5, 0.6, 'out'], [1, 1, 'inOut']];

/**
 * Boba-Bibi: carries her bubble tea on her back and the fat straw at her lips.
 * She breathes in until her cheek is round, leans in, and blows three tapioca
 * pearls through it.
 */
const bobaBibi: ClipSet = {
  idle: idle(
    { seconds: 2.8, breathe: 0.035, armSway: 0 },
    {
      // She takes the straw from her mouth to look at her feed, and puts it back.
      head: { rot: [[0, 0], [0.3, 0, 'hold'], [0.42, -9, 'inOut'], [0.7, -9, 'hold'], [0.82, 0, 'inOut'], [1, 0]] },
      arm_front: { rot: [[0, 0], [0.28, 0, 'hold'], [0.42, 30, 'inOut'], [0.7, 30, 'hold'], [0.84, 0, 'inOut'], [1, 0]] },
      arm_back: { rot: [[0, 0], [0.5, -4, 'sineInOut'], [1, 0, 'sineInOut']] },
      cup: { rot: [[0, 0], [0.5, -2.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      bun_front: { rot: [[0, 0], [0.42, 8, 'inOut'], [0.84, 0, 'inOut'], [1, 0]] },
      bun_back: { rot: [[0, 0], [0.46, 8, 'inOut'], [0.88, 0, 'inOut'], [1, 0]] },
    },
  ),

  walk: walk(
    { stride: 42, legSwing: 25, legLen: 38, armSwing: 22, lean: 3, sway: 2, headNod: 2 },
    {
      // The straw stays at her lips; the tea sloshes along behind.
      arm_front: { rot: swing(2.5, -2) },
      cup: { rot: swing(3.5), y: bob(1.5) },
      ...buns(1.8),
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.44 },
    tracks: {
      hips: { x: [[0, 0], [0.34, -3, 'out'], [0.44, 4, 'in'], [1, 0, 'inOut']] },
      // In: she leans back and fills up. Out: head and shoulders snap forward.
      torso: { rot: [[0, 0], [0.34, -10, 'out'], [0.44, 9, 'in'], [0.7, 3, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.34, -8, 'out'], [0.44, 7, 'in'], [1, 0, 'inOut']] },
      cheek: { sx: PUFF, sy: PUFF },
      arm_front: { rot: [[0, 0], [0.34, 5, 'out'], [0.44, -7, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.34, 26, 'out'], [0.44, -30, 'in'], [1, 0, 'inOut']] },
      // The straw kicks back as the pearls leave it.
      prop: { x: [[0, 0], [0.44, 0, 'hold'], [0.5, -5, 'out'], [0.72, 0, 'inOut'], [1, 0]] },
      cup: { rot: [[0, 0], [0.34, 5, 'out'], [0.46, -8, 'in'], [0.66, 3, 'inOut'], [1, 0, 'inOut']] },
      bun_front: { rot: [[0, 0], [0.34, -12, 'out'], [0.5, 16, 'in'], [0.74, -6, 'out'], [1, 0, 'inOut']] },
      bun_back: { rot: [[0, 0], [0.36, -12, 'out'], [0.54, 16, 'in'], [0.78, -6, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.34, 5, 'out'], [0.44, -9, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.34, -4, 'out'], [0.44, 8, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    // The straw arm is bent already; a small jolt is enough.
    arm_front: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
    cup: { rot: [[0, 0], [0.3, 12, 'out'], [0.65, -5, 'inOut'], [1, 0, 'inOut']] },
    bun_front: { rot: [[0, 0], [0.3, 22, 'out'], [1, 0, 'inOut']] },
    bun_back: { rot: [[0, 0], [0.34, 22, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // She keeps the straw. The cup bangs against her back all the way home.
      arm_front: { rot: swing(10, 24) },
      cup: { rot: swing(11), y: bob(3) },
      ...buns(3),
    },
  ),
};

export default bobaBibi;
