import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

/** The fans turn with the distance, as wheels would. */
const FANS: RollStyle = { bigWheel: 12, wheels: { wheel_back: 12, wheel_front: 12 }, bounce: 2.4, rock: 0.8 };

/** The glow under the fans breathes. */
const PULSE: Key[] = [[0, 1], [0.5, 0.75, 'sineInOut'], [1, 1, 'sineInOut']];

/**
 * De Zweefimperiaal. The summer car of the future: it hovers, the trip south
 * takes forty minutes, and still the roof rack is packed higher than ever,
 * with the blue bathtub that has gone along every summer since 1975 and a
 * robot vacuum on top. Hovering, it bobs. It rams with everything on the roof
 * lurching forward; beaten, it limps home on one fan with the load askew.
 */
const zweefimperiaal: ClipSet = {
  idle: {
    loop: true,
    seconds: 1.8,
    tracks: {
      body: { y: [[0, 0], [0.5, -2.4, 'sineInOut'], [1, 0, 'sineInOut']] },
      load: { rot: [[0, 0], [0.5, 1.2, 'sineInOut'], [1, 0, 'sineInOut']] },
      vacuum: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']], y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      jets: { sy: PULSE, rate: 2 },
      // The fans keep turning, slowly, to keep it up.
      wheel_back: { rot: [[0, 0], [1, 360, 'linear']] },
      wheel_front: { rot: [[0, 0], [1, 360, 'linear']] },
    },
  },

  walk: roll(FANS, {
    load: { rot: swing(1.8), rate: 2 },
    vacuum: { rot: swing(4, 0, 0.2), rate: 2 },
    jets: { sy: PULSE, rate: 3 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.36 },
    tracks: {
      ...shove([[0, 0], [0.22, -12, 'out'], [0.36, 18, 'in'], [0.62, 6, 'out'], [1, 0, 'inOut']], FANS),
      body: { rot: [[0, 0], [0.22, -2, 'out'], [0.36, 3, 'in'], [0.6, -1, 'out'], [1, 0, 'inOut']] },
      // The load keeps going when the car stops; the vacuum hops.
      load: { rot: [[0, 0], [0.22, -4, 'out'], [0.38, 7, 'in'], [0.58, -3, 'inOut'], [0.78, 1.5, 'inOut'], [1, 0, 'inOut']] },
      vacuum: {
        y: [[0, 0], [0.36, 0, 'hold'], [0.48, -14, 'out'], [0.62, 0, 'in'], [0.7, -4, 'out'], [0.78, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.36, 0, 'hold'], [0.5, 30, 'out'], [0.66, 0, 'in'], [1, 0]],
      },
      jets: { sy: [[0, 1], [0.22, 0.6, 'out'], [0.36, 1.5, 'in'], [1, 1, 'inOut']] },
    },
  },

  hit: jolt({
    load: { rot: rattle(4, 3) },
    vacuum: { rot: rattle(10, 3) },
    jets: { sx: [[0, 1], [0.2, 0.5, 'hold'], [0.4, 1, 'hold'], [1, 1]] },
  }),

  // Home on one fan: the front glow has gone out, the car hangs nose-down and the load leans.
  die: limpHome(FANS, {
    body: { rot: [[0, 4], [0.5, 6, 'sineInOut'], [1, 4, 'sineInOut']], y: [[0, 2], [0.5, 0, 'sineInOut'], [1, 2, 'sineInOut']], rate: 3 },
    load: { rot: [[0, -5], [0.5, -7, 'sineInOut'], [1, -5, 'sineInOut']], rate: 2 },
    vacuum: { rot: [[0, -14]] },
    jets: { sy: [[0, 0.5], [0.5, 0.2, 'hold'], [1, 0.5, 'hold']], rate: 4 },
  }),
};

export default zweefimperiaal;
