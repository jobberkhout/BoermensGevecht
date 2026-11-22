import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** Chewing: the jaw slides sideways and drops a little, over and over. */
const CHEW_X: Key[] = [[0, 0], [0.25, -1.8, 'sineInOut'], [0.75, 1.6, 'sineInOut'], [1, 0, 'sineInOut']];
const CHEW_Y: Key[] = [[0, 0], [0.5, 2.2, 'sineInOut'], [1, 0, 'sineInOut']];
const GLOW: Key[] = [[0, 1], [0.5, 1.3, 'sineInOut'], [1, 1, 'sineInOut']];

/**
 * The melkrobot. The cow chews and looks the other way while the arm fusses
 * with the hose; the boer checks the tablet, then has a sip of coffee. When the
 * turret fires the udder kicks, her eye flares and her head jerks up, and the
 * boer only lifts his mug out of the way.
 */
const melkrobotClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      cow_jaw: { x: CHEW_X, y: CHEW_Y, rate: 7 },
      cow_head: { rot: [[0, 0], [0.3, 3, 'sineInOut'], [0.6, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      cow_glow: { sx: GLOW, sy: GLOW, rate: 3 },
      cow_body: { y: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      udder: { rot: swing(3), rate: 3 },
      // The arm lets go, thinks about it, and takes hold again.
      arm: { rot: [[0, 0], [0.18, 0, 'hold'], [0.24, -7, 'out'], [0.34, -7, 'hold'], [0.4, 1.5, 'in'], [0.46, 0, 'out'], [1, 0]] },
      // The boer: a look up at the tablet, then a long sip.
      boer_head: { rot: [[0, 0], [0.08, -9, 'inOut'], [0.36, -9, 'hold'], [0.46, 0, 'inOut'], [0.6, -7, 'inOut'], [0.82, -7, 'hold'], [0.94, 0, 'inOut'], [1, 0]] },
      boer_arm: { rot: [[0, 0], [0.5, 0, 'hold'], [0.62, -76, 'inOut'], [0.82, -76, 'hold'], [0.94, 0, 'inOut'], [1, 0]] },
      boer_body: { rot: [[0, 0], [0.6, 0, 'hold'], [0.66, -2, 'inOut'], [0.82, -2, 'hold'], [0.94, 0, 'inOut'], [1, 0]] },
    },
  },

  attack: {
    loop: false,
    seconds: 0.5,
    tracks: {
      // It starts with the squirt: the hose kicks up, the udder is squeezed flat.
      udder: {
        rot: [[0, -16], [0.3, 7, 'out'], [0.6, -3, 'inOut'], [1, 0, 'inOut']],
        sy: [[0, 0.8], [0.25, 1.15, 'out'], [1, 1, 'inOut']],
        sx: [[0, 1.12], [0.25, 0.95, 'out'], [1, 1, 'inOut']],
      },
      arm: { rot: [[0, -5], [0.3, 4, 'out'], [1, 0, 'inOut']] },
      cow_body: { x: rattle(1.6, 4) },
      cow_head: { rot: [[0, 11], [0.35, -3, 'out'], [1, 0, 'inOut']] },
      cow_jaw: { y: [[0, 4], [0.5, 0, 'out'], [1, 0]] },
      cow_glow: { sx: [[0, 2.2], [0.5, 1, 'out'], [1, 1]], sy: [[0, 2.2], [0.5, 1, 'out'], [1, 1]] },
      // Mind the coffee.
      boer_arm: { rot: [[0, -14], [0.4, -20, 'out'], [1, 0, 'inOut']] },
    },
  },
};

export default melkrobotClips;
