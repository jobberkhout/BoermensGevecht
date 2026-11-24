import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 17,
  wheels: { wheel_back: 17, wheel_front: 17 },
  bounce: 1.6,
  rock: 0.5,
};

/** A puff of diesel that swells out of the exhaust, drifts back and is gone. */
function puff(reach = 1): Track {
  const grow: Key[] = [[0, 0.1], [0.5, 1, 'out'], [0.85, 1.1, 'linear'], [1, 0.1, 'in']];
  return { sx: grow, sy: grow, x: [[0, 0], [1, -14 * reach, 'out']], y: [[0, 0], [1, -8 * reach, 'linear']] };
}

/**
 * De Touringcar: nine countries in seven days. Idling, the guide waves her
 * pennant so the group can find the bus again. It rolls on with the luggage
 * jiggling on the roof, and to fight it nudges forward while she brings the
 * pennant down on whoever is in the way. Twelve minutes, then back on the bus.
 */
const touringcar: ClipSet = {
  idle: {
    loop: true,
    seconds: 2,
    tracks: {
      body: { y: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']], rate: 6 },
      rack: { rot: swing(0.6), rate: 3 },
      guide: { rot: swing(3) },
      // Here, everyone! Over here!
      pennant: { rot: [[0, 0], [0.15, -14, 'sineInOut'], [0.3, 6, 'sineInOut'], [0.45, -14, 'sineInOut'], [0.6, 6, 'sineInOut'], [0.75, 0, 'sineInOut'], [1, 0, 'hold']] },
      puff: { ...puff(), rate: 2 },
    },
  },

  walk: roll(WHEELS, {
    rack: { rot: swing(1.4), rate: 2 },
    guide: { rot: swing(4, 2), rate: 2 },
    pennant: { rot: swing(8, -4), rate: 2 },
    puff: { ...puff(), rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      ...shove([[0, 0], [0.24, -10, 'out'], [0.4, 14, 'in'], [0.64, 4, 'out'], [1, 0, 'inOut']], WHEELS),
      body: {
        rot: [[0, 0], [0.24, -2.4, 'out'], [0.4, 2, 'in'], [0.6, -0.8, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, -2, 'out'], [0.4, 1, 'in'], [1, 0, 'inOut']],
      },
      // She leans right out and brings the pennant down, umbrella first.
      guide: { rot: [[0, 0], [0.24, -10, 'out'], [0.4, 16, 'in'], [0.64, 6, 'out'], [1, 0, 'inOut']] },
      pennant: { rot: [[0, 0], [0.24, -36, 'out'], [0.4, 62, 'in'], [0.6, 30, 'out'], [1, 0, 'inOut']] },
      rack: {
        y: [[0, 0], [0.4, 0, 'hold'], [0.5, -4, 'out'], [0.66, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.24, -2, 'out'], [0.4, 2.4, 'in'], [0.6, -1.4, 'inOut'], [1, 0, 'inOut']],
      },
      puff: {
        sx: [[0, 1], [0.24, 1.8, 'out'], [0.6, 0.6, 'inOut'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.24, 1.8, 'out'], [0.6, 0.6, 'inOut'], [1, 1, 'inOut']],
      },
    },
  },

  hit: jolt({
    rack: { rot: rattle(3, 3) },
    guide: { rot: [[0, 0], [0.3, -12, 'out'], [1, 0, 'inOut']] },
    pennant: { rot: rattle(10, 3) },
  }),

  die: limpHome(WHEELS, {
    rack: { rot: swing(3), rate: 3 },
    // The pennant droops; the guide counts heads and comes up short.
    guide: { rot: [[0, -8], [0.5, -12, 'sineInOut'], [1, -8, 'sineInOut']], rate: 2 },
    pennant: { rot: [[0, 40], [0.5, 50, 'sineInOut'], [1, 40, 'sineInOut']], rate: 2 },
    puff: { ...puff(1.5), rate: 3 },
  }),
};

export default touringcar;
