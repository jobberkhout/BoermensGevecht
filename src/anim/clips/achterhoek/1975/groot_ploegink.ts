import { bob } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 33,
  wheels: { wheel_back: 33, wheel_front: 17 },
  bounce: 2.2,
  rock: 0.9,
};

/**
 * Smoke from the stack: a puff pops out, swells as it rises and is gone.
 * The second puff runs half a beat behind the first, so there is always one in the air.
 */
const RISE_A: Key[] = [[0, 0], [0.75, -17, 'out'], [1, -17, 'hold']];
const SWELL_A: Key[] = [[0, 0.3], [0.2, 1, 'out'], [0.6, 1.3, 'linear'], [0.75, 0, 'in'], [1, 0, 'hold']];
const RISE_B: Key[] = [[0, -6], [0.25, -12, 'linear'], [0.5, 4, 'hold'], [1, -6, 'out']];
const SWELL_B: Key[] = [[0, 1.05], [0.1, 1.2, 'linear'], [0.25, 0, 'in'], [0.5, 0, 'hold'], [0.7, 0.9, 'out'], [1, 1.05, 'linear']];
const smoke = (rate: number): Record<string, Track> => ({
  puff_a: { y: RISE_A, sx: SWELL_A, sy: SWELL_A, rate },
  puff_b: { y: RISE_B, sx: SWELL_B, sy: SWELL_B, rate },
});

/**
 * Groot Ploegink on his old trekker: it shudders and smokes standing still,
 * rattles along with the bale hopping on the back, and to attack he backs up,
 * lifts the plough share and rams it down and forward.
 */
const grootPloegink: ClipSet = {
  idle: {
    loop: true,
    seconds: 1.3,
    tracks: {
      // The old engine never runs smoothly: three shudders to every puff.
      body: { y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      driver: { rot: [[0, 0], [0.5, 2.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      bale: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      tool: { rot: [[0, 0], [0.5, -1.5, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      ...smoke(1),
    },
  },

  walk: roll(WHEELS, {
    driver: { y: bob(1.6), rot: [[0, 0], [0.5, 3.5, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    bale: { y: [[0, 0], [0.5, -2.5, 'out'], [1, 0, 'in']], rot: [[0, -2], [0.5, 3, 'sineInOut'], [1, -2, 'sineInOut']], rate: 3 },
    tool: { rot: [[0, 0], [0.5, -4, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    ...smoke(6),
  }),

  attack: {
    loop: false,
    markers: { hit: 0.34 },
    tracks: {
      ...shove([[0, 0], [0.22, -12, 'out'], [0.34, 18, 'in'], [0.6, 6, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.22, -2.5, 'out'], [0.34, 3.5, 'in'], [0.6, -1, 'out'], [1, 0, 'inOut']] },
      // The share rears up and comes down like a guillotine.
      tool: { rot: [[0, 0], [0.22, -26, 'out'], [0.34, 8, 'in'], [0.5, -6, 'out'], [1, 0, 'inOut']] },
      driver: { rot: [[0, 0], [0.22, -12, 'out'], [0.34, 16, 'in'], [0.6, 4, 'out'], [1, 0, 'inOut']] },
      bale: {
        rot: [[0, 0], [0.22, 5, 'out'], [0.34, -10, 'in'], [0.6, 3, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.34, 0, 'hold'], [0.46, -6, 'out'], [0.62, 0, 'in'], [1, 0, 'hold']],
      },
      // Full throttle: one big black cough at the moment of the blow.
      puff_a: {
        sx: [[0, 0.8], [0.22, 0.4, 'out'], [0.34, 1.9, 'in'], [0.7, 0, 'in'], [1, 0.8, 'out']],
        sy: [[0, 0.8], [0.22, 0.4, 'out'], [0.34, 1.9, 'in'], [0.7, 0, 'in'], [1, 0.8, 'out']],
        y: [[0, -4], [0.34, -4, 'hold'], [0.7, -20, 'out'], [1, -4, 'hold']],
      },
      puff_b: {
        sx: [[0, 1], [0.22, 0, 'in'], [0.4, 0, 'hold'], [0.52, 1.6, 'out'], [0.85, 0, 'in'], [1, 1, 'out']],
        sy: [[0, 1], [0.22, 0, 'in'], [0.4, 0, 'hold'], [0.52, 1.6, 'out'], [0.85, 0, 'in'], [1, 1, 'out']],
        y: [[0, 0], [0.4, 0, 'hold'], [0.85, -14, 'out'], [1, 0, 'hold']],
      },
    },
  },

  hit: jolt({
    driver: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
    bale: { rot: [[0, 0], [0.3, 8, 'out'], [0.65, -3, 'inOut'], [1, 0, 'inOut']] },
    tool: { rot: [[0, 0], [0.3, -9, 'out'], [1, 0, 'inOut']] },
  }),

  die: limpHome(WHEELS, {
    driver: { rot: [[0, 16], [0.5, 22, 'sineInOut'], [1, 16, 'sineInOut']], rate: 2 },
    bale: { rot: [[0, -7], [0.5, 6, 'sineInOut'], [1, -7, 'sineInOut']], y: [[0, 0], [0.5, -4, 'out'], [1, 0, 'in']], rate: 4 },
    // The share hangs loose and clatters.
    tool: { rot: [[0, -14], [0.5, -4, 'sineInOut'], [1, -14, 'sineInOut']], rate: 5 },
    ...smoke(8),
  }),
};

export default grootPloegink;
