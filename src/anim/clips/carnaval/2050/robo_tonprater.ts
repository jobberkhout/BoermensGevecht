import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The barrel's hop on its spring: a squat, up, down, a squat. Pixels; negative is up. */
const HOP_TIMES = [0, 0.12, 0.5, 0.88, 1] as const;
const HOP_EASE = [undefined, 'out', 'out', 'in', 'out'] as const;

/** The barrel's height over one hop, and the spring stretched to match: it is 12 pixels tall at rest. */
function hop(height: number, squat: number): { barrel: Key[]; spring: Key[] } {
  const ys = [0, squat, -height, squat, 0];
  const keys = (f: (y: number) => number): Key[] =>
    HOP_TIMES.map((u, i) => (HOP_EASE[i] ? [u, f(ys[i]!), HOP_EASE[i]] : [u, f(ys[i]!)]) as Key);
  return { barrel: keys((y) => y), spring: keys((y) => 1 - y / 12) };
}

/** A joke: the speaker chatters from `from` to `to`, now wide, now shut. */
function talk(from: number, to: number, flaps: number, wide = 1.5): Key[] {
  const keys: Key[] = [[0, 1]];
  if (from > 0) keys.push([from, 1, 'hold']);
  const step = (to - from) / flaps;
  for (let i = 0; i < flaps; i++) {
    keys.push([from + (i + 0.5) * step, i % 2 === 0 ? wide : wide * 0.8, 'sineInOut']);
    keys.push([from + (i + 1) * step, 0.7, 'sineInOut']);
  }
  keys.push([Math.min(1, to + 0.04), 1, 'inOut']);
  if (to + 0.04 < 1) keys.push([1, 1, 'hold']);
  return keys;
}

/** The punchline lands: the bulb on the antenna lights up. */
const flash = (at: number): Key[] => [[0, 1], [at, 1, 'hold'], [at + 0.04, 1.6, 'out'], [at + 0.2, 1, 'in'], [1, 1, 'hold']];

const WALK = hop(12, 2);
const LIMP = hop(6, 1.5);

/**
 * De Robo-tonprater. The tonprater stands in a barrel and tells jokes; this
 * one is a robot, the barrel sits on a spring, and someone has stuck a red
 * clown nose on its screen. It tells a pun through its speaker with its far
 * hand explaining, and because nobody laughs it does its own rimshot on the
 * little drum kit bolted to the barrel: ba-dum-tss. Then it squints at its
 * own joke and looks round for the laugh. It hops along on its spring. To
 * fire it leans in and the pun leaves the speaker as a balloon, with a
 * cymbal after it. Hit, it ducks into its barrel. Beaten, it bounces home
 * low, its bulb out.
 */
