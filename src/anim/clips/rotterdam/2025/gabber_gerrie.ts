import { bob, flinch, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** One beat: down on the beat, up again. With `rate: 4` on a clip of 4/3 s that is 180 to the minute. */
const BEAT_DIP: Key[] = [[0, 0], [0.22, 2.6, 'out'], [1, 0, 'inOut']];
/** The fist hammers forward and down on the beat and comes back up for the next one. */
const PUMP: Key[] = [[0, 0], [0.2, 34, 'out'], [1, 0, 'inOut']];

/**
 * Gabber Gerrie: hakt on the spot at 180 beats a minute, fist pumping, sweat
 * flying, and has been doing so since 1993. He hakt his way down the road too,
 * and his attack is a hakken kick with a fist pump on top. The game makes him
 * hit faster the longer he keeps going; he looks as if he could go faster still.
 */
const gabberGerrie: ClipSet = {
  idle: {
    loop: true,
    seconds: 4 / 3,
    tracks: {
      hips: { y: BEAT_DIP, rate: 4 },
      // Heel, toe: one foot flicks out, then the other, two beats each.
      leg_front: { rot: [[0, 0], [0.12, -26, 'out'], [0.4, 0, 'in'], [1, 0, 'hold']], rate: 2 },
      leg_back: { rot: [[0, 0], [0.5, 0, 'hold'], [0.62, -20, 'out'], [0.9, 0, 'in'], [1, 0]], rate: 2 },
      torso: { rot: [[0, 6], [0.22, 9, 'out'], [1, 6, 'inOut']], rate: 4 },
      head: { rot: [[0, 0], [0.22, 7, 'out'], [1, 0, 'inOut']], rate: 4 },
      arm_front: { rot: PUMP, rate: 4 },
      arm_back: { rot: [[0, 0], [0.25, 22, 'out'], [0.5, 0, 'inOut'], [0.75, -14, 'out'], [1, 0, 'inOut']], rate: 2 },
      sweat: { sx: [[0, 1], [0.22, 1.25, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.22, 1.25, 'out'], [1, 1, 'inOut']], rate: 4 },
    },
  },

  walk: walk(
    { stride: 46, legSwing: 32, legLen: 38, armSwing: 18, lean: 8, sway: 3, headNod: 4 },
    {
      // He does not walk, he hakt forward: an extra hop on every step and the fist going.
      hips: { y: bob(4.2) },
      arm_front: { rot: [[0, 0], [0.1, 34, 'out'], [0.5, 0, 'inOut'], [0.6, 34, 'out'], [1, 0, 'inOut']] },
      sweat: { rot: swing(10) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // Knee back, and the trainer goes out at shin height, fist up as it lands.
      hips: {
        x: [[0, 0], [0.24, -3, 'out'], [0.4, 5, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, 2, 'out'], [0.4, -3, 'in'], [0.6, 0, 'out'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.24, 8, 'out'], [0.4, -10, 'in'], [0.62, -4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, 6, 'out'], [0.4, 8, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.24, 26, 'out'], [0.4, -78, 'in'], [0.56, -62, 'out'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -6, 'out'], [0.4, 10, 'in'], [1, 0, 'inOut']] },
      // The fist goes down for the wind-up and up past his chin as the trainer lands.
      arm_front: { rot: [[0, 0], [0.24, 40, 'out'], [0.4, -32, 'in'], [0.6, -26, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.24, -20, 'out'], [0.4, 34, 'in'], [1, 0, 'inOut']] },
      sweat: { sx: [[0, 1], [0.4, 1.4, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.4, 1.4, 'out'], [1, 1, 'inOut']] },
    },
  },

  hit: flinch({
    sweat: { sx: [[0, 1], [0.3, 1.5, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.3, 1.5, 'out'], [1, 1, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // Home, knackered, arms hanging. Even the sweat has given up.
      arm_back: { rot: swing(-12, 6) },
      arm_front: { rot: swing(10, 46) },
      sweat: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  ),
};

export default gabberGerrie;
