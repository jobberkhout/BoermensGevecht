import { swing } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

/** The reel counts as a wheel: it turns with the distance driven, twice as often as the big wheels. */
const WHEELS: RollStyle = {
  bigWheel: 26,
  wheels: { wheel_front: 26, wheel_back: 17, reel: 13 },
  bounce: 1.5,
  rock: 0.5,
};

/** The snore: the bubble swells slowly and is sucked back in. */
const SNORE: Key[] = [[0, 0.25], [0.55, 1.15, 'sineInOut'], [0.7, 1.1, 'sineInOut'], [1, 0.25, 'in']];
const snore = (rate: number): Track => ({ sx: SNORE, sy: SNORE, rate });
/** Breathing in his sleep. */
const DOZE: Key[] = [[0, 0], [0.55, -3, 'sineInOut'], [1, 0, 'sineInOut']];
const FLASH: Key[] = [[0, 1], [0.5, 1, 'hold'], [0.52, 0.3, 'hold'], [1, 0.3, 'hold']];
/** Chaff flying out of the back. */
const SPIT: Key[] = [[0, 0.3], [0.5, 1.2, 'out'], [1, 0.3, 'in']];

/**
 * De Vreter drives itself; the boer sleeps through all of it. It rolls along
 * with the reel turning, rears its header up like a jaw and bites down, reel
 * racing. Only when it is beaten does he sit up.
 */
const deVreter: ClipSet = {
  idle: idling(2.6, 0.9, {
    // One long snore per loop, the engine shaking under it. A sixth of a turn of
    // the six-armed reel looks like no turn at all, so the loop is seamless.
    body: { y: [[0, 0], [0.5, -0.9, 'sineInOut'], [1, 0, 'sineInOut']], rate: 7 },
    reel: { rot: [[0, 0], [1, 60, 'linear']] },
    driver: { rot: DOZE },
    bubble: snore(1),
    beacon: { sx: FLASH, sy: FLASH, rate: 3 },
    chaff: { sx: [[0, 0]], sy: [[0, 0]] },
  }),

  walk: roll(WHEELS, {
    header: { rot: [[0, 0], [0.5, -1.6, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    spout: { rot: swing(2.5), rate: 3 },
    driver: { rot: DOZE, rate: 2 },
    bubble: snore(2),
    beacon: { sx: FLASH, sy: FLASH, rate: 6 },
    chaff: { sx: SPIT, sy: SPIT, x: [[0, 0], [1, -7, 'linear']], rate: 9 },
  }),

  attack: (() => {
    const tracks = shove([[0, 0], [0.2, -10, 'out'], [0.36, 15, 'in'], [0.6, 6, 'out'], [1, 0, 'inOut']], WHEELS);
    return {
      loop: false,
      markers: { hit: 0.36 },
      tracks: {
        ...tracks,
        body: { rot: [[0, 0], [0.2, -2, 'out'], [0.36, 2.6, 'in'], [0.6, -0.8, 'out'], [1, 0, 'inOut']] },
        // The jaw rears up and comes down.
        header: { rot: [[0, 0], [0.2, -19, 'out'], [0.36, 3, 'in'], [0.5, -4, 'out'], [0.66, 0, 'inOut'], [1, 0]] },
        reel: { rot: [[0, 0], [0.36, 480, 'in'], [1, 1080, 'out']] },
        spout: { rot: [[0, 0], [0.2, 7, 'out'], [0.36, -10, 'in'], [0.6, 3, 'out'], [1, 0, 'inOut']] },
        // He slides forward in his seat and sleeps on. The bubble does not survive the bump.
        driver: { rot: [[0, 0], [0.2, -5, 'out'], [0.36, 8, 'in'], [0.7, 2, 'out'], [1, 0, 'inOut']] },
        bubble: { sx: [[0, 1], [0.36, 1.3, 'in'], [0.4, 0, 'hold'], [0.8, 0, 'hold'], [1, 1, 'out']], sy: [[0, 1], [0.36, 1.3, 'in'], [0.4, 0, 'hold'], [0.8, 0, 'hold'], [1, 1, 'out']] },
        chaff: { sx: [[0, 0], [0.36, 0, 'hold'], [0.5, 1.5, 'out'], [1, 0, 'in']], sy: [[0, 0], [0.36, 0, 'hold'], [0.5, 1.5, 'out'], [1, 0, 'in']], x: [[0, 0], [0.36, 0, 'hold'], [1, -9, 'out']] },
      },
    };
  })(),

  hit: jolt({
    header: { rot: [[0, 0], [0.3, -5, 'out'], [1, 0, 'inOut']] },
    driver: { rot: [[0, 0], [0.3, -9, 'out'], [0.65, 4, 'inOut'], [1, 0, 'inOut']] },
    bubble: { sx: [[0, 1], [0.25, 1.5, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.25, 0.7, 'out'], [1, 1, 'inOut']] },
  }),

  die: limpHome(WHEELS, {
    // The header hangs high and crooked, the reel has jammed.
    header: { rot: [[0, -9], [0.5, -6, 'sineInOut'], [1, -9, 'sineInOut']], rate: 5 },
    reel: { rot: [[0, 24]] },
    spout: { rot: [[0, -18], [0.5, -12, 'sineInOut'], [1, -18, 'sineInOut']], rate: 5 },
    // Now he is awake: bolt upright, no more bubble.
    driver: { rot: [[0, 30], [0.5, 36, 'sineInOut'], [1, 30, 'sineInOut']], rate: 4 },
    bubble: { sx: [[0, 0]], sy: [[0, 0]] },
    beacon: { sx: FLASH, sy: FLASH, rate: 8 },
    chaff: { sx: [[0, 0]], sy: [[0, 0]] },
  }),
};

export default deVreter;
