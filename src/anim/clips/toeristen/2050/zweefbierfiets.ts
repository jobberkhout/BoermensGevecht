import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

/** The fans turn with the distance, as wheels would. */
const FANS: RollStyle = { bigWheel: 10, wheels: { wheel_back: 10, wheel_front: 10 }, bounce: 2.4, rock: 0.7 };

const TURN: Key[] = [[0, 0], [1, 360, 'linear']];

/** Everyone pedals, a little out of step, as a party does. */
function pedalling(rate: number): Record<string, Track> {
  return {
    crank_a: { rot: TURN, rate },
    crank_b: { rot: [[0, 90], [1, 450, 'linear']], rate },
    crank_c: { rot: [[0, 200], [1, 560, 'linear']], rate },
    crank_d: { rot: [[0, 300], [1, 660, 'linear']], rate },
  };
}

/** Beers up, beers down, each guest on their own beat. */
function cheering(amp: number, rate: number): Record<string, Track> {
  return {
    guest_a: { rot: [[0, 0], [0.5, -amp, 'sineInOut'], [1, 0, 'sineInOut']], y: [[0, 0], [0.5, -1.4, 'sineInOut'], [1, 0, 'sineInOut']], rate },
    guest_b: { rot: [[0, -amp], [0.5, 0, 'sineInOut'], [1, -amp, 'sineInOut']], y: [[0, -1.4], [0.5, 0, 'sineInOut'], [1, -1.4, 'sineInOut']], rate },
    guest_c: { rot: [[0, -amp * 0.6], [0.25, 0, 'sineInOut'], [0.75, -amp, 'sineInOut'], [1, -amp * 0.6, 'sineInOut']], rate },
    guest_d: { rot: [[0, 0], [0.25, -amp, 'sineInOut'], [0.75, 0, 'sineInOut'], [1, 0]], y: [[0, 0], [0.25, -1.4, 'sineInOut'], [0.75, 0, 'sineInOut'], [1, 0]], rate },
  };
}

/** The bass, pumping out of the speaker. */
const THUMP: Key[] = [[0, 0.8], [0.12, 1.25, 'out'], [0.5, 0.8, 'in'], [0.62, 1.25, 'out'], [1, 0.8, 'in']];

/**
 * De Zweefbierfiets. The beer bike, banned from the street, now hovers over it,
 * with the sign that banned it hanging underneath as a trophy. A hen party in
 * matching pink pedals at the bar under a striped canopy; the DJ on the back
 * has one hand in the air at all times, and the bass comes out of the speaker
 * in rings. It is out of reach: the shadow on the road is a long way down.
 * To attack it lurches forward and the bass goes off; beaten, it drifts home
 * on one fan, nose down, the party slumped over the bar.
 */
