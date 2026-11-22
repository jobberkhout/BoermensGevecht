import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 17,
  wheels: { wheel_back: 17, wheel_front: 17 },
  bounce: 2.2,
  rock: 0.9,
};

/**
 * A puff of smoke: it swells out of the exhaust, drifts up and back, and
 * shrinks to nothing. `late` starts it half a cycle later, so with two puffs
 * there is always one on its way.
 */
function puff(late: boolean, reach = 1): Track {
  const grow: Key[] = [[0, 0.1], [0.55, 1, 'out'], [0.85, 1.1, 'linear'], [1, 0.1, 'in']];
  const driftX: Key[] = [[0, 0], [1, -12 * reach, 'out']];
  const driftY: Key[] = [[0, 0], [1, -9 * reach, 'linear']];
  if (!late) return { sx: grow, sy: grow, x: driftX, y: driftY };
  const shift = (keys: Key[]): Key[] => {
    // The same shape, started half-way: sampled at eight points and moved along.
    const at = (u: number): number => {
      for (let i = 1; i < keys.length; i++) {
        const a = keys[i - 1]!;
        const b = keys[i]!;
        if (u <= b[0]) return a[1] + ((b[1] - a[1]) * (u - a[0])) / (b[0] - a[0]);
      }
      return keys[keys.length - 1]![1];
    };
    const out: Key[] = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      // Just before the half-way point the puff is at its end; just after, it starts again.
      out.push([u, at((u + 0.5) % 1), i === 4 ? 'hold' : 'linear']);
    }
    return out;
  };
  return { sx: shift(grow), sy: shift(grow), x: shift(driftX), y: shift(driftY) };
}

/**
 * The Flowerpowerbusje: shakes and smokes when it stands still, bounces along
 * on tired springs, and to hit it rears up and comes down on whoever is in
 * front. The driver nods along to the radio through all of it.
 */
const flowerpowerbusje: ClipSet = {
  idle: {
    loop: true,
    seconds: 1.6,
    tracks: {
      body: { y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']], rate: 4 },
      rack: { rot: swing(1.2), rate: 2 },
      driver: { rot: [[0, -5], [0.5, 5, 'sineInOut'], [1, -5, 'sineInOut']], rate: 2 },
      puff_a: puff(false),
      puff_b: puff(true),
    },
  },

  walk: roll(WHEELS, {
    rack: { rot: swing(2.6), rate: 2 },
    driver: { rot: swing(5), rate: 2 },
    puff_a: { ...puff(false), rate: 2 },
    puff_b: { ...puff(true), rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.36 },
    tracks: {
      ...shove([[0, 0], [0.22, -12, 'out'], [0.36, 18, 'in'], [0.62, 6, 'out'], [1, 0, 'inOut']], WHEELS),
      body: {
        rot: [[0, 0], [0.22, -5, 'out'], [0.36, 4, 'in'], [0.55, -1.5, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.22, -3, 'out'], [0.36, 1.5, 'in'], [1, 0, 'inOut']],
      },
      // Everything on the roof takes off when the nose comes down.
      rack: {
        y: [[0, 0], [0.36, 0, 'hold'], [0.48, -8, 'out'], [0.66, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.22, -4, 'out'], [0.36, 6, 'in'], [0.52, -4, 'inOut'], [0.72, 2, 'inOut'], [1, 0, 'inOut']],
      },
      driver: { rot: [[0, 0], [0.22, -14, 'out'], [0.36, 18, 'in'], [0.6, 6, 'out'], [1, 0, 'inOut']] },
      // One big cloud as the engine revs.
      puff_a: {
        sx: [[0, 1], [0.22, 1.9, 'out'], [0.6, 0.6, 'inOut'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.22, 1.9, 'out'], [0.6, 0.6, 'inOut'], [1, 1, 'inOut']],
      },
      puff_b: {
        sx: [[0, 1], [0.3, 1.7, 'out'], [0.7, 0.6, 'inOut'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.3, 1.7, 'out'], [0.7, 0.6, 'inOut'], [1, 1, 'inOut']],
      },
    },
  },

  hit: jolt({
    rack: { rot: rattle(6, 3) },
    driver: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
  }),

  die: limpHome(WHEELS, {
    rack: { rot: swing(7), rate: 3 },
    // He ducks behind the door.
    driver: { rot: [[0, 16], [0.5, 22, 'sineInOut'], [1, 16, 'sineInOut']], rate: 2, y: [[0, 5]] },
    puff_a: { ...puff(false, 1.6), rate: 3 },
    puff_b: { ...puff(true, 1.6), rate: 3 },
  }),
};

export default flowerpowerbusje;
