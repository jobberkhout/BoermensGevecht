import { rattle } from '../../../props.ts';
import type { Clip, ClipSet, Key } from '../../../types.ts';
import { idling, jolt, limpHome, roll, shove, type RollStyle } from '../../../vehicle.ts';

const WHEELS: RollStyle = {
  bigWheel: 33,
  wheels: { wheel_back: 33, wheel_front: 21, wheel_trailer: 17 },
  bounce: 1.4,
  rock: 0.5,
};

/** One thump of the bass per cycle: the cones kick out on the beat and ease back. */
const THUMP: Key[] = [[0, 1], [0.08, 1.1, 'out'], [0.4, 1, 'sineInOut'], [1, 1]];
/** The box sits down on its springs with every thump. */
const SETTLE: Key[] = [[0, 0], [0.08, 0.9, 'out'], [0.4, 0, 'sineInOut'], [1, 0]];
/** The light bar hops on the beat. */
const HOP: Key[] = [[0, 0], [0.1, -1.4, 'out'], [0.4, 0, 'in'], [1, 0]];

/** The beat drop: the cones blow out, ease back, blow out again. */
const DROP: Key[] = [[0, 1], [0.12, 1.45, 'out'], [0.3, 0.96, 'inOut'], [0.44, 1.3, 'out'], [0.62, 1, 'inOut'], [0.78, 1.12, 'out'], [1, 1, 'inOut']];

/**
 * The beat drop, laid on top of whatever else is playing (`trick`): the cones blow
 * out, the box jumps on its trailer and lands squat, the tractor bounces a beat later.
 */
const BEAT_DROP: Clip = {
  loop: false,
  seconds: 0.6,
  tracks: {
    speaker_a: { sx: DROP, sy: DROP },
    speaker_b: { sx: DROP, sy: DROP },
    tweeters: { sx: DROP, sy: DROP },
    // The box jumps on its trailer and lands squat.
    trailer: {
      y: [[0, 0], [0.12, -8, 'out'], [0.3, 0, 'in'], [0.44, -4, 'out'], [0.6, 0, 'in'], [1, 0]],
      sy: [[0, 1], [0.12, 1.04, 'out'], [0.3, 0.95, 'in'], [0.44, 1.02, 'out'], [0.6, 0.98, 'in'], [1, 1, 'inOut']],
      rot: [[0, 0], [0.12, -1.5, 'out'], [0.3, 1, 'inOut'], [0.6, -0.5, 'inOut'], [1, 0, 'inOut']],
    },
    lights: { y: [[0, 0], [0.1, -8, 'out'], [0.28, 0, 'in'], [0.42, -4, 'out'], [0.58, 0, 'in'], [1, 0]], rot: rattle(4, 4) },
    fence: { y: [[0, 0], [0.16, -2, 'out'], [0.3, 0, 'in'], [1, 0]], x: rattle(1.4, 4) },
    // The tractor bounces on its tyres a beat later.
    body: { y: [[0, 0], [0.16, -5, 'out'], [0.34, 0.6, 'in'], [0.5, -2, 'out'], [0.66, 0, 'in'], [1, 0]], rot: [[0, 0], [0.16, -1.4, 'out'], [0.4, 0.8, 'inOut'], [1, 0, 'inOut']] },
    driver: { rot: [[0, 0], [0.14, 10, 'out'], [0.3, -4, 'inOut'], [0.46, 8, 'out'], [0.7, 0, 'inOut'], [1, 0]] },
  },
};

/**
 * De Zuipwagen: a closed box full of loudspeakers on a trailer, behind a
 * tractor far too big for it, with the compulsory crowd fence round the box. It
 * thumps softly wherever it stands. When it rams, the whole rig lurches forward
 * on the bass. Every few seconds it drops the beat (`trick`): the cones blow
 * out, the box jumps on its trailer, the tractor bounces, and the enemy around
 * it forgets what it came for. The driver wears ear defenders and nods along.
 */
