import { bob, swing } from '../../../humanoid.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

/** The four fingers it stands on, from the back one to the front one. */
const FINGERS = ['pinky', 'ring', 'middle', 'index'] as const;
type Finger = (typeof FINGERS)[number];

/** The same two tracks for every finger: `a` is the upper part, `b` the lower part with the nail. */
function fingers(make: (finger: Finger, i: number) => { a?: Track; b?: Track }): Record<string, Track> {
  const out: Record<string, Track> = {};
  FINGERS.forEach((finger, i) => {
    const { a, b } = make(finger, i);
    if (a) out[`${finger}_a`] = a;
    if (b) out[`${finger}_b`] = b;
  });
  return out;
}

/** A finger drumming: the tip comes up off the ground at each of `times` and is put down again at once. */
function drum(times: readonly number[]): Key[] {
  const keys: Key[] = [[0, 1]];
  for (const t of times) keys.push([t, 1, 'hold'], [t + 0.025, 0.84, 'out'], [t + 0.06, 1, 'in']);
  keys.push([1, 1]);
  return keys;
}

/** A glint that winks once per cycle, starting at `at` (0.8 at the latest, so it is done before the cycle is). */
function wink(at: number, big = 1.3): Track {
  const keys: Key[] = [[0, 1], [at, 1, 'hold'], [at + 0.05, 0.25, 'sineInOut'], [at + 0.11, big, 'sineInOut'], [at + 0.18, 1, 'sineInOut'], [1, 1]];
  return { sx: keys, sy: keys };
}

/** How far the fingers swing when it walks, in degrees. With fingers of 88 pixels that is 84 pixels a cycle. */
const STEP = 14;

/**
 * De Gouden Handdruk. A hand the size of a house, in solid gold, walking on its
 * fingers with Legal riding on the sleeve. Standing still it drums them. To
 * attack it jumps, turns itself into the hand you are offered at the end of a
 * career, thumb up, and brings that down on whoever is in front: one firm
 * shake, and a second for good manners. Shots glance off it: the cuff flicks,
 * the gold winks and the lawyer holds up the relevant clause. Beaten, it opens
 * its golden parachute and is carried off.
 */
