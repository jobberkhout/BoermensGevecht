import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The stand turning: each tier squeezes flat and opens again, as a spinner seen from the side does. */
function spin(late: number): Key[] {
  return [[0, 1], [late, 1, 'hold'], [late + 0.12, 0.12, 'sineIn'], [late + 0.24, 1, 'sineOut'], [1, 1, 'hold']];
}

/**
 * De Ansichtkaartenmolen. The customer turns the stand and turns it again; she
 * has been choosing for forty minutes. The seller winks, flicks a card between
 * his fingers and waits. When the turret fires he has just sent one flying:
 * his arm is out, the card is gone, and the stand spins in the draught.
 */
const ansichtkaartenClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      tier_top: { sx: spin(0.1) },
      tier_low: { sx: spin(0.14) },
      browser_arm: { rot: [[0, 0], [0.06, -14, 'out'], [0.2, 0, 'inOut'], [0.56, 0, 'hold'], [0.62, -14, 'out'], [0.76, 0, 'inOut'], [1, 0, 'hold']] },
      browser_head: { rot: [[0, 0], [0.14, -6, 'sineInOut'], [0.34, 4, 'sineInOut'], [0.56, -2, 'sineInOut'], [0.7, -6, 'sineInOut'], [0.9, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      browser: { rot: swing(1.5) },
      // The seller rolls a card over his knuckles and nods to the street.
      seller_arm: { rot: [[0, 0], [0.3, -10, 'sineInOut'], [0.4, 4, 'sineInOut'], [0.5, -10, 'sineInOut'], [0.62, 0, 'sineInOut'], [1, 0, 'hold']] },
      card: { rot: [[0, 0], [0.3, 0, 'hold'], [0.36, 180, 'inOut'], [0.46, 360, 'inOut'], [1, 360, 'hold']] },
      seller_head: { rot: [[0, 0], [0.62, 0, 'hold'], [0.7, 6, 'sineInOut'], [0.78, -2, 'sineInOut'], [0.86, 0, 'sineInOut'], [1, 0, 'hold']] },
      seller: { rot: swing(1.2) },
    },
  },

  attack: {
    loop: false,
    seconds: 0.7,
    tracks: {
      // Flick: the card has just left his fingers.
      seller_arm: { rot: [[0, -56], [0.25, -36, 'out'], [0.6, 8, 'inOut'], [1, 0, 'inOut']] },
      card: {
        sx: [[0, 0], [0.72, 0, 'hold'], [0.86, 1, 'backOut'], [1, 1]],
        sy: [[0, 0], [0.72, 0, 'hold'], [0.86, 1, 'backOut'], [1, 1]],
        rot: [[0, 0]],
      },
      seller: { rot: [[0, 6], [0.3, 3, 'out'], [1, 0, 'inOut']] },
      seller_head: { rot: [[0, -6], [0.3, -3, 'out'], [1, 0, 'inOut']] },
      // The stand spins in the draught; the customer jumps.
      tier_top: { sx: [[0, 1], [0.1, 0.1, 'sineIn'], [0.2, 1, 'sineOut'], [0.3, 0.1, 'sineIn'], [0.42, 1, 'sineOut'], [0.56, 0.1, 'sineIn'], [0.72, 1, 'sineOut'], [1, 1]] },
      tier_low: { sx: [[0, 1], [0.14, 0.1, 'sineIn'], [0.26, 1, 'sineOut'], [0.38, 0.1, 'sineIn'], [0.52, 1, 'sineOut'], [0.68, 0.1, 'sineIn'], [0.84, 1, 'sineOut'], [1, 1]] },
      stand: { rot: rattle(2, 3) },
      browser_head: { rot: [[0, 0], [0.12, -12, 'out'], [0.5, -6, 'inOut'], [1, 0, 'inOut']], y: [[0, 0], [0.12, -3, 'out'], [0.5, 0, 'in'], [1, 0]] },
      browser_arm: { rot: [[0, 0], [0.12, -30, 'out'], [0.6, -8, 'inOut'], [1, 0, 'inOut']] },
    },
  },
};

export default ansichtkaartenClips;