const zweefbierfiets: ClipSet = {
  idle: {
    loop: true,
    seconds: 2,
    tracks: {
      body: { y: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      // The higher it bobs, the smaller its shadow.
      shadow: { sx: [[0, 1], [0.5, 0.94, 'sineInOut'], [1, 1, 'sineInOut']] },
      jets: { sy: [[0, 1], [0.5, 0.8, 'sineInOut'], [1, 1, 'sineInOut']], rate: 2 },
      wheel_back: { rot: TURN, rate: 2 },
      wheel_front: { rot: TURN, rate: 2 },
      ...pedalling(1),
      ...cheering(5, 2),
      dj: { rot: [[0, 0], [0.25, 4, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      dj_arm: { rot: [[0, 0], [0.25, -14, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -14, 'sineInOut'], [1, 0, 'sineInOut']] },
      bass: { sx: THUMP, sy: THUMP, rate: 2 },
      sign: { rot: [[0, -6], [0.5, 6, 'sineInOut'], [1, -6, 'sineInOut']] },
    },
  },

  walk: roll(FANS, {
    jets: { sy: [[0, 1], [0.5, 0.75, 'sineInOut'], [1, 1, 'sineInOut']], rate: 3 },
    shadow: { sx: [[0, 1], [0.5, 0.95, 'sineInOut'], [1, 1, 'sineInOut']], rate: 3 },
    ...pedalling(2),
    ...cheering(4, 1),
    dj_arm: { rot: [[0, 0], [0.5, -18, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
    bass: { sx: THUMP, sy: THUMP, rate: 2 },
    // The trophy swings back in the wind.
    sign: { rot: [[0, 14], [0.5, 20, 'sineInOut'], [1, 14, 'sineInOut']], rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      ...shove([[0, 0], [0.22, -10, 'out'], [0.4, 14, 'in'], [0.62, 5, 'out'], [1, 0, 'inOut']], FANS),
      body: { rot: [[0, 0], [0.22, -2.4, 'out'], [0.4, 3, 'in'], [0.6, -1, 'out'], [1, 0, 'inOut']] },
      // Everyone lurches forward, beers first.
      guest_a: { rot: [[0, 0], [0.22, -8, 'out'], [0.42, 16, 'in'], [0.64, -4, 'inOut'], [1, 0, 'inOut']] },
      guest_b: { rot: [[0, 0], [0.24, -8, 'out'], [0.44, 18, 'in'], [0.66, -4, 'inOut'], [1, 0, 'inOut']] },
      guest_c: { rot: [[0, 0], [0.22, -10, 'out'], [0.42, 15, 'in'], [0.62, -3, 'inOut'], [1, 0, 'inOut']] },
      guest_d: { rot: [[0, 0], [0.26, -8, 'out'], [0.46, 18, 'in'], [0.68, -4, 'inOut'], [1, 0, 'inOut']] },
      dj: { rot: [[0, 0], [0.22, -6, 'out'], [0.4, 8, 'in'], [1, 0, 'inOut']] },
      dj_arm: { rot: [[0, 0], [0.3, -30, 'out'], [0.4, 10, 'in'], [1, 0, 'inOut']] },
      // The drop: the bass goes off in one big ring.
      bass: {
        sx: [[0, 1], [0.36, 0.8, 'out'], [0.5, 2.6, 'out'], [0.8, 1.2, 'inOut'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.36, 0.8, 'out'], [0.5, 2.6, 'out'], [0.8, 1.2, 'inOut'], [1, 1, 'inOut']],
      },
      sign: { rot: [[0, 0], [0.22, -20, 'out'], [0.42, 30, 'in'], [0.7, -10, 'inOut'], [1, 0, 'inOut']] },
      jets: { sy: [[0, 1], [0.22, 0.6, 'out'], [0.4, 1.4, 'in'], [1, 1, 'inOut']] },
    },
  },

  hit: jolt({
    guest_a: { rot: rattle(6, 3) },
    guest_c: { rot: rattle(6, 3) },
    sign: { rot: rattle(16, 3) },
    jets: { sx: [[0, 1], [0.2, 0.5, 'hold'], [0.4, 1, 'hold'], [1, 1]] },
  }),

  // Home on one fan, nose down; the party slumped over, the music off.
  die: limpHome(FANS, {
    body: { rot: [[0, 3], [0.5, 5, 'sineInOut'], [1, 3, 'sineInOut']], y: [[0, 4], [0.5, 2, 'sineInOut'], [1, 4, 'sineInOut']], rate: 3 },
    guest_a: { rot: [[0, 22]] },
    guest_b: { rot: [[0, 26]] },
    guest_c: { rot: [[0, 18]] },
    guest_d: { rot: [[0, 24]] },
    dj: { rot: [[0, 14]] },
    dj_arm: { rot: [[0, 150]] },
    bass: { sx: [[0, 0.2]], sy: [[0, 0.2]] },
    sign: { rot: [[0, 8], [0.5, -8, 'sineInOut'], [1, 8, 'sineInOut']] },
    jets: { sy: [[0, 0.5], [0.5, 0.2, 'hold'], [1, 0.5, 'hold']], rate: 4 },
  }),
};

export default zweefbierfiets;
