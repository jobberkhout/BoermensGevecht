import { rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The laser flickers while it measures. */
const FLICKER: Key[] = [[0, 1], [0.1, 0.7, 'linear'], [0.2, 1, 'linear'], [0.35, 0.8, 'linear'], [0.5, 1, 'linear'], [1, 1, 'hold']];

/**
 * De IJscommissie. Three wardens of the ice in shorts, shirts of flowers and
 * the armband of office, under a parasol. On a cooled plinth stands the last
 * ice cube of Fryslân, in a puddle. One kneels to it with a laser gauge and
 * finds it one millimetre short, again; the chairman fans himself with the
 * report; the third takes a cube from the cool box and throws it.
 */
const ijscommissie: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      // Measure, look at the gauge, shake the head, measure again.
      a_arm: { rot: [[0, 0], [0.3, 0, 'hold'], [0.4, -10, 'inOut'], [0.56, -10, 'hold'], [0.66, 0, 'inOut'], [1, 0]] },
      a_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.48, -8, 'inOut'], [0.56, 8, 'inOut'], [0.64, -6, 'inOut'], [0.72, 0, 'inOut'], [1, 0]] },
      beam: { sx: [[0, 1], [0.38, 1, 'hold'], [0.4, 0, 'hold'], [0.66, 0, 'hold'], [0.68, 1, 'hold'], [1, 1]] },
      // The chairman fans, faster as it gets hotter.
      b_arm: { rot: [[0, 0], [0.125, -22, 'sineInOut'], [0.25, 0, 'sineInOut'], [0.375, -22, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.625, -22, 'sineInOut'], [0.75, 0, 'sineInOut'], [0.875, -22, 'sineInOut'], [1, 0, 'sineInOut']] },
      b_head: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      // The thrower weighs his cube and waits.
      c_arm: { rot: [[0, 0], [0.25, -6, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -6, 'sineInOut'], [1, 0, 'sineInOut']] },
      c_head: { rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  },

  attack: {
    loop: false,
    seconds: 0.7,
    tracks: {
      // Back over the shoulder, and the cube goes.
      c_arm: { rot: [[0, 0], [0.25, -80, 'out'], [0.4, 40, 'in'], [0.65, 15, 'out'], [1, 0, 'inOut']] },
      c_body: { rot: [[0, 0], [0.25, -6, 'out'], [0.4, 6, 'in'], [1, 0, 'inOut']] },
      c_cube: {
        sx: [[0, 1], [0.38, 1, 'hold'], [0.4, 0, 'hold'], [0.9, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.38, 1, 'hold'], [0.4, 0, 'hold'], [0.9, 0, 'hold'], [1, 1, 'backOut']],
      },
      // The kneeling one jumps: careful, not the real one!
      a_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.5, 14, 'out'], [1, 0, 'inOut']] },
      a_body: { y: [[0, 0], [0.4, 0, 'hold'], [0.48, -3, 'out'], [0.6, 0, 'in'], [1, 0]] },
      beam: { sx: FLICKER },
      b_arm: { rot: rattle(14, 3) },
    },
  },
};

export default ijscommissie;
