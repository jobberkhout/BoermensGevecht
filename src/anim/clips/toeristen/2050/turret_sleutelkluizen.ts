import { rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The one light that says yes, now and then, and never for long. */
const YES: Key[] = [[0, 0], [0.62, 0, 'hold'], [0.64, 1.2, 'out'], [0.7, 1, 'inOut'], [0.76, 1, 'hold'], [0.78, 0, 'in'], [1, 0, 'hold']];

/**
 * De Sleutelkluizentoren. The narrow house where the neighbours used to live,
 * its front now covered in key boxes. On one balcony a guest in the hotel robe
 * holds up an empty key ring and shrugs; on the ground a backpacker types the
 * code from the phone into the wrong box, looks up, and tries the next; on the
 * other balcony a guest in a loud shirt has found a key, and throws it.
 */
const sleutelkluizen: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      // The shrug: up, and down, and up.
      a_arms: { y: [[0, 0], [0.2, -3, 'out'], [0.3, 0, 'in'], [0.6, 0, 'hold'], [0.7, -3, 'out'], [0.8, 0, 'in'], [1, 0]] },
      a_head: { rot: [[0, 0], [0.2, -6, 'inOut'], [0.35, 6, 'inOut'], [0.5, 0, 'inOut'], [1, 0]] },
      // Phone, box, phone. Tap tap tap.
      c_head: { rot: [[0, 10], [0.3, 10, 'hold'], [0.4, -10, 'inOut'], [0.6, -10, 'hold'], [0.7, 10, 'inOut'], [1, 10]] },
      c_arm: { rot: [[0, 0], [0.1, -6, 'out'], [0.15, 0, 'in'], [0.2, -6, 'out'], [0.25, 0, 'in'], [0.8, 0, 'hold'], [0.85, -6, 'out'], [0.9, 0, 'in'], [1, 0]] },
      // The thrower tosses the key in the hand and waits for someone to aim at.
      b_arm: { rot: [[0, 0], [0.25, -8, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -8, 'sineInOut'], [1, 0, 'sineInOut']] },
      b_head: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      led: { sx: YES, sy: YES },
    },
  },

  attack: {
    loop: false,
    seconds: 0.7,
    tracks: {
      // Back over the shoulder, and the key goes.
      b_arm: { rot: [[0, 0], [0.25, -70, 'out'], [0.4, 30, 'in'], [0.65, 10, 'out'], [1, 0, 'inOut']] },
      b_body: { rot: [[0, 0], [0.25, -6, 'out'], [0.4, 6, 'in'], [1, 0, 'inOut']] },
      b_head: { rot: [[0, 0], [0.4, 8, 'in'], [1, 0, 'inOut']] },
      // The robe looks round: was that mine? The backpacker does not look up.
      a_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.55, 14, 'inOut'], [1, 0, 'inOut']] },
      a_arms: { y: rattle(2, 3) },
      c_arm: { rot: [[0, 0], [0.3, -6, 'out'], [0.4, 0, 'in'], [0.5, -6, 'out'], [0.6, 0, 'in'], [1, 0]] },
    },
  },
};

export default sleutelkluizen;