const zuipwagen: ClipSet = {
  idle: idling(0.5, 0.5, {
    speaker_a: { sx: THUMP, sy: THUMP },
    speaker_b: { sx: THUMP, sy: THUMP },
    tweeters: { sx: THUMP, sy: THUMP },
    trailer: { y: SETTLE },
    lights: { y: HOP },
    driver: { rot: [[0, 0], [0.12, 4, 'out'], [0.5, 0, 'sineInOut'], [1, 0]] },
  }),

  walk: roll(WHEELS, {
    speaker_a: { sx: THUMP, sy: THUMP, rate: 5 },
    speaker_b: { sx: THUMP, sy: THUMP, rate: 5 },
    tweeters: { sx: THUMP, sy: THUMP, rate: 5 },
    lights: { y: HOP, rate: 5 },
    // The trailer lags behind the tractor's bounce, so the two halves never move as one block.
    trailer: { rot: [[0, 0.6], [0.5, -0.6, 'sineInOut'], [1, 0.6, 'sineInOut']], y: [[0, 0], [0.5, 1, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
    driver: { rot: [[0, 0], [0.12, 4, 'out'], [0.5, 0, 'sineInOut'], [1, 0]], rate: 5 },
  }),

  attack: {
    loop: false,
    markers: { hit: 0.36 },
    tracks: {
      // Back up, then the whole rig lurches forward on one enormous bass note.
      ...shove([[0, 0], [0.22, -10, 'out'], [0.36, 16, 'in'], [0.6, 5, 'out'], [1, 0, 'inOut']], WHEELS),
      body: { rot: [[0, 0], [0.22, -2, 'out'], [0.36, 3, 'in'], [0.6, -1, 'out'], [1, 0, 'inOut']] },
      trailer: {
        rot: [[0, 0], [0.22, 2, 'out'], [0.36, -2.6, 'in'], [0.6, 1, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.36, 0, 'hold'], [0.44, -4, 'out'], [0.56, 0, 'in'], [1, 0]],
      },
      speaker_a: { sx: [[0, 1], [0.36, 1, 'hold'], [0.42, 1.3, 'out'], [0.7, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.36, 1, 'hold'], [0.42, 1.3, 'out'], [0.7, 1, 'inOut'], [1, 1]] },
      speaker_b: { sx: [[0, 1], [0.36, 1, 'hold'], [0.42, 1.3, 'out'], [0.7, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.36, 1, 'hold'], [0.42, 1.3, 'out'], [0.7, 1, 'inOut'], [1, 1]] },
      tweeters: { sx: [[0, 1], [0.36, 1, 'hold'], [0.42, 1.25, 'out'], [0.7, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.36, 1, 'hold'], [0.42, 1.25, 'out'], [0.7, 1, 'inOut'], [1, 1]] },
      lights: { y: [[0, 0], [0.36, 0, 'hold'], [0.44, -5, 'out'], [0.6, 0, 'in'], [1, 0]] },
      driver: { rot: [[0, 0], [0.22, -10, 'out'], [0.36, 12, 'in'], [0.6, 3, 'out'], [1, 0, 'inOut']] },
    },
  },

  hit: jolt({
    driver: { rot: [[0, 0], [0.3, -12, 'out'], [1, 0, 'inOut']] },
    trailer: { rot: [[0, 0], [0.3, 2, 'out'], [0.65, -1, 'inOut'], [1, 0, 'inOut']] },
    fence: { x: rattle(1.6, 3) },
    lights: { rot: rattle(3, 3) },
  }),

  die: limpHome(WHEELS, {
    // Home with the music off: the cones hang slack, the light bar sags, the driver takes his ear defenders for granted.
    speaker_a: { sx: [[0, 0.9]], sy: [[0, 0.9]] },
    speaker_b: { sx: [[0, 0.9]], sy: [[0, 0.9]] },
    tweeters: { sx: [[0, 0.85]], sy: [[0, 0.85]] },
    lights: { rot: [[0, -3]], y: [[0, 1.5]] },
    trailer: { rot: [[0, 2], [0.5, -2, 'sineInOut'], [1, 2, 'sineInOut']], rate: 4 },
    driver: { rot: [[0, 16], [0.5, 20, 'sineInOut'], [1, 16, 'sineInOut']], rate: 2 },
  }),

  trick: BEAT_DROP,
};

export default zuipwagen;
