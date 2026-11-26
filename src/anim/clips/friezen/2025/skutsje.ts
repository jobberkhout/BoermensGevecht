import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 13,
  wheels: { wheel_back: 13, wheel_front: 13 },
  bounce: 1.2,
  rock: 0.8,
};

/** The sail fills and slackens with the gusts. */
const GUST: Key[] = [[0, 1], [0.3, 1.08, 'sineOut'], [0.6, 0.97, 'sineInOut'], [1, 1, 'sineInOut']];
/** The pennant flutters. */
const FLUTTER: Key[] = [[0, -6], [0.25, 8, 'sineInOut'], [0.5, -4, 'sineInOut'], [0.75, 10, 'sineInOut'], [1, -6, 'sineInOut']];

/**
 * It Skûtsje: a racing barge on a boat trailer with nothing hitched to the
 * front. It sails down the road. The crew hang out over the side as if it were
 * the lake; in a fight the barge lurches and the leeboard slams down on
 * whoever is beside it.
 */
const skutsje: ClipSet = {
  idle: idling(2.2, 0.6, {
    sail: { sx: GUST },
    pennant: { rot: FLUTTER, rate: 2 },
    crew_a: { rot: [[0, 0], [0.5, -5, 'sineInOut'], [1, 0, 'sineInOut']] },
    crew_b: { rot: [[0, -3], [0.5, 3, 'sineInOut'], [1, -3, 'sineInOut']] },
    zwaard: { rot: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
  }),

  walk: roll(WHEELS, {
    sail: { sx: GUST, rot: swing(1.5) },
    pennant: { rot: FLUTTER, rate: 2 },
    // Hiking out: they lean further back with every swell of the road.
    crew_a: { rot: swing(5, -6), rate: 2 },
    crew_b: { rot: swing(-5, -4), rate: 2 },
    zwaard: { rot: swing(3), rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      ...shove([[0, 0], [0.24, -9, 'out'], [0.4, 14, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.24, -2.5, 'out'], [0.4, 3, 'in'], [0.62, -1, 'out'], [1, 0, 'inOut']] },
      // The leeboard comes down like a guillotine.
      zwaard: { rot: [[0, 0], [0.24, 14, 'out'], [0.4, -96, 'in'], [0.56, -84, 'out'], [0.7, -90, 'inOut'], [1, 0, 'inOut']] },
      sail: { sx: [[0, 1], [0.24, 0.9, 'out'], [0.4, 1.14, 'in'], [1, 1, 'inOut']] },
      crew_a: { rot: [[0, 0], [0.24, -12, 'out'], [0.42, 16, 'in'], [0.7, -4, 'inOut'], [1, 0, 'inOut']] },
      crew_b: { rot: [[0, 0], [0.24, -10, 'out'], [0.44, 14, 'in'], [0.72, -4, 'inOut'], [1, 0, 'inOut']] },
      pennant: { rot: rattle(16, 4) },
    },
  },

  hit: jolt({
    crew_a: { rot: rattle(8, 3) },
    crew_b: { rot: rattle(-8, 3) },
    sail: { rot: rattle(2, 3) },
  }),

  die: limpHome(WHEELS, {
    // The wind is gone: the sail hangs, the pennant droops, the crew sit and sulk.
    sail: { sx: [[0, 0.82]], sy: [[0, 0.9]] },
    pennant: { rot: [[0, 70]] },
    crew_a: { rot: [[0, 18]], y: [[0, 4]] },
    crew_b: { rot: [[0, 16]], y: [[0, 4]] },
    zwaard: { rot: [[0, -30], [0.5, -24, 'sineInOut'], [1, -30, 'sineInOut']], rate: 2 },
  }),
};

export default skutsje;
