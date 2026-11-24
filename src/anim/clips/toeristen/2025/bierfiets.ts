import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 15,
  wheels: { wheel_back: 15, wheel_front: 15 },
  bounce: 1,
  rock: 0.4,
};

/** Pedalling: down, up. The two halves of the party take turns. */
const PEDAL_A: Key[] = [[0, 0], [0.25, 3, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -1, 'sineInOut'], [1, 0, 'sineInOut']];
const PEDAL_B: Key[] = [[0, 0], [0.25, -1, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 3, 'sineInOut'], [1, 0, 'sineInOut']];

/** Swaying to music only they can hear. */
const SWAY: Key[] = [[0, -3], [0.5, 3, 'sineInOut'], [1, -3, 'sineInOut']];

/**
 * De Bierfiets: a bar on wheels, pedalled by a party in matching shirts and
 * the same hats. Standing still they sing and sway; on the move they pedal in
 * turns; in a fight the whole thing lurches into whoever is in the way and the
 * beer goes everywhere. It carries its own no-entry sign.
 */
const bierfiets: ClipSet = {
  idle: idling(1.6, 0.5, {
    party_a: { rot: SWAY, y: [[0, 0], [0.5, -1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
    party_b: { rot: [[0, 3], [0.5, -3, 'sineInOut'], [1, 3, 'sineInOut']], y: [[0, -1.5], [0.5, 0, 'sineInOut'], [1, -1.5, 'sineInOut']] },
    foam: { sx: [[0, 1], [0.5, 1.15, 'sineInOut'], [1, 1, 'sineInOut']], sy: [[0, 1], [0.5, 1.15, 'sineInOut'], [1, 1, 'sineInOut']] },
    sign: { rot: [[0, -1.5], [0.5, 1.5, 'sineInOut'], [1, -1.5, 'sineInOut']] },
  }),

  walk: roll(WHEELS, {
    party_a: { y: PEDAL_A, rate: 2 },
    party_b: { y: PEDAL_B, rate: 2 },
    sign: { rot: swing(3), rate: 2 },
    foam: { rot: swing(10), rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      ...shove([[0, 0], [0.26, -8, 'out'], [0.4, 16, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.26, -1.5, 'out'], [0.4, 2.5, 'in'], [0.62, -1, 'out'], [1, 0, 'inOut']] },
      // Everyone keeps going when the bike stops.
      party_a: { rot: [[0, 0], [0.26, -8, 'out'], [0.44, 14, 'in'], [0.7, -4, 'inOut'], [1, 0, 'inOut']] },
      party_b: { rot: [[0, 0], [0.26, -6, 'out'], [0.46, 16, 'in'], [0.72, -5, 'inOut'], [1, 0, 'inOut']] },
      // And the beer keeps going further.
      foam: {
        x: [[0, 0], [0.4, 0, 'hold'], [0.7, 12, 'out'], [0.71, 0, 'hold'], [1, 0]],
        y: [[0, 0], [0.4, 0, 'hold'], [0.55, -6, 'out'], [0.7, 2, 'in'], [0.71, 0, 'hold'], [1, 0]],
        sx: [[0, 1], [0.4, 1, 'hold'], [0.55, 2, 'out'], [0.7, 1.6, 'inOut'], [0.71, 0, 'hold'], [0.9, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.4, 1, 'hold'], [0.55, 1.8, 'out'], [0.7, 1.4, 'inOut'], [0.71, 0, 'hold'], [0.9, 0, 'hold'], [1, 1, 'backOut']],
      },
      sign: { rot: [[0, 0], [0.26, -6, 'out'], [0.44, 12, 'in'], [0.7, -6, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  hit: jolt({
    party_a: { rot: rattle(5, 3) },
    party_b: { rot: rattle(-5, 3) },
    sign: { rot: rattle(6, 3) },
  }),

  die: limpHome(WHEELS, {
    // Hungover already. The foam is long gone; the sign hangs.
    party_a: { rot: [[0, 10]], y: [[0, 4], [0.5, 6, 'sineInOut'], [1, 4, 'sineInOut']] },
    party_b: { rot: [[0, 12]], y: [[0, 5], [0.5, 3, 'sineInOut'], [1, 5, 'sineInOut']] },
    foam: { sx: [[0, 0]], sy: [[0, 0]] },
    sign: { rot: [[0, -18], [0.5, -14, 'sineInOut'], [1, -18, 'sineInOut']] },
  }),
};

export default bierfiets;
