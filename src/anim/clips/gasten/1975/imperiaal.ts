import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 14,
  wheels: { wheel_back: 14, wheel_front: 14 },
  bounce: 1.6,
  rock: 0.6,
};

/** The load lags behind the car: a gentle sway, a little later than the body. */
const LAG: Key[] = [[0, 0], [0.35, 1.6, 'sineInOut'], [0.85, -1.6, 'sineInOut'], [1, 0, 'sineInOut']];

/**
 * De Imperiaal: 3000 kilometres every summer, and the roof rack twice the
 * height of the car. Standing, the engine ticks over and the father drums on
 * the wheel. Driving, everything on the rack sways a moment after the car and
 * the bathtub hops on the bumps. It hits by surging forward, and the load
 * nearly carries on without it.
 */
const imperiaal: ClipSet = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      body: { y: [[0, 0], [0.5, -0.7, 'sineInOut'], [1, 0, 'sineInOut']], rate: 6 },
      load: { rot: [[0, 0], [0.5, 0.6, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      tub: { y: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']], rate: 6 },
      fridge: { rot: [[0, 0], [0.5, 1, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      // Drumming on the wheel, then a look in the mirror.
      driver: {
        y: [[0, 0], [0.08, -1, 'out'], [0.16, 0, 'in'], [0.24, -1, 'out'], [0.32, 0, 'in'], [0.4, -1, 'out'], [0.48, 0, 'in'], [1, 0, 'hold']],
        rot: [[0, 0], [0.6, 0, 'hold'], [0.7, -10, 'inOut'], [0.86, -10, 'hold'], [0.96, 0, 'inOut'], [1, 0, 'hold']],
      },
    },
  },

  walk: roll(WHEELS, {
    load: { rot: LAG, x: swing(0.8), rate: 2 },
    tub: { y: [[0, 0], [0.2, -3.5, 'out'], [0.4, 0, 'in'], [1, 0, 'hold']], rot: [[0, 0], [0.2, -2, 'out'], [0.4, 0, 'in'], [1, 0, 'hold']], rate: 2 },
    fridge: { rot: swing(2.4, 0, 0.2), rate: 2 },
    driver: { rot: swing(1.4), rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.36 },
    tracks: {
      ...shove([[0, 0], [0.22, -12, 'out'], [0.36, 18, 'in'], [0.62, 6, 'out'], [1, 0, 'inOut']], WHEELS),
      body: {
        rot: [[0, 0], [0.22, -2.4, 'out'], [0.36, 3, 'in'], [0.55, -1, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.22, -2, 'out'], [0.36, 1.6, 'in'], [1, 0, 'inOut']],
      },
      // The load arrives a moment after the car, and slides back.
      load: {
        x: [[0, 0], [0.22, -4, 'out'], [0.44, 8, 'in'], [0.7, -2, 'inOut'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.22, -2, 'out'], [0.44, 4, 'in'], [0.7, -1.5, 'inOut'], [1, 0, 'inOut']],
      },
      tub: {
        y: [[0, 0], [0.36, 0, 'hold'], [0.46, -8, 'out'], [0.6, 0, 'in'], [0.68, -2, 'out'], [0.76, 0, 'in'], [1, 0, 'hold']],
        rot: [[0, 0], [0.36, 0, 'hold'], [0.46, 6, 'out'], [0.6, 0, 'in'], [1, 0, 'hold']],
      },
      fridge: { rot: [[0, 0], [0.22, -6, 'out'], [0.44, 9, 'in'], [0.66, -4, 'inOut'], [1, 0, 'inOut']] },
      driver: { rot: [[0, 0], [0.22, -8, 'out'], [0.36, 14, 'in'], [0.6, 3, 'out'], [1, 0, 'inOut']] },
    },
  },

  hit: jolt({
    load: { rot: rattle(3, 3) },
    tub: { y: [[0, 0], [0.3, -4, 'out'], [0.6, 0, 'in'], [1, 0, 'hold']] },
    fridge: { rot: rattle(6, 3) },
    driver: { rot: [[0, 0], [0.3, -10, 'out'], [1, 0, 'inOut']] },
  }),

  die: limpHome(WHEELS, {
    // Home again, the load hanging off one side and the tub on the slant.
    load: { rot: [[0, -4], [0.5, -2, 'sineInOut'], [1, -4, 'sineInOut']], rate: 2 },
    tub: { rot: [[0, -9]], y: [[0, 2]] },
    fridge: { rot: [[0, 7], [0.5, 10, 'sineInOut'], [1, 7, 'sineInOut']], rate: 3 },
    driver: { y: [[0, 3]], rot: [[0, 10], [0.5, 14, 'sineInOut'], [1, 10, 'sineInOut']], rate: 2 },
  }),
};

export default imperiaal;
