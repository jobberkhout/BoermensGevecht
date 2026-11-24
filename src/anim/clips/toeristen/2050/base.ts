import type { Clip, Key } from '../../../types.ts';

/** The turnstile clicks a third of a turn, waits, clicks again. */
const CLICK: Key[] = [[0, 0], [0.2, 0, 'hold'], [0.28, 120, 'inOut'], [0.6, 120, 'hold'], [0.68, 240, 'inOut'], [1, 240, 'hold']];

/**
 * De Stadspoort does not move, but the theme park on it does: the roller
 * coaster goes round over the old town, the turnstile in the gate clicks
 * another visitor through, and the clock on the waiting-time board turns,
 * though the wait stays four hours.
 */
const stadspoortClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 6,
    tracks: {
      car: { rot: [[0, 0], [1, 360, 'linear']], rate: 2 },
      turnstile: { rot: CLICK },
      hand: { rot: [[0, 0], [1, 360, 'linear']] },
    },
  },
};

export default stadspoortClips;
