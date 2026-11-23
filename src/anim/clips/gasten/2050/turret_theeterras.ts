import { rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The tea stream: on while she pours, gone while she lifts the pot for the next glass. */
const POUR: Key[] = [[0, 1], [0.4, 1, 'hold'], [0.44, 0, 'in'], [0.7, 0, 'hold'], [0.76, 1, 'out'], [1, 1]];

/**
 * Het Theeterras. Three generations on a floating terrace, each with their own
 * tea: great-grandfather with Turkish tea in a tulip glass, grandmother pouring
 * mint tea from as high as her arm will go, and the great-grandson with an iced
 * tea in a cup that lights up. The sugar is for everyone. He flicks it at the
 * enemy with a spoon; nobody tells him not to, because nobody is looking.
 */
const theeterras: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      // A sip, a sigh, and the glass back down.
      gp_arm: { rot: [[0, 0], [0.16, -18, 'inOut'], [0.34, -18, 'hold'], [0.46, 0, 'inOut'], [1, 0]] },
      gp_head: { rot: [[0, 0], [0.16, -6, 'inOut'], [0.34, -6, 'hold'], [0.5, 4, 'inOut'], [0.7, 0, 'inOut'], [1, 0]] },
      gp_steam: { sy: [[0, 1], [0.5, 1.3, 'sineInOut'], [1, 1, 'sineInOut']], sx: [[0, 1], [0.5, 0.8, 'sineInOut'], [1, 1, 'sineInOut']], rate: 2 },
      // The high pour: the pot goes up as the glass fills, then comes down for the next.
      mum_arm: { rot: [[0, 0], [0.4, -6, 'sineInOut'], [0.56, 10, 'inOut'], [0.7, 10, 'hold'], [0.8, 0, 'inOut'], [1, 0]] },
      stream: { sy: POUR, sx: POUR },
      mum_head: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      // He sips through the straw and bobs to something only he can hear.
      kid_cup: { rot: [[0, 0], [0.6, 0, 'hold'], [0.68, -26, 'inOut'], [0.86, -26, 'hold'], [0.94, 0, 'inOut'], [1, 0]] },
      kid_head: { rot: [[0, 0], [0.125, 5, 'sineInOut'], [0.25, 0, 'sineInOut'], [0.375, 5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.625, 5, 'sineInOut'], [0.75, 0, 'sineInOut'], [0.875, 5, 'sineInOut'], [1, 0, 'sineInOut']] },
      kid_arm: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  },

  attack: {
    loop: false,
    seconds: 0.7,
    tracks: {
      // Spoon down, and flick: the cube is gone.
      kid_arm: { rot: [[0, 0], [0.2, 26, 'out'], [0.34, -40, 'in'], [0.6, -24, 'out'], [1, 0, 'inOut']] },
      kid_body: { rot: [[0, 0], [0.2, -4, 'out'], [0.34, 5, 'in'], [1, 0, 'inOut']] },
      kid_head: { rot: [[0, 0], [0.34, -8, 'in'], [1, 0, 'inOut']] },
      // Great-grandfather nods: good shot. Grandmother keeps pouring, a little faster.
      gp_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.5, 10, 'inOut'], [0.6, 0, 'inOut'], [0.7, 10, 'inOut'], [0.8, 0, 'inOut'], [1, 0]] },
      mum_arm: { rot: [[0, 0], [0.3, -10, 'out'], [1, 0, 'inOut']] },
      gp_arm: { rot: rattle(4, 3) },
    },
  },
};

export default theeterras;
