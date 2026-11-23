import { chatter, rattle } from '../../../props.ts';
import type { Clip, Key, Track } from '../../../types.ts';

/** A part that is not there. */
const GONE: Track = { sx: [[0, 0]], sy: [[0, 0]] };

/**
 * Little clouds of steam: one for every [from, to] stretch of the clip. Each
 * pops out, drifts up a little and is gone.
 */
function puffs(times: readonly (readonly [number, number])[], rise = 5): Track {
  const scale: Key[] = [[0, 0]];
  const y: Key[] = [[0, 0]];
  for (const [from, to] of times) {
    scale.push([from, 0, 'hold'], [from + (to - from) * 0.35, 1, 'backOut'], [to, 0, 'in']);
    y.push([from, 0, 'hold'], [to, -rise, 'out']);
  }
  scale.push([1, 0, 'hold']);
  y.push([1, 0, 'hold']);
  return { sx: scale, sy: scale, y };
}

/** A mouth that pants: wide open, a little less, wide open, from `from` to `to`. */
function pant(from: number, to: number, breaths: number): Key[] {
  const keys: Key[] = [[0, 0.18], [from, 0.18, 'hold']];
  const step = (to - from) / breaths;
  for (let i = 0; i < breaths; i++) {
    keys.push([from + (i + 0.4) * step, 1.5, 'out'], [from + (i + 1) * step, 0.9, 'sineInOut']);
  }
  keys.push([Math.min(0.999, to + 0.05), 0.18, 'inOut'], [1, 0.18, 'hold']);
  return keys;
}

const OPEN: Key[] = [[0, 1.4], [0.7, 1.4, 'hold'], [1, 0.18, 'in']];

/**
 * The vrijmibo. A cannot wait: he bites, and for the next two seconds he is a
 * steam engine with a stick in his hand. B finds this very funny from behind
 * her glass. C is the sensible one: he blows on his bitterbal first. When the
 * turret fires it is C who throws, and the other two watch it go.
 */
const vrijmiboClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 4.6,
    tracks: {
      // A: up to his mouth, in, and then the regret.
      a_arm: {
        rot: [[0, 0], [0.04, 0, 'hold'], [0.1, -40, 'inOut'], [0.14, -40, 'hold'], [0.19, 16, 'out'], [0.25, -10, 'sineInOut'], [0.31, 16, 'sineInOut'], [0.37, -10, 'sineInOut'], [0.43, 16, 'sineInOut'], [0.49, -10, 'sineInOut'], [0.56, 12, 'sineInOut'], [0.66, 0, 'inOut'], [1, 0]],
      },
      a_head: {
        rot: [[0, 0], [0.04, 0, 'hold'], [0.1, 9, 'inOut'], [0.14, 9, 'hold'], [0.19, -15, 'out'], [0.3, -11, 'sineInOut'], [0.42, -15, 'sineInOut'], [0.54, -11, 'sineInOut'], [0.66, 0, 'inOut'], [0.8, 6, 'inOut'], [0.92, 6, 'hold'], [1, 0, 'inOut']],
      },
      a_body: { rot: [[0, 0], [0.14, 0, 'hold'], [0.19, -5, 'out'], [0.3, -2, 'sineInOut'], [0.42, -5, 'sineInOut'], [0.54, -2, 'sineInOut'], [0.66, 0, 'inOut'], [1, 0]] },
      a_mouth: { sy: pant(0.16, 0.58, 6), sx: [[0, 1], [0.16, 1, 'hold'], [0.2, 1.3, 'out'], [0.58, 1.3, 'hold'], [0.64, 1, 'inOut'], [1, 1]] },
      a_puff: puffs([[0.18, 0.25], [0.26, 0.33], [0.34, 0.41], [0.42, 0.49], [0.5, 0.58]]),

      // B laughs at him, then drinks to it.
      b_mouth: { sy: chatter(0.22, 0.6, 8) },
      b_head: {
        rot: [[0, 0], [0.2, 0, 'hold'], [0.26, -8, 'out'], [0.32, -3, 'sineInOut'], [0.38, -9, 'sineInOut'], [0.44, -3, 'sineInOut'], [0.5, -8, 'sineInOut'], [0.6, 0, 'inOut'], [0.72, 6, 'inOut'], [0.86, 6, 'hold'], [1, 0, 'inOut']],
      },
      b_body: { rot: [[0, 0], [0.2, 0, 'hold'], [0.3, -3, 'sineInOut'], [0.4, 1, 'sineInOut'], [0.5, -3, 'sineInOut'], [0.6, 0, 'sineInOut'], [1, 0]] },
      b_arm: {
        rot: [[0, 0], [0.2, 0, 'hold'], [0.28, 8, 'sineInOut'], [0.36, 2, 'sineInOut'], [0.44, 8, 'sineInOut'], [0.6, 0, 'sineInOut'], [0.72, -30, 'inOut'], [0.86, -30, 'hold'], [1, 0, 'inOut']],
      },

      // C blows on his, twice, and then looks at A the way you look at a colleague.
      c_arm: { rot: [[0, 0], [0.36, 0, 'hold'], [0.46, 12, 'inOut'], [0.88, 12, 'hold'], [1, 0, 'inOut']] },
      c_head: { rot: [[0, 0], [0.1, 4, 'inOut'], [0.36, 4, 'hold'], [0.46, -7, 'inOut'], [0.6, -7, 'hold'], [0.66, -3, 'sineInOut'], [0.72, -8, 'sineInOut'], [0.78, -3, 'sineInOut'], [0.84, -8, 'sineInOut'], [1, 0, 'inOut']] },
      c_mouth: {
        sy: [[0, 0.18], [0.11, 0.18, 'hold'], [0.14, 0.8, 'out'], [0.2, 0.8, 'hold'], [0.23, 0.18, 'in'], [0.25, 0.18, 'hold'], [0.28, 0.8, 'out'], [0.34, 0.8, 'hold'], [0.37, 0.18, 'in'], [1, 0.18]],
        sx: [[0, 1], [0.11, 1, 'hold'], [0.14, 0.5, 'out'], [0.36, 0.5, 'hold'], [0.4, 1, 'inOut'], [1, 1]],
      },
      c_puff: puffs([[0.13, 0.22], [0.27, 0.36]], 0),
    },
  },

  // Starts the instant the bitterbal leaves the stick.
  attack: {
    loop: false,
    seconds: 0.6,
    tracks: {
      c_arm: { rot: [[0, -15], [0.16, 38, 'out'], [0.52, 38, 'hold'], [1, 0, 'inOut']] },
      c_ball: { sx: [[0, 0], [0.72, 0, 'hold'], [1, 1, 'backOut']], sy: [[0, 0], [0.72, 0, 'hold'], [1, 1, 'backOut']] },
      c_body: { rot: [[0, 7], [0.2, 10, 'out'], [0.55, 9, 'hold'], [1, 0, 'inOut']] },
      c_head: { rot: [[0, -4], [0.2, -8, 'out'], [0.6, -8, 'hold'], [1, 0, 'inOut']] },
      c_mouth: { sy: OPEN },
      c_puff: GONE,
      // The other two watch it go. A points with his stick; B raises her glass to it.
      a_head: { rot: [[0, 0], [0.2, -9, 'out'], [0.7, -9, 'hold'], [1, 0, 'inOut']] },
      a_arm: { rot: [[0, 0], [0.2, -22, 'out'], [0.45, -10, 'inOut'], [0.7, -20, 'inOut'], [1, 0, 'inOut']] },
      a_mouth: { sy: OPEN },
      a_puff: GONE,
      b_head: { rot: [[0, 0], [0.2, -8, 'out'], [0.7, -8, 'hold'], [1, 0, 'inOut']] },
      b_arm: { rot: [[0, 0], [0.2, -12, 'out'], [0.7, -10, 'hold'], [1, 0, 'inOut']] },
      b_mouth: { sy: OPEN },
      table: { x: rattle(1.6, 5) },
    },
  },
};

export default vrijmiboClips;
