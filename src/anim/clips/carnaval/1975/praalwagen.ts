import { bob } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 27,
  wheels: { wheel_back: 27, wheel_front: 15, wheel_cart_back: 11, wheel_cart_front: 11 },
  bounce: 2,
  rock: 0.8,
};

/** A puff from the stack: out, up, swelling, gone. */
const RISE: Key[] = [[0, 0], [0.75, -16, 'out'], [1, -16, 'hold']];
const SWELL: Key[] = [[0, 0.3], [0.2, 1, 'out'], [0.6, 1.3, 'linear'], [0.75, 0, 'in'], [1, 0, 'hold']];
const smoke = (rate: number): Record<string, Track> => ({ puff: { y: RISE, sx: SWELL, sy: SWELL, rate } });

/** Yes. Yes. Yes. The big head agrees with everything. */
const NOD: Key[] = [
  [0, 0], [0.18, 9, 'sineInOut'], [0.34, 0, 'sineInOut'],
  [0.52, 9, 'sineInOut'], [0.68, 0, 'sineInOut'], [1, 0, 'hold'],
];

/** The float trails the tractor on its hitch, a beat behind every bump. */
const TRAIL: Key[] = [[0, 0], [0.3, 1.2, 'sineInOut'], [0.8, -0.8, 'sineInOut'], [1, 0, 'sineInOut']];

/**
 * De Praalwagen: the old tractor ticks over while the giant jester's head on
 * the float behind nods yes to everything. Driving, the head bobs along. To
 * attack, the tractor backs up and lurches forward, and the head rears back
 * and comes down hard. Beaten, it limps home with the head hanging.
 */
const praalwagen: ClipSet = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      body: { y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']], rate: 6 },
      driver: { rot: [[0, 0], [0.5, 2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      jester: { rot: NOD },
      float: { rot: [[0, 0], [0.5, -0.4, 'sineInOut'], [1, 0, 'sineInOut']], rate: 6 },
      ...smoke(2),
    },
  },

  walk: roll(WHEELS, {
    driver: { y: bob(1.4), rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    float: { rot: TRAIL, y: [[0, 0], [0.5, -1.6, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    jester: { rot: [[0, -2], [0.3, 8, 'sineInOut'], [0.6, -3, 'sineInOut'], [1, -2, 'sineInOut']], rate: 2 },
    ...smoke(5),
  }),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      ...shove([[0, 0], [0.26, -10, 'out'], [0.4, 16, 'in'], [0.62, 6, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.26, -2, 'out'], [0.4, 3, 'in'], [0.62, -1, 'out'], [1, 0, 'inOut']] },
      float: { rot: [[0, 0], [0.26, 1.5, 'out'], [0.4, -2, 'in'], [0.62, 1, 'out'], [1, 0, 'inOut']] },
      // Back it goes, and down it comes: bonk.
      jester: { rot: [[0, 0], [0.26, -18, 'out'], [0.4, 38, 'in'], [0.5, 27, 'out'], [0.6, 33, 'inOut'], [1, 0, 'inOut']] },
      driver: { rot: [[0, 0], [0.26, -8, 'out'], [0.4, 14, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']] },
      puff: {
        sx: [[0, 0.6], [0.4, 0.6, 'hold'], [0.46, 1.8, 'out'], [0.8, 0, 'in'], [1, 0, 'hold']],
        sy: [[0, 0.6], [0.4, 0.6, 'hold'], [0.46, 1.8, 'out'], [0.8, 0, 'in'], [1, 0, 'hold']],
        y: [[0, 0], [0.4, 0, 'hold'], [0.8, -18, 'out'], [1, -18, 'hold']],
      },
    },
  },

  hit: jolt({
    driver: { rot: [[0, 0], [0.3, -12, 'out'], [1, 0, 'inOut']] },
    jester: { rot: [[0, 0], [0.25, -10, 'out'], [0.55, 6, 'inOut'], [0.8, -2, 'inOut'], [1, 0, 'inOut']] },
  }),

  die: limpHome(WHEELS, {
    driver: { rot: [[0, 14], [0.5, 20, 'sineInOut'], [1, 14, 'sineInOut']], rate: 2 },
    // The head hangs to the back, lolling with every bump.
    jester: { rot: [[0, -12], [0.5, -6, 'sineInOut'], [1, -12, 'sineInOut']], rate: 3 },
    float: { rot: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']], rate: 5 },
    ...smoke(6),
  }),
};

export default praalwagen;
