import { rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The hologram's light: steady, a stutter, steady, a long glitch. */
const FLICKER: Key[] = [
  [0, 1], [0.18, 1, 'hold'], [0.2, 0.86, 'linear'], [0.22, 1.04, 'linear'], [0.24, 1, 'linear'],
  [0.6, 1, 'hold'], [0.62, 0.3, 'linear'], [0.66, 1.1, 'linear'], [0.68, 0.7, 'linear'], [0.72, 1, 'linear'], [1, 1, 'hold'],
];
/** And it jumps sideways when it glitches. */
const JITTER: Key[] = [[0, 0], [0.6, 0, 'hold'], [0.62, 3, 'linear'], [0.66, -2, 'linear'], [0.7, 1, 'linear'], [0.72, 0, 'linear'], [1, 0, 'hold']];
/** The sleeper's snore: the bubble swells and shrinks. */
const SNORE: Key[] = [[0, 0.5], [0.25, 1.3, 'sineInOut'], [0.5, 0.5, 'sineInOut'], [0.75, 1.3, 'sineInOut'], [1, 0.5, 'sineInOut']];

/**
 * De Laatste Raad van Elf. Three of the old council, the last ones left, on
 * mobility scooters with a little flag on a whip each, feathered caps, medals
 * on their jackets and plaids on their knees. Beside them the prince is a
 * hologram now, and it flickers. The first sleeps, a bubble at his nose; the
 * second waves a flag in the carnival colours, and his scooter creeps forward
 * on its own and back again; the third has a basket full of antique medals
 * and throws them, overarm, with his tongue out.
 */
const laatsteRaad: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      holo: { sx: FLICKER, x: JITTER },
      a_head: { rot: [[0, 8], [0.5, 12, 'sineInOut'], [1, 8, 'sineInOut']] },
      a_bubble: { sx: SNORE, sy: SNORE },
      b_arm: { rot: [[0, 0], [0.125, -14, 'sineInOut'], [0.25, 6, 'sineInOut'], [0.375, -14, 'sineInOut'], [0.5, 6, 'sineInOut'], [0.625, -14, 'sineInOut'], [0.75, 6, 'sineInOut'], [0.875, -14, 'sineInOut'], [1, 0, 'sineInOut']] },
      b_head: { rot: [[0, 0], [0.5, -4, 'sineInOut'], [1, 0, 'sineInOut']] },
      // The red scooter creeps forward by itself, he brakes, it backs up.
      scooter_b: { x: [[0, 0], [0.3, 0, 'hold'], [0.5, 5, 'inOut'], [0.56, 4, 'out'], [0.84, 0, 'inOut'], [1, 0]] },
      b_body: { rot: [[0, 0], [0.5, 0, 'hold'], [0.54, -5, 'out'], [0.66, 0, 'inOut'], [1, 0]] },
      // The thrower weighs his medal.
      c_arm: { rot: [[0, 0], [0.25, -6, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -6, 'sineInOut'], [1, 0, 'sineInOut']] },
      c_head: { rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  },

  attack: {
    loop: false,
    seconds: 0.8,
    tracks: {
      // Further back, then overarm, and the medal is gone.
      c_arm: { rot: [[0, 0], [0.22, 24, 'out'], [0.42, -118, 'in'], [0.6, -104, 'out'], [1, 0, 'inOut']] },
      c_body: { rot: [[0, 0], [0.22, -6, 'out'], [0.42, 8, 'in'], [1, 0, 'inOut']] },
      c_head: { rot: [[0, 0], [0.22, -6, 'out'], [0.42, 6, 'in'], [1, 0, 'inOut']] },
      c_medal: {
        sx: [[0, 1], [0.4, 1, 'hold'], [0.42, 0, 'hold'], [0.9, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.4, 1, 'hold'], [0.42, 0, 'hold'], [0.9, 0, 'hold'], [1, 1, 'backOut']],
      },
      scooter_c: { x: [[0, 0], [0.42, 0, 'hold'], [0.5, -2, 'out'], [0.8, 0, 'inOut'], [1, 0]] },
      // The sleeper wakes with a start; the hologram stutters.
      a_head: { rot: [[0, 8], [0.42, 8, 'hold'], [0.5, -8, 'out'], [0.8, 4, 'inOut'], [1, 8, 'inOut']] },
      a_bubble: { sx: [[0, 1], [0.42, 1, 'hold'], [0.46, 0, 'out'], [0.9, 0, 'hold'], [1, 0.6, 'in']], sy: [[0, 1], [0.42, 1, 'hold'], [0.46, 0, 'out'], [0.9, 0, 'hold'], [1, 0.6, 'in']] },
      holo: { sx: [[0, 1], [0.42, 1, 'hold'], [0.46, 0.6, 'linear'], [0.5, 1.08, 'linear'], [0.54, 1, 'linear'], [1, 1]] },
      b_arm: { rot: rattle(-16, 4) },
    },
  },
};

export default laatsteRaad;