const goudenHanddruk: ClipSet = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      // Two rolls of the fingers, little finger first, the way one waits for a signature.
      ...fingers((_, i) => ({ b: { sy: drum([0.1 + i * 0.05, 0.5 + i * 0.05]) } })),
      hand: { y: [[0, 0], [0.5, 1.2, 'sineInOut'], [1, 0, 'sineInOut']] },
      // The thumb answers each roll.
      thumb_b: { rot: [[0, 0], [0.32, 0, 'hold'], [0.37, -15, 'inOut'], [0.43, 0, 'inOut'], [0.72, 0, 'hold'], [0.77, -15, 'inOut'], [0.83, 0, 'inOut'], [1, 0]] },
      cuff: { rot: [[0, -1.2], [0.5, 1.2, 'sineInOut'], [1, -1.2, 'sineInOut']] },
      lawyer: { y: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      // He reads the small print once more, to be sure.
      writ: { rot: [[0, 0], [0.3, 0, 'hold'], [0.4, -10, 'inOut'], [0.66, -10, 'hold'], [0.78, 0, 'inOut'], [1, 0]] },
      glint_a: wink(0.2, 1.4),
      glint_b: wink(0.56),
      glint_c: wink(0.78),
    },
  },

  walk: {
    loop: true,
    stride: 84,
    tracks: {
      // A trot: little finger and middle finger together, ring finger and forefinger together.
      ...fingers((_, i) =>
        i % 2 === 0
          ? {
              a: { rot: swing(-STEP) },
              b: {
                rot: [[0, 10], [0.25, 5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -5, 'sineInOut'], [1, 10, 'sineInOut']],
                sy: [[0, 0.86], [0.25, 1, 'sineInOut'], [0.75, 1, 'hold'], [1, 0.86, 'sineInOut']],
              },
            }
          : {
              a: { rot: swing(STEP) },
              b: {
                rot: [[0, 0], [0.25, -5, 'sineInOut'], [0.5, 10, 'sineInOut'], [0.75, 5, 'sineInOut'], [1, 0, 'sineInOut']],
                sy: [[0, 1], [0.25, 1, 'hold'], [0.5, 0.86, 'sineInOut'], [0.75, 1, 'sineInOut'], [1, 1]],
              },
            },
      ),
      hand: { y: bob(2.6) },
      palm: { rot: swing(1.6) },
      thumb_a: { rot: swing(5) },
      thumb_b: { rot: swing(4, 0, 0.15) },
      // The sleeve sways a beat behind the hand, and Legal bounces on it.
      cuff: { rot: swing(-2.4, 0, 0.1) },
      lawyer: { y: bob(-1.8) },
      writ: { rot: swing(8), rate: 2 },
      glint_a: wink(0.1, 1.4),
      glint_b: wink(0.45),
      glint_c: wink(0.7),
    },
  },

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // Down on bent fingers, up, over on its side in the air, and down flat. Then the second shake, and back on its feet.
      hand: {
        x: [[0, 0], [0.16, -6, 'out'], [0.27, -2, 'in'], [0.33, 2, 'out'], [0.4, 14, 'in'], [0.66, 14, 'hold'], [0.84, 5, 'inOut'], [0.93, 0, 'in'], [1, 0]],
        y: [[0, 0], [0.16, 15, 'out'], [0.27, -20, 'in'], [0.33, -8, 'out'], [0.4, 43, 'in'], [0.48, 24, 'out'], [0.56, 40, 'in'], [0.66, 38, 'out'], [0.84, -14, 'out'], [0.93, 3, 'in'], [1, 0, 'out']],
      },
      palm: {
        rot: [[0, 0], [0.16, 5, 'out'], [0.27, -58, 'in'], [0.33, -96, 'out'], [0.4, -84, 'in'], [0.48, -92, 'out'], [0.56, -84, 'in'], [0.66, -84, 'hold'], [0.84, -8, 'inOut'], [0.93, 3, 'out'], [1, 0, 'inOut']],
        sx: [[0, 1], [0.16, 1.04, 'out'], [0.33, 0.97, 'inOut'], [0.4, 0.9, 'in'], [0.48, 1.03, 'out'], [0.56, 0.94, 'in'], [0.66, 0.97, 'out'], [0.84, 1, 'inOut'], [1, 1]],
        sy: [[0, 1], [0.16, 0.96, 'out'], [0.33, 1.02, 'inOut'], [0.4, 1.05, 'in'], [0.48, 0.99, 'out'], [0.56, 1.03, 'in'], [0.66, 1.01, 'out'], [0.84, 1, 'inOut'], [1, 1]],
      },
      // Fingers: bent for the jump, straight and together for the handshake, fanned by the blow, bent again on landing.
      ...fingers((_, i) => ({
        a: { rot: [[0, 0], [0.16, 33, 'out'], [0.27, -6, 'in'], [0.33, 0, 'out'], [0.4, 0, 'hold'], [0.43, -i * 2.6, 'out'], [0.56, 0, 'inOut'], [0.84, 0, 'hold'], [0.93, 14, 'out'], [1, 0, 'inOut']] },
        b: { rot: [[0, 0], [0.16, -66, 'out'], [0.27, 8, 'in'], [0.33, 0, 'out'], [0.84, 0, 'hold'], [0.93, -28, 'out'], [1, 0, 'inOut']] },
      })),
      // Thumb up: that is what makes it a handshake.
      thumb_a: { rot: [[0, 0], [0.16, 10, 'out'], [0.33, -22, 'inOut'], [0.66, -22, 'hold'], [0.9, 6, 'inOut'], [1, 0, 'inOut']] },
      thumb_b: { rot: [[0, 0], [0.16, 6, 'out'], [0.33, -10, 'inOut'], [0.4, -2, 'in'], [0.48, -12, 'out'], [0.66, -8, 'inOut'], [1, 0, 'inOut']] },
      // The sleeve is always a moment late.
      cuff: { rot: [[0, 0], [0.16, -3, 'out'], [0.3, 6, 'out'], [0.4, -6, 'in'], [0.48, 4, 'out'], [0.56, -3, 'in'], [0.66, 0, 'out'], [0.84, 5, 'inOut'], [0.93, -3, 'out'], [1, 0, 'inOut']] },
      // Legal leans the other way and hangs on. The paper does what paper does.
      lawyer: { rot: [[0, 0], [0.16, 0, 'hold'], [0.33, 52, 'inOut'], [0.66, 46, 'hold'], [0.9, -6, 'inOut'], [1, 0, 'inOut']] },
      writ: { rot: [[0, 0], [0.16, 8, 'out'], [0.3, -50, 'out'], [0.4, 40, 'in'], [0.5, -24, 'inOut'], [0.6, 12, 'inOut'], [0.72, 0, 'inOut'], [1, 0]] },
      glint_a: { sx: [[0, 1], [0.4, 1, 'hold'], [0.44, 2.4, 'out'], [0.62, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.4, 1, 'hold'], [0.44, 2.4, 'out'], [0.62, 1, 'inOut'], [1, 1]] },
      glint_c: { sx: [[0, 1], [0.4, 1, 'hold'], [0.45, 2, 'out'], [0.64, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.4, 1, 'hold'], [0.45, 2, 'out'], [0.64, 1, 'inOut'], [1, 1]] },
    },
  },

  // It is gold: what is fired at it glances off. The cuff flicks, the gold winks, Legal holds up the paper.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      cuff: { rot: [[0, 0], [0.18, -5, 'out'], [0.45, 3, 'inOut'], [0.75, -1, 'inOut'], [1, 0, 'inOut']] },
      thumb_b: { rot: [[0, 0], [0.2, -12, 'out'], [1, 0, 'inOut']] },
      writ: { rot: [[0, 0], [0.25, -32, 'out'], [0.7, -26, 'hold'], [1, 0, 'inOut']] },
      glint_a: { sx: [[0, 1], [0.15, 2.6, 'out'], [0.55, 1.3, 'inOut'], [1, 1, 'inOut']], sy: [[0, 1], [0.15, 2.6, 'out'], [0.55, 1.3, 'inOut'], [1, 1, 'inOut']], rot: [[0, 0], [1, 45, 'out']] },
      glint_b: { sx: [[0, 1], [0.25, 2.4, 'out'], [0.65, 1.2, 'inOut'], [1, 1, 'inOut']], sy: [[0, 1], [0.25, 2.4, 'out'], [0.65, 1.2, 'inOut'], [1, 1, 'inOut']] },
      glint_c: { sx: [[0, 1], [0.2, 2.2, 'out'], [0.6, 1.2, 'inOut'], [1, 1, 'inOut']], sy: [[0, 1], [0.2, 2.2, 'out'], [0.6, 1.2, 'inOut'], [1, 1, 'inOut']], rot: [[0, 0], [1, -45, 'out']] },
    },
  },

  // The golden parachute. A beaten unit is on screen for about 135 pixels of travel, so one cycle of
  // 150 shows it once: out of the sleeve, open, and up off the road with the hand hanging limp under it.
  die: {
    loop: true,
    stride: 150,
    tracks: {
      chute_l: {
        x: [[0, 0], [0.16, -35, 'out'], [1, -35]],
        y: [[0, 0], [0.16, -120, 'out'], [1, -120]],
        sx: [[0, 0.2], [0.07, 0.5, 'linear'], [0.22, 1.12, 'backOut'], [1, 1.12]],
        sy: [[0, 0.2], [0.07, 0.5, 'linear'], [0.22, 1.12, 'backOut'], [1, 1.12]],
        rot: [[0, 0], [0.22, 6, 'out'], [0.48, -5, 'sineInOut'], [0.74, 4, 'sineInOut'], [1, -2, 'sineInOut']],
      },
      chute_r: {
        x: [[0, 0], [0.16, 34, 'out'], [1, 34]],
        y: [[0, 0], [0.16, -120, 'out'], [1, -120]],
        sx: [[0, 0.2], [0.07, 0.5, 'linear'], [0.22, 1.12, 'backOut'], [1, 1.12]],
        sy: [[0, 0.2], [0.07, 0.5, 'linear'], [0.22, 1.12, 'backOut'], [1, 1.12]],
        rot: [[0, 0], [0.22, 6, 'out'], [0.48, -5, 'sineInOut'], [0.74, 4, 'sineInOut'], [1, -2, 'sineInOut']],
      },
      // A tug as it opens, then up and away.
      hand: { y: [[0, 0], [0.14, 3, 'in'], [0.24, -12, 'out'], [1, -70, 'sineInOut']] },
      // The hand swings under it; the parachute turns the other way by the same amount, so it stays upright.
      palm: { rot: [[0, 0], [0.22, -6, 'out'], [0.48, 5, 'sineInOut'], [0.74, -4, 'sineInOut'], [1, 2, 'sineInOut']] },
      ...fingers((_, i) => ({
        a: { rot: [[0, 0], [0.2, (1.5 - i) * 3.4, 'out'], [0.6, (1.5 - i) * 3.4 + 3, 'sineInOut'], [1, (1.5 - i) * 3.4 - 2, 'sineInOut']] },
        b: {
          rot: [[0, 0], [0.24, (1.5 - i) * 5.4, 'out'], [0.62, (1.5 - i) * 5.4 + 5, 'sineInOut'], [1, (1.5 - i) * 5.4 - 3, 'sineInOut']],
          sy: [[0, 1], [0.24, 0.93, 'out'], [1, 0.93]],
        },
      })),
      thumb_a: { rot: [[0, 0], [0.22, 14, 'out'], [0.6, 18, 'sineInOut'], [1, 12, 'sineInOut']] },
      thumb_b: { rot: [[0, 0], [0.24, 10, 'out'], [0.62, 15, 'sineInOut'], [1, 8, 'sineInOut']] },
      // Legal stays upright as well, and has the last word.
      lawyer: { rot: [[0, 0], [0.22, 6, 'out'], [0.48, -5, 'sineInOut'], [0.74, 4, 'sineInOut'], [1, -2, 'sineInOut']] },
      writ: { rot: [[0, 0], [0.18, -58, 'out'], [0.3, -44, 'inOut'], [0.42, -60, 'inOut'], [0.54, -44, 'inOut'], [0.66, -60, 'inOut'], [0.78, -44, 'inOut'], [0.9, -60, 'inOut'], [1, -50, 'inOut']] },
      glint_a: { sx: [[0, 0.6]], sy: [[0, 0.6]] },
      glint_b: { sx: [[0, 0.6]], sy: [[0, 0.6]] },
      glint_c: { sx: [[0, 0.6]], sy: [[0, 0.6]] },
    },
  },
};

export default goudenHanddruk;
