import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

/** Two little spinner wheels, flat out. */
const WHEELS: RollStyle = { bigWheel: 7, wheels: { wheel_back: 7, wheel_front: 7 }, bounce: 1.6, rock: 1.4 };

/** The beacon on the handle: on, off, on. */
const BLINK: Key[] = [[0, 1], [0.12, 1.25, 'out'], [0.25, 0.55, 'in'], [0.5, 0.55, 'hold'], [0.62, 1.25, 'out'], [0.75, 0.55, 'in'], [1, 1, 'inOut']];

/**
 * De Robokoffer. A self-driving suitcase that has lost its owner and does
 * thirty on the pavement looking for them. Standing still, its eye scans left
 * and right and the beacon on its pulled-out handle blinks for someone who is
 * not coming. Driving, it leans into it and the luggage tag streams out
 * behind. It rams shins with its rubber bumper. Beaten, it trundles home with
 * the handle drooping and the eye gone small.
 */
const robokoffer: ClipSet = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: {
      body: { y: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']], rate: 4 },
      // Left, right, left: no owner anywhere.
      eye: { x: [[0, 0], [0.12, -6, 'inOut'], [0.36, -6, 'hold'], [0.5, 3, 'inOut'], [0.74, 3, 'hold'], [0.86, 0, 'inOut'], [1, 0]] },
      handle: { rot: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      tag: { rot: [[0, 4], [0.5, -6, 'sineInOut'], [1, 4, 'sineInOut']] },
      beacon: { sx: BLINK, sy: BLINK, rate: 2 },
    },
  },

  walk: roll(WHEELS, {
    // Leaning into it, at thirty on the pavement.
    body: {
      y: [[0, 0], [0.5, -1.6, 'sineInOut'], [1, 0, 'sineInOut']],
      rot: [[0, 4], [0.25, 5.6, 'sineInOut'], [0.75, 2.6, 'sineInOut'], [1, 4, 'sineInOut']],
      rate: 3,
    },
    handle: { rot: [[0, -10], [0.5, -13, 'sineInOut'], [1, -10, 'sineInOut']], rate: 3 },
    tag: { rot: [[0, 48], [0.25, 58, 'sineInOut'], [0.5, 44, 'sineInOut'], [0.75, 60, 'sineInOut'], [1, 48, 'sineInOut']], rate: 2 },
    eye: { x: [[0, 2]] },
    beacon: { sx: BLINK, sy: BLINK, rate: 3 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // Back up, and into the shins.
      ...shove([[0, 0], [0.24, -12, 'out'], [0.4, 14, 'in'], [0.6, 5, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.24, -6, 'out'], [0.4, 9, 'in'], [0.56, -2, 'out'], [0.76, 1, 'inOut'], [1, 0, 'inOut']] },
      handle: { rot: [[0, 0], [0.24, 10, 'out'], [0.42, -22, 'in'], [0.6, 8, 'inOut'], [0.8, -3, 'inOut'], [1, 0, 'inOut']] },
      tag: { rot: [[0, 0], [0.24, -30, 'out'], [0.42, 50, 'in'], [0.64, -14, 'inOut'], [0.84, 6, 'inOut'], [1, 0, 'inOut']] },
      eye: {
        x: [[0, 0], [0.24, 2, 'out'], [1, 0, 'inOut']],
        sy: [[0, 1], [0.3, 1, 'hold'], [0.4, 0.35, 'in'], [0.62, 0.35, 'hold'], [0.74, 1, 'out'], [1, 1]],
      },
      beacon: { sx: [[0, 1], [0.38, 1, 'hold'], [0.44, 1.8, 'out'], [0.7, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.38, 1, 'hold'], [0.44, 1.8, 'out'], [0.7, 1, 'inOut'], [1, 1]] },
    },
  },

  hit: jolt({
    handle: { rot: rattle(10, 3) },
    tag: { rot: rattle(24, 3) },
    eye: { sy: [[0, 1], [0.15, 0.2, 'out'], [0.5, 0.2, 'hold'], [1, 1, 'inOut']] },
  }),

  // Home, slowly: the handle hangs back over its shoulder, the eye has gone small, the beacon is dim.
  die: limpHome(WHEELS, {
    handle: { rot: [[0, -42], [0.5, -48, 'sineInOut'], [1, -42, 'sineInOut']], rate: 2 },
    tag: { rot: [[0, -8], [0.5, 4, 'sineInOut'], [1, -8, 'sineInOut']], rate: 2 },
    eye: { sy: [[0, 0.45]], sx: [[0, 0.8]], y: [[0, 3]] },
    beacon: { sx: [[0, 0.6]], sy: [[0, 0.6]] },
  }),
};

export default robokoffer;
