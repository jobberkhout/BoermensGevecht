import { bob } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 11,
  wheels: { wheel_back: 11, wheel_back2: 11, wheel_front2: 11, wheel_front: 11 },
  bounce: 0.8,
  rock: 0.3,
};

const STILL: Key[] = [[0, 0]];
const GONE: Track = { sx: STILL, sy: STILL };
/** The coffee jumps out of the mug between `from` and `to`, and drops back in. */
function slosh(from: number, to: number): Track {
  const mid = from + (to - from) * 0.3;
  const size: Key[] = [[0, 1], [from, 1, 'hold'], [mid, 1.5, 'out'], [to, 1, 'in'], [1, 1, 'hold']];
  return { y: [[0, 0], [from, 0, 'hold'], [mid, -10, 'out'], [to, 0, 'in'], [1, 0, 'hold']], sx: size, sy: size };
}
/** The beacon turning: it squeezes to nothing and back, twice a cycle. */
const BEACON: Track = { sx: [[0, 1], [0.25, 0.25, 'sineInOut'], [0.5, 1, 'sineInOut'], [0.75, 0.25, 'sineInOut'], [1, 1, 'sineInOut']] };
/** A slow sip: mug up to the mouth, hold, and down again. */
const SIP: Key[] = [[0, 0], [0.55, 0, 'hold'], [0.65, -34, 'inOut'], [0.85, -34, 'hold'], [0.95, 0, 'inOut'], [1, 0]];

/**
 * De AGV: a driverless container carrier rolling down the lane on its own, the
 * beacon turning. The man who used to drive it sits on the roof with his feet
 * on the desk, sips his coffee and never touches the joystick. It rams with the
 * whole container; the only thing on board that reacts is the coffee.
 */
const agv: ClipSet = {
  idle: idling(0.6, 0.4, {
    beacon: { ...BEACON, rate: 2 },
    cup_arm: { rot: SIP },
    driver: { rot: [[0, 0], [0.55, 0, 'hold'], [0.65, -3, 'inOut'], [0.85, -3, 'hold'], [0.95, 0, 'inOut'], [1, 0]] },
    steam: { sy: [[0, 0.7], [0.5, 1.2, 'sineInOut'], [1, 0.7, 'sineInOut']], rate: 2 },
  }),

  walk: roll(WHEELS, {
    beacon: BEACON,
    // Nothing a driver needs to do. He rocks along with his feet up.
    driver: { rot: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']], y: bob(0.6) },
    container: { y: [[0, 0], [0.5, 0.6, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
    steam: { rot: [[0, -18]] },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.36 },
    tracks: {
      // Back up a little, then shove in with the whole 40 feet.
      ...shove([[0, 0], [0.22, -10, 'out'], [0.36, 16, 'in'], [0.6, 5, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.22, -1, 'out'], [0.36, 1.4, 'in'], [0.6, -0.4, 'out'], [1, 0, 'inOut']] },
      container: { x: [[0, 0], [0.36, 0, 'hold'], [0.42, 3, 'out'], [0.7, 0, 'inOut'], [1, 0]] },
      // He rocks with the bump and holds the mug out of harm's way. Some of it goes anyway.
      driver: { rot: [[0, 0], [0.22, -4, 'out'], [0.36, 5, 'in'], [0.6, -1, 'out'], [1, 0, 'inOut']] },
      cup_arm: { rot: [[0, 0], [0.36, 0, 'hold'], [0.42, 20, 'out'], [0.7, 6, 'inOut'], [1, 0, 'inOut']] },
      splash: slosh(0.36, 0.66),
      steam: GONE,
      beacon: BEACON,
    },
  },

  hit: jolt({
    driver: { rot: [[0, 0], [0.3, -6, 'out'], [1, 0, 'inOut']] },
    cup_arm: { rot: [[0, 0], [0.3, 16, 'out'], [1, 0, 'inOut']] },
    splash: slosh(0.1, 0.8),
  }),

  die: limpHome(WHEELS, {
    beacon: { ...BEACON, rate: 3 },
    // He has dozed off on the way back. The mug hangs off the side.
    driver: { rot: [[0, -6]] },
    cup_arm: { rot: [[0, 40], [0.5, 46, 'sineInOut'], [1, 40, 'sineInOut']], rate: 2 },
    steam: GONE,
  }),
};

export default agv;
