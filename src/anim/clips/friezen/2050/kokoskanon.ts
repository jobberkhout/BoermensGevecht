import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The warning light: on, off, on, off, without end. */
const BLINK: Key[] = [[0, 1], [0.2, 1.3, 'out'], [0.4, 0.6, 'in'], [0.6, 1.3, 'out'], [0.8, 0.6, 'in'], [1, 1, 'inOut']];

/** One turn of the cart's wheel per cycle of the walk. */
const TURN: Key[] = [[0, 0], [1, 360, 'linear']];

/**
 * It Kokoskanon. Sixty years a kaatser, still in his whites, now with a shirt
 * of pineapples over them and a hat like a tray. The club bought him a
 * ball-serving machine; in tropical Friesland it serves coconuts. He does not
 * trust it. Standing, he eyes it sideways while its light blinks. To fire, he
 * drops a coconut in the hopper at arm's length and turns away with his hand
 * up before it goes off. Beaten, he trudges home, pushing it, still not
 * looking at it.
 */
const kokoskanon: ClipSet = {
  idle: idle(
    { seconds: 3, breathe: 0.03, armSway: 2 },
    {
      // A long sideways look at the machine, then away again.
      head: { rot: [[0, 0], [0.2, 10, 'inOut'], [0.5, 10, 'hold'], [0.62, -4, 'inOut'], [1, 0, 'inOut']] },
      machine: { sy: [[0, 1], [0.5, 1.01, 'sineInOut'], [1, 1, 'sineInOut']], rate: 6 },
      lamp: { sx: BLINK, sy: BLINK },
      nut: { rot: [[0, 0], [0.5, 20, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 50, legSwing: 20, legLen: 38, armSwing: 6, lean: 6, headNod: 2 },
    {
      // Pushing the cart along with the free hand on it, the coconut in the other.
      arm_front: { rot: [[0, -48], [0.5, -44, 'sineInOut'], [1, -48, 'sineInOut']] },
      cart_wheel: { rot: TURN },
      machine: { rot: [[0, 0], [0.25, 1.2, 'sineInOut'], [0.75, -1.2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      lamp: { sx: BLINK, sy: BLINK, rate: 2 },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.46 },
    tracks: {
      // The coconut goes in at arm's length...
      arm_front: { rot: [[0, 0], [0.24, -86, 'out'], [0.34, -86, 'hold'], [0.44, 10, 'in'], [1, 0, 'inOut']] },
      nut: {
        sx: [[0, 1], [0.32, 1, 'hold'], [0.36, 0, 'in'], [0.86, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.32, 1, 'hold'], [0.36, 0, 'in'], [0.86, 0, 'hold'], [1, 1, 'backOut']],
      },
      // ...and he turns away with his hand up before it serves.
      torso: { rot: [[0, 0], [0.24, 8, 'out'], [0.4, -12, 'in'], [0.7, -12, 'hold'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, 8, 'out'], [0.4, -22, 'in'], [0.72, -22, 'hold'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.34, 0, 'hold'], [0.42, -140, 'out'], [0.74, -140, 'hold'], [1, 0, 'inOut']] },
      hips: { x: [[0, 0], [0.4, -3, 'out'], [1, 0, 'inOut']] },
      // The serve: the mouth kicks up, the box jumps on its wheel.
      barrel: { rot: [[0, 0], [0.44, 0, 'hold'], [0.48, -16, 'out'], [0.7, 0, 'inOut'], [1, 0]] },
      machine: {
        rot: [[0, 0], [0.44, 0, 'hold'], [0.48, -4, 'out'], [0.62, 1.5, 'inOut'], [1, 0, 'inOut']],
        y: [[0, 0], [0.44, 0, 'hold'], [0.48, -3, 'out'], [0.6, 0, 'in'], [1, 0]],
      },
      lamp: { sx: [[0, 1], [0.46, 1, 'hold'], [0.5, 1.8, 'out'], [0.8, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.46, 1, 'hold'], [0.5, 1.8, 'out'], [0.8, 1, 'inOut'], [1, 1]] },
    },
  },

  hit: flinch({
    machine: { rot: rattle(3, 3) },
    lamp: { sx: [[0, 1], [0.2, 1.6, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.2, 1.6, 'out'], [1, 1, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 50 },
    {
      // Home with the cart, hand on it, head turned well away from it.
      arm_front: { rot: [[0, -50]] },
      arm_back: { rot: swing(-30, -100) },
      head: { rot: bob(4, -20) },
      cart_wheel: { rot: TURN },
      barrel: { rot: [[0, 18]] },
      lamp: { sx: [[0, 0.6]], sy: [[0, 0.6]] },
    },
  ),
};

export default kokoskanon;
