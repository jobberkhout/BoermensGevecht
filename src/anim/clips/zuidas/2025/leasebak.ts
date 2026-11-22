import { swing } from '../../../humanoid.ts';
import { chatter, rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 23,
  wheels: { wheel_back: 23, wheel_front: 23 },
  bounce: 0.8,
  rock: 0.3,
};

/** A light that is switched off. */
const OFF: Track = { sx: [[0, 0]], sy: [[0, 0]] };

/** Hazard lights: on, off, on, off. */
const HAZARD: Key[] = [[0, 1], [0.25, 0, 'hold'], [0.5, 1, 'hold'], [0.75, 0, 'hold'], [1, 1, 'hold']];

/** Main beam: two quick flashes before the hit and a long one on it. */
const FLASH: Key[] = [[0, 0], [0.04, 1, 'hold'], [0.12, 0, 'hold'], [0.18, 1, 'hold'], [0.26, 0, 'hold'], [0.36, 1, 'hold'], [0.54, 0, 'hold'], [1, 0, 'hold']];

/** He nods along with whoever is on the line. */
const NOD: Key[] = [[0, 0], [0.2, 4, 'sineInOut'], [0.45, -3, 'sineInOut'], [0.7, 4, 'sineInOut'], [1, 0, 'sineInOut']];

/**
 * De Leasebak: the partner is on a call, so the car does what it likes. Parked
 * it stands with its hazard lights on. In a fight it sits on your bumper,
 * flashes its main beam and then closes the gap. The ski box and the charging
 * cable come along for everything.
 */
const leasebak: ClipSet = {
  idle: idling(2.4, 0.25, {
    blink: { sx: HAZARD, sy: HAZARD },
    flash: OFF,
    mouth: { sy: chatter(0.04, 0.92, 11) },
    partner: { rot: NOD },
  }),

  walk: roll(WHEELS, {
    blink: OFF,
    flash: OFF,
    mouth: { sy: chatter(0, 1, 5) },
    partner: { rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']] },
    skibox: { rot: swing(0.7), rate: 3 },
    cable: { rot: swing(5), rate: 3 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.38 },
    tracks: {
      ...shove([[0, 0], [0.24, -8, 'out'], [0.38, 18, 'in'], [0.62, 6, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.24, -1.5, 'out'], [0.38, 2.5, 'in'], [0.62, -1, 'out'], [1, 0, 'inOut']] },
      flash: { sx: FLASH, sy: FLASH },
      blink: OFF,
      // The box keeps going when the car stops.
      skibox: { x: [[0, 0], [0.24, -2, 'out'], [0.38, 0, 'in'], [0.5, 9, 'out'], [0.8, 0, 'inOut'], [1, 0]] },
      // So does he. He does not hang up.
      partner: { rot: [[0, 0], [0.24, -6, 'out'], [0.42, 14, 'in'], [0.7, 2, 'out'], [1, 0, 'inOut']] },
      mouth: { sy: [[0, 1], [0.8, 1, 'hold'], [1, 0.18, 'in']] },
      cable: { rot: [[0, 0], [0.24, -8, 'out'], [0.38, 14, 'in'], [0.7, -5, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  hit: jolt({
    skibox: { rot: rattle(3, 3) },
    partner: { rot: [[0, 0], [0.3, -10, 'out'], [1, 0, 'inOut']] },
    cable: { rot: rattle(8, 3) },
  }),

  die: limpHome(WHEELS, {
    blink: { sx: HAZARD, sy: HAZARD },
    flash: OFF,
    // Still on the line. This is going on someone's invoice.
    mouth: { sy: chatter(0, 1, 6) },
    partner: { rot: [[0, 8], [0.5, 12, 'sineInOut'], [1, 8, 'sineInOut']], rate: 2 },
    skibox: { rot: swing(3), rate: 3 },
    cable: { rot: swing(10), rate: 3 },
  }),
};

export default leasebak;
