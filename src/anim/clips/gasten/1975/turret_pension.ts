import { swing } from '../../../humanoid.ts';
import { pop, rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The clock rings at these moments of the idle loop (0..1), for a little while each time. */
const RINGS = [0.1, 0.55];
const RING_LEN = 0.16;

/** Shakes for the length of each ring, still in between. */
function ringing(amount: number): Key[] {
  const keys: Key[] = [[0, 0]];
  for (const at of RINGS) {
    keys.push([at, 0, 'hold']);
    for (let i = 1; i <= 8; i++) keys.push([at + (RING_LEN * i) / 8, i % 2 ? amount : -amount, 'linear']);
    keys.push([at + RING_LEN + 0.01, 0, 'linear']);
  }
  keys.push([1, 0, 'hold']);
  return keys;
}

/** The pillow goes down hard while it rings, and lifts a little after. */
const PILLOW_Y: Key[] = [[0, 0], [0.1, 0, 'hold'], [0.13, 3, 'out'], [0.27, 3, 'hold'], [0.32, 0, 'inOut'], [0.55, 0, 'hold'], [0.58, 3, 'out'], [0.72, 3, 'hold'], [0.77, 0, 'inOut'], [1, 0, 'hold']];

/**
 * Het Pension. One bulb, three beds, one alarm clock for the night shift.
 * While nothing comes, the clock in his fist keeps going off: he glares at it,
 * the one on the top bunk presses the pillow over his ears, and the one at the
 * bottom sleeps through all of it. When the turret fires, the clock has just
 * gone: out of the window, at whoever is outside. There is always another one.
 */
const pensionClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 4.2,
    tracks: {
      clock: { rot: ringing(12) },
      ring: {
        sx: [[0, 0], [0.1, 0, 'hold'], [0.12, 1, 'out'], [0.26, 1, 'hold'], [0.28, 0, 'in'], [0.55, 0, 'hold'], [0.57, 1, 'out'], [0.71, 1, 'hold'], [0.73, 0, 'in'], [1, 0, 'hold']],
        sy: [[0, 0], [0.1, 0, 'hold'], [0.12, 1, 'out'], [0.26, 1, 'hold'], [0.28, 0, 'in'], [0.55, 0, 'hold'], [0.57, 1, 'out'], [0.71, 1, 'hold'], [0.73, 0, 'in'], [1, 0, 'hold']],
      },
      c_arm: { rot: [[0, -6], [0.5, -2, 'sineInOut'], [1, -6, 'sineInOut']] },
      c_head: { rot: [[0, 0], [0.1, 0, 'hold'], [0.14, -10, 'out'], [0.3, -10, 'hold'], [0.36, 0, 'inOut'], [0.55, 0, 'hold'], [0.59, -10, 'out'], [0.75, -10, 'hold'], [0.81, 0, 'inOut'], [1, 0, 'hold']] },
      c_body: { rot: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      pillow: { y: PILLOW_Y },
      top_man: { sy: [[0, 1], [0.5, 1.04, 'sineInOut'], [1, 1, 'sineInOut']], rate: 2 },
      // Out like a light.
      sleeper: { sy: [[0, 1], [0.5, 1.06, 'sineInOut'], [1, 1, 'sineInOut']], rate: 3 },
      bulb: { rot: swing(2) },
    },
  },

  attack: {
    loop: false,
    seconds: 0.8,
    tracks: {
      // The clip starts just after the throw: arm forward, clock gone. A new one is in his fist before the next.
      c_arm: { rot: [[0, 60], [0.15, 70, 'out'], [0.6, 20, 'inOut'], [1, -6, 'inOut']] },
      c_body: { rot: [[0, 8], [0.2, 10, 'out'], [0.7, 0, 'inOut'], [1, 0, 'hold']] },
      c_head: { rot: [[0, 8], [0.25, 4, 'out'], [1, 0, 'inOut']] },
      clock: { sx: [[0, 0], [0.8, 0, 'hold'], [1, 1, 'backOut']], sy: [[0, 0], [0.8, 0, 'hold'], [1, 1, 'backOut']] },
      ring: { sx: [[0, 0]], sy: [[0, 0]] },
      // The other two: a jump, and back under.
      top_man: { y: [[0, 0], [0.08, -3, 'out'], [0.22, 0, 'in'], [1, 0, 'hold']] },
      pillow: { y: [[0, 0], [0.08, -6, 'out'], [0.3, 3, 'in'], [0.8, 3, 'hold'], [1, 0, 'inOut']], rot: rattle(6, 3) },
      sleeper: { y: [[0, 0], [0.1, -1.5, 'out'], [0.3, 0, 'in'], [1, 0, 'hold']] },
      bulb: { rot: [[0, 0], [0.12, 9, 'out'], [0.4, -6, 'inOut'], [0.7, 3, 'inOut'], [1, 0, 'inOut']] },
    },
  },
};

export default pensionClips;
