import type { ClipSet, Key } from '../../../types.ts';
import { idling, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 15,
  wheels: { wheel_back: 15, wheel_front: 15 },
  bounce: 1,
  rock: 0.5,
};

/** A drop forms under the leg, lets go and falls to the quay; then the next one. */
const DRIP_Y: Key[] = [[0, -2], [0.55, 0, 'sineInOut'], [0.92, 30, 'in'], [0.93, -2, 'hold'], [1, -2, 'hold']];
const DRIP_S: Key[] = [[0, 0.2], [0.55, 1, 'out'], [0.9, 1, 'hold'], [0.92, 0.3, 'in'], [0.93, 0, 'hold'], [1, 0.2, 'out']];

/** A puff from the exhaust that rises and fades. */
const PUFF_S: Key[] = [[0, 0.3], [0.25, 1, 'out'], [0.85, 1.2, 'linear'], [1, 0.3, 'in']];

/**
 * De Straddle Carrier: shudders on its tall legs while the container sways
 * underneath and oil drips onto the quay. It rolls along with the box
 * swinging a beat behind, and attacks by braking hard, so that the container
 * swings forward on its cables like a wrecking ball.
 */
const straddleCarrier: ClipSet = {
  idle: idling(1.6, 0.9, {
    body: { y: [[0, 0], [0.5, -0.9, 'sineInOut'], [1, 0, 'sineInOut']], rate: 4 },
    container: { rot: [[0, -1.2], [0.5, 1.2, 'sineInOut'], [1, -1.2, 'sineInOut']] },
    driver: { rot: [[0, 0], [0.5, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
    drip: { y: DRIP_Y, sx: DRIP_S, sy: DRIP_S },
    smoke: { y: [[0, 2], [1, -4, 'linear']], x: [[0, 0], [1, -6, 'sineIn']], sx: PUFF_S, sy: PUFF_S, rate: 2 },
  }),

  walk: roll(WHEELS, {
    // The box hangs back as the frame goes forward, and swings.
    container: { rot: [[0, 2.5], [0.5, 0.5, 'sineInOut'], [1, 2.5, 'sineInOut']] },
    driver: { rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
    drip: { y: DRIP_Y, sx: DRIP_S, sy: DRIP_S },
    smoke: { y: [[0, 2], [1, -4, 'linear']], x: [[0, 0], [1, -14, 'sineIn']], sx: PUFF_S, sy: PUFF_S },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      // Back up a little, run at them, slam on the brakes.
      ...shove([[0, 0], [0.2, -10, 'out'], [0.36, 12, 'in'], [0.6, 6, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.2, -0.8, 'out'], [0.36, 1.2, 'in'], [0.55, -0.5, 'out'], [1, 0, 'inOut']] },
      // and the container keeps going.
      container: { rot: [[0, 0], [0.2, 6, 'out'], [0.42, -11, 'in'], [0.6, 6, 'inOut'], [0.78, -3, 'inOut'], [1, 0, 'inOut']] },
      driver: { rot: [[0, 0], [0.2, -8, 'out'], [0.36, 12, 'in'], [0.6, 2, 'out'], [1, 0, 'inOut']] },
      drip: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  },

  // Knocked back on its legs. The wheels hang from the legs, so the whole frame moves and only rocks a little.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      ...shove([[0, 0], [0.25, -5, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.25, -1, 'out'], [0.6, 0.5, 'inOut'], [1, 0, 'inOut']] },
      container: { rot: [[0, 0], [0.3, 5, 'out'], [0.65, -2.5, 'inOut'], [1, 0, 'inOut']] },
      driver: { rot: [[0, 0], [0.3, -12, 'out'], [1, 0, 'inOut']] },
    },
  },

  die: limpHome(WHEELS, {
    // Home it goes, rocking on its legs, the box swinging wildly, the oil running freely.
    body: { y: [[0, 0], [0.5, -1.5, 'sineInOut'], [1, 0, 'sineInOut']], rot: [[0, -1], [0.5, 1, 'sineInOut'], [1, -1, 'sineInOut']], rate: 3 },
    container: { rot: [[0, 4], [0.5, -4, 'sineInOut'], [1, 4, 'sineInOut']], rate: 2 },
    driver: { rot: [[0, 14], [0.5, 20, 'sineInOut'], [1, 14, 'sineInOut']] },
    drip: { y: DRIP_Y, sx: DRIP_S, sy: DRIP_S, rate: 2 },
    smoke: { y: [[0, 2], [1, -4, 'linear']], x: [[0, 0], [1, 10, 'sineIn']], sx: PUFF_S, sy: PUFF_S, rate: 2 },
  }),
};

export default straddleCarrier;
