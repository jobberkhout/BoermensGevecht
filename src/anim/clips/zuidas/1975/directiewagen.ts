import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';
import { jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 15,
  wheels: { wheel_back: 15, wheel_front: 15 },
  bounce: 1.3,
  rock: 0.5,
};

/** The same keys, started half a cycle later (sampled at eight points). */
function halfLater(keys: readonly Key[]): Key[] {
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
}

/**
 * Cigar smoke that squeezes out over the top of the rear window, drifts up
 * and back, and thins out. With two of them, one `late`, there is always one
 * on its way.
 */
function puff(late: boolean, reach = 1): Track {
  const grow: Key[] = [[0, 0.1], [0.5, 1, 'out'], [0.85, 1.15, 'linear'], [1, 0.1, 'in']];
  const driftX: Key[] = [[0, 4], [1, -10 * reach, 'out']];
  const driftY: Key[] = [[0, 4], [1, -12 * reach, 'linear']];
  if (!late) return { sx: grow, sy: grow, x: driftX, y: driftY };
  return { sx: halfLater(grow), sy: halfLater(grow), x: halfLater(driftX), y: halfLater(driftY) };
}

/** One pull on the cigar: the tip flares up and dies down again. */
const PULL: Key[] = [[0, 0.75], [0.14, 1.7, 'out'], [0.4, 0.9, 'inOut'], [1, 0.75, 'sineInOut']];

/**
 * De directiewagen. The engine can hardly be heard; what you notice is the
 * back seat, where the board smokes so much that the chauffeur has to cough
 * twice (discreetly, eyes on the road). Driving, the pennant on the wing
 * streams and the smoke trails behind. To hit, the whole car surges forward
 * on its soft springs and everything inside slides to the front.
 */
const directiewagen: ClipSet = {
  idle: {
    loop: true,
    seconds: 2.6,
    tracks: {
      body: { y: [[0, 0], [0.5, -0.6, 'sineInOut'], [1, 0, 'sineInOut']], rate: 6 },
      glow: { sx: PULL, sy: PULL },
      cigar: { rot: [[0, 0], [0.12, -12, 'out'], [0.4, 0, 'inOut'], [1, 0]] },
      smoke: {
        sx: [[0, 1], [0.3, 1.07, 'sineInOut'], [1, 1, 'sineInOut']],
        sy: [[0, 1], [0.3, 1.05, 'sineInOut'], [1, 1, 'sineInOut']],
      },
      puff_a: puff(false),
      puff_b: puff(true),
      // Ahem. Ahem.
      driver: {
        y: [[0, 0], [0.56, 0, 'hold'], [0.6, -1.8, 'out'], [0.66, 0, 'in'], [0.72, -1.8, 'out'], [0.78, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.56, 0, 'hold'], [0.6, 6, 'out'], [0.66, 0, 'in'], [0.72, 6, 'out'], [0.8, 0, 'in'], [1, 0]],
      },
      pennant: { rot: swing(3, 4), rate: 2 },
      aerial: { rot: swing(1.2), rate: 3 },
    },
  },

  walk: roll(WHEELS, {
    pennant: { rot: swing(9, -5), sx: [[0, 1], [0.5, 0.88, 'sineInOut'], [1, 1, 'sineInOut']], rate: 4 },
    aerial: { rot: swing(3, -7), rate: 3 },
    driver: { rot: swing(1.6), rate: 2 },
    glow: { sx: PULL, sy: PULL },
    smoke: { x: swing(1.2), rate: 2 },
    puff_a: { ...puff(false, 1.7), rate: 2 },
    puff_b: { ...puff(true, 1.7), rate: 2 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.36 },
    tracks: {
      ...shove([[0, 0], [0.22, -12, 'out'], [0.36, 18, 'in'], [0.62, 6, 'out'], [1, 0, 'inOut']], WHEELS),
      // Soft springs: the nose lifts as it pulls away and dives when it lands.
      body: {
        rot: [[0, 0], [0.22, -2.6, 'out'], [0.36, 3, 'in'], [0.55, -1.2, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.22, -2, 'out'], [0.36, 1.6, 'in'], [1, 0, 'inOut']],
      },
      driver: { rot: [[0, 0], [0.22, -9, 'out'], [0.36, 15, 'in'], [0.6, 4, 'out'], [1, 0, 'inOut']] },
      // The back seat arrives a moment later than the car.
      smoke: {
        x: [[0, 0], [0.22, -3, 'out'], [0.42, 7, 'in'], [0.7, -2, 'inOut'], [1, 0, 'inOut']],
        sx: [[0, 1], [0.42, 1.16, 'in'], [0.7, 0.96, 'inOut'], [1, 1, 'inOut']],
      },
      cigar: {
        x: [[0, 0], [0.22, -3, 'out'], [0.42, 6, 'in'], [0.7, -1, 'inOut'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.36, 0, 'hold'], [0.46, -30, 'out'], [0.7, 8, 'inOut'], [1, 0, 'inOut']],
      },
      glow: {
        sx: [[0, 1], [0.36, 1, 'hold'], [0.44, 2.2, 'out'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.36, 1, 'hold'], [0.44, 2.2, 'out'], [1, 1, 'inOut']],
      },
      puff_a: {
        sx: [[0, 1], [0.3, 0.5, 'inOut'], [0.44, 2, 'out'], [0.8, 0.7, 'inOut'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.3, 0.5, 'inOut'], [0.44, 2, 'out'], [0.8, 0.7, 'inOut'], [1, 1, 'inOut']],
      },
      puff_b: {
        sx: [[0, 1], [0.36, 0.5, 'inOut'], [0.52, 1.7, 'out'], [0.85, 0.7, 'inOut'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.36, 0.5, 'inOut'], [0.52, 1.7, 'out'], [0.85, 0.7, 'inOut'], [1, 1, 'inOut']],
      },
      pennant: { rot: [[0, 0], [0.22, 14, 'out'], [0.36, -24, 'in'], [0.6, 10, 'inOut'], [1, 0, 'inOut']] },
      aerial: { rot: [[0, 0], [0.22, 12, 'out'], [0.38, -26, 'in'], [0.56, 14, 'inOut'], [0.74, -7, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  hit: jolt({
    driver: { rot: [[0, 0], [0.3, -11, 'out'], [1, 0, 'inOut']] },
    smoke: { x: [[0, 0], [0.3, -4, 'out'], [1, 0, 'inOut']] },
    cigar: { rot: [[0, 0], [0.3, 16, 'out'], [1, 0, 'inOut']] },
    pennant: { rot: rattle(14, 3) },
    aerial: { rot: rattle(16, 4) },
  }),

  die: limpHome(WHEELS, {
    // The chauffeur keeps his head down, the pennant hangs, the smoking goes on.
    driver: { y: [[0, 3.5]], rot: [[0, 10], [0.5, 15, 'sineInOut'], [1, 10, 'sineInOut']], rate: 2 },
    pennant: { rot: swing(5, -58), rate: 2 },
    aerial: { rot: swing(9, -10), rate: 3 },
    glow: { sx: PULL, sy: PULL, rate: 2 },
    puff_a: { ...puff(false, 1.8), rate: 3 },
    puff_b: { ...puff(true, 1.8), rate: 3 },
  }),
};

export default directiewagen;
