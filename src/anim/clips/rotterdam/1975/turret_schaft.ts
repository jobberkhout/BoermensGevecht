import { chatter } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The tin leaves his hand at the throw and is back (he has another) by the end. */
const TIN_GONE: Key[] = [[0, 1], [0.38, 1, 'hold'], [0.4, 0, 'hold'], [0.86, 0, 'hold'], [1, 1, 'backOut']];

/**
 * De Schaft. A pours himself a bakkie and slurps it; B works through a
 * sandwich as thick as a brick while the gull edges closer; C shakes his tin
 * by his ear to hear what is in it today. When the turret fires, C winds up
 * and lobs the tin at the enemy, the other two lean over to watch it go, and
 * the gull ducks.
 */
const schaftClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      // A bakkie: up to the mouth, head back, slurp, down again.
      a_arm: { rot: [[0, 0], [0.1, 0, 'hold'], [0.2, -42, 'inOut'], [0.36, -46, 'linear'], [0.46, 0, 'inOut'], [1, 0, 'hold']] },
      a_head: { rot: [[0, 0], [0.14, 0, 'hold'], [0.22, -12, 'inOut'], [0.36, -14, 'linear'], [0.46, 0, 'inOut'], [0.7, 0, 'hold'], [0.78, 6, 'sineInOut'], [0.9, 0, 'sineInOut'], [1, 0, 'hold']] },
      a_body: { y: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']] },
      // A bite, and chew; another bite, and chew.
      b_arm: { rot: [[0, 0], [0.04, -12, 'out'], [0.1, 0, 'in'], [0.5, 0, 'hold'], [0.54, -12, 'out'], [0.6, 0, 'in'], [1, 0, 'hold']] },
      b_head: {
        rot: [[0, 0], [0.04, 8, 'out'], [0.1, 0, 'in'], [0.5, 0, 'hold'], [0.54, 8, 'out'], [0.6, 0, 'in'], [1, 0, 'hold']],
        sy: chatter(0.1, 0.45, 6, 1).map((k): Key => [k[0], k[1] === 1 ? 1 : 0.97 + 0.03 * (1 - k[1]), k[2]]),
      },
      // He holds the tin up and shakes it. Cheese again.
      c_arm: { rot: [[0, 0], [0.3, 0, 'hold'], [0.38, -30, 'inOut'], [0.42, -24, 'inOut'], [0.46, -32, 'inOut'], [0.5, -24, 'inOut'], [0.54, -32, 'inOut'], [0.62, 0, 'inOut'], [1, 0, 'hold']] },
      c_head: { rot: [[0, 0], [0.34, 0, 'hold'], [0.4, -10, 'inOut'], [0.56, -10, 'hold'], [0.64, 0, 'inOut'], [0.7, 6, 'inOut'], [0.76, -6, 'inOut'], [0.82, 0, 'inOut'], [1, 0, 'hold']] },
      // The gull shuffles towards the sandwich, and back.
      gull: {
        x: [[0, 0], [0.5, 0, 'hold'], [0.56, 3, 'out'], [0.62, 6, 'out'], [0.9, 6, 'hold'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.5, 0, 'hold'], [0.53, 6, 'out'], [0.56, 0, 'in'], [0.59, 6, 'out'], [0.62, 0, 'in'], [1, 0, 'hold']],
      },
    },
  },

  attack: {
    loop: false,
    seconds: 0.8,
    tracks: {
      // Wind up behind his head, and lob.
      c_arm: { rot: [[0, 0], [0.24, -150, 'out'], [0.4, 10, 'in'], [0.6, 4, 'out'], [1, 0, 'inOut']] },
      c_body: { rot: [[0, 0], [0.24, -6, 'out'], [0.4, 7, 'in'], [1, 0, 'inOut']] },
      c_head: { rot: [[0, 0], [0.24, -8, 'out'], [0.4, 6, 'in'], [1, 0, 'inOut']] },
      c_tin: { sx: TIN_GONE, sy: TIN_GONE },
      // The others lean over and look up to follow it.
      a_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.52, -10, 'out'], [0.86, -6, 'linear'], [1, 0, 'inOut']] },
      b_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.5, -12, 'out'], [0.86, -8, 'linear'], [1, 0, 'inOut']] },
      b_body: { rot: [[0, 0], [0.4, 0, 'hold'], [0.5, 4, 'out'], [0.86, 4, 'hold'], [1, 0, 'inOut']] },
      // The gull ducks.
      gull: { sy: [[0, 1], [0.36, 1, 'hold'], [0.42, 0.72, 'out'], [0.7, 0.72, 'hold'], [0.84, 1, 'backOut'], [1, 1, 'hold']] },
    },
  },
};

export default schaftClips;