const roboTonprater: ClipSet = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      mouth: { sy: talk(0.04, 0.46, 7) },
      head: { rot: [[0, 0], [0.1, 4, 'inOut'], [0.3, -3, 'inOut'], [0.46, 3, 'inOut'], [0.52, 0, 'inOut'], [0.84, 0, 'hold'], [0.9, -6, 'inOut'], [0.96, 4, 'inOut'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.08, -16, 'inOut'], [0.18, 4, 'inOut'], [0.28, -14, 'inOut'], [0.38, 2, 'inOut'], [0.46, -10, 'inOut'], [0.54, 0, 'inOut'], [1, 0]] },
      // Ba (on the drum), dum (on the drum), tss (on the cymbal).
      stick: { rot: [[0, 0], [0.52, 0, 'hold'], [0.56, 96, 'in'], [0.6, 40, 'out'], [0.63, 96, 'in'], [0.67, 20, 'out'], [0.71, 34, 'in'], [0.78, 0, 'out'], [1, 0]] },
      arm_front: { rot: [[0, 0], [0.52, 0, 'hold'], [0.56, 6, 'in'], [0.6, 0, 'out'], [0.63, 6, 'in'], [0.67, 0, 'out'], [1, 0]] },
      cymbal: { rot: [[0, 0], [0.71, 0, 'hold'], [0.73, -14, 'out'], [0.77, 10, 'inOut'], [0.81, -7, 'inOut'], [0.85, 4, 'inOut'], [0.9, 0, 'inOut'], [1, 0]] },
      drum: { y: [[0, 0], [0.56, 0, 'hold'], [0.57, 1, 'out'], [0.6, 0, 'in'], [0.63, 0, 'hold'], [0.64, 1, 'out'], [0.67, 0, 'in'], [1, 0]] },
      bulb: { sx: flash(0.71), sy: flash(0.71) },
      // It squints at its own joke, then looks round: nobody?
      eyes: {
        sy: [[0, 1], [0.72, 1, 'hold'], [0.76, 0.3, 'out'], [0.84, 0.3, 'hold'], [0.88, 1, 'in'], [1, 1]],
        x: [[0, 0], [0.88, 0, 'hold'], [0.92, -3, 'inOut'], [0.97, -3, 'hold'], [1, 0, 'inOut']],
      },
      barrel: { sy: [[0, 1], [0.5, 1.01, 'sineInOut'], [1, 1, 'sineInOut']] },
    },
  },

  // Boing, boing: the barrel hops along on its spring.
  walk: {
    loop: true,
    stride: 46,
    tracks: {
      barrel: {
        y: WALK.barrel,
        sx: [[0, 1], [0.12, 1.05, 'out'], [0.5, 0.97, 'out'], [0.88, 1.05, 'in'], [1, 1, 'out']],
        sy: [[0, 1], [0.12, 0.95, 'out'], [0.5, 1.03, 'out'], [0.88, 0.95, 'in'], [1, 1, 'out']],
      },
      spring: { sy: WALK.spring },
      body: { rot: [[0, 3], [0.12, 5, 'out'], [0.5, 1, 'out'], [0.88, 5, 'in'], [1, 3, 'out']] },
      head: { rot: [[0, 0], [0.12, 4, 'out'], [0.5, -3, 'out'], [0.88, 4, 'in'], [1, 0, 'out']] },
      arm_back: { rot: [[0, 0], [0.5, -18, 'out'], [1, 0, 'in']] },
      arm_front: { rot: [[0, 0], [0.5, -10, 'out'], [1, 0, 'in']] },
      stick: { rot: [[0, 0], [0.5, 8, 'out'], [1, 0, 'in']] },
      cymbal: { rot: [[0, 0], [0.14, 4, 'out'], [0.5, -3, 'inOut'], [0.9, 4, 'inOut'], [1, 0, 'out']] },
      antenna: { rot: [[0, 0], [0.12, 10, 'out'], [0.5, -8, 'out'], [0.88, 10, 'in'], [1, 0, 'out']] },
    },
  },

  // It leans in, the speaker opens wide and the pun leaves as a balloon; then the cymbal, for emphasis.
  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      barrel: { rot: [[0, 0], [0.3, -4, 'out'], [0.45, 6, 'in'], [0.7, 2, 'out'], [1, 0, 'inOut']] },
      body: { rot: [[0, 0], [0.3, -8, 'out'], [0.45, 14, 'in'], [0.7, 8, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, -6, 'out'], [0.45, 8, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      mouth: { sy: [[0, 1], [0.3, 0.7, 'out'], [0.45, 2, 'in'], [0.6, 1.6, 'out'], [0.72, 1, 'inOut'], [1, 1]] },
      eyes: { sy: [[0, 1], [0.3, 1.2, 'out'], [0.45, 0.6, 'in'], [0.7, 1, 'inOut'], [1, 1]] },
      arm_back: { rot: [[0, 0], [0.3, 10, 'out'], [0.45, -40, 'in'], [0.7, -30, 'out'], [1, 0, 'inOut']] },
      stick: { rot: [[0, 0], [0.45, -14, 'out'], [0.56, 34, 'in'], [0.66, 0, 'out'], [1, 0]] },
      cymbal: { rot: [[0, 0], [0.56, 0, 'hold'], [0.58, -14, 'out'], [0.64, 10, 'inOut'], [0.7, -6, 'inOut'], [0.78, 3, 'inOut'], [0.86, 0, 'inOut'], [1, 0]] },
      bulb: { sx: flash(0.43), sy: flash(0.43) },
    },
  },

  // It ducks into its barrel.
  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      body: { y: [[0, 0], [0.25, 10, 'out'], [0.6, 10, 'hold'], [1, 0, 'backOut']], rot: [[0, 0], [0.25, -6, 'out'], [1, 0, 'inOut']] },
      barrel: { x: [[0, 0], [0.25, -4, 'out'], [1, 0, 'inOut']], rot: [[0, 0], [0.25, -4, 'out'], [0.6, 2, 'inOut'], [1, 0, 'inOut']] },
      eyes: { sy: [[0, 1], [0.2, 0.25, 'out'], [0.7, 0.25, 'hold'], [1, 1, 'in']] },
      cymbal: { rot: rattle(10, 3) },
      antenna: { rot: rattle(14, 3) },
    },
  },

  // Home, bouncing low, head down, bulb out.
  die: {
    loop: true,
    stride: 40,
    tracks: {
      barrel: { y: LIMP.barrel },
      spring: { sy: LIMP.spring },
      body: { y: [[0, 6]], rot: [[0, 6]] },
      head: { rot: [[0, 16], [0.5, 12, 'sineInOut'], [1, 16, 'sineInOut']] },
      eyes: { sy: [[0, 0.45]], y: [[0, 2]] },
      bulb: { sx: [[0, 0.5]], sy: [[0, 0.5]] },
      antenna: { rot: [[0, 30]] },
      arm_back: { rot: [[0, 40]] },
      arm_front: { rot: [[0, 18]] },
      stick: { rot: [[0, 40]] },
      mouth: { sy: [[0, 0.6]] },
    },
  },
};

export default roboTonprater;
