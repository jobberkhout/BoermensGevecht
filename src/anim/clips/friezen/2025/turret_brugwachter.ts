import { rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The rain comes down: a short drop, then the same drops start again from the top. */
const RAIN: Key[] = [[0, -6], [1, 6, 'linear']];
/** The clog swings on its line. */
const DANGLE: Key[] = [[0, -8], [0.5, 8, 'sineInOut'], [1, -8, 'sineInOut']];

/**
 * De Brugwachter. The bridge is up, so the keeper has time: he holds out the
 * rod with the toll clog on its line, the way it was held out to every passing
 * boat, and lets it dangle in the drizzle. One angler sleeps under his hood,
 * the other drinks coffee and watches the keeper rather than his float. When
 * the turret fires the keeper swings the rod back and flings the clog over the
 * water; the anglers duck, and a new clog is on the line before anyone asks.
 */
const brugwachterClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      rain: { y: RAIN, rate: 4 },
      rod: { rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']] },
      clog: { rot: DANGLE, rate: 2 },
      keeper_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.5, 8, 'sineInOut'], [0.7, 8, 'hold'], [0.8, 0, 'sineInOut'], [1, 0]] },
      // A asleep: the slow nod of a man who will not catch anything today.
      angler_a: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      angler_b: { rot: [[0, 0], [0.3, -4, 'sineInOut'], [0.45, -4, 'hold'], [0.6, 0, 'sineInOut'], [1, 0]] },
      float_a: { y: [[0, 0], [0.25, -1.5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -1, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
    },
  },

  attack: {
    loop: false,
    seconds: 0.7,
    tracks: {
      // Back over his shoulder, and out over the canal: the clog flies off its line.
      rod: { rot: [[0, 0], [0.25, -34, 'out'], [0.45, 26, 'in'], [0.65, 16, 'out'], [1, 0, 'inOut']] },
      keeper: { rot: [[0, 0], [0.25, -5, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']] },
      keeper_head: { rot: [[0, 0], [0.25, -6, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']] },
      clog: {
        rot: [[0, 0], [0.25, 30, 'out'], [0.44, -40, 'in'], [1, 0, 'inOut']],
        sx: [[0, 1], [0.44, 1, 'hold'], [0.46, 0, 'hold'], [0.86, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.44, 1, 'hold'], [0.46, 0, 'hold'], [0.86, 0, 'hold'], [1, 1, 'backOut']],
      },
      // The anglers duck.
      angler_a: { rot: [[0, 0], [0.4, 0, 'hold'], [0.5, 12, 'out'], [0.8, 12, 'hold'], [1, 0, 'inOut']], y: [[0, 0], [0.4, 0, 'hold'], [0.5, 3, 'out'], [0.8, 3, 'hold'], [1, 0, 'inOut']] },
      angler_b: { rot: [[0, 0], [0.4, 0, 'hold'], [0.5, -10, 'out'], [0.8, -10, 'hold'], [1, 0, 'inOut']] },
      float_a: { y: rattle(2, 4) },
      rain: { y: RAIN, rate: 2 },
    },
  },
};

export default brugwachterClips;
