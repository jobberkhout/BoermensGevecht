import { bob, swing } from '../../../humanoid.ts';
import type { Clip, Key, Track } from '../../../types.ts';

const PEOPLE = [1, 2, 3, 4] as const;

/** How far the body dips when the legs are spread, so the feet stay on the road. */
const LEG = 36;
const SWING = 24;
const DIP = LEG * (1 - Math.cos((SWING * Math.PI) / 180));

/** Swaying together, one way and the other. */
const SWAY: Key[] = [[0, 0], [0.25, 5, 'sineInOut'], [0.75, -5, 'sineInOut'], [1, 0, 'sineInOut']];
const UNSWAY: Key[] = SWAY.map((k): Key => [k[0], -k[1], k[2]]);

/** Every one of the four, the same way: they are in step, that is the whole point. */
function everyone(make: (n: (typeof PEOPLE)[number]) => Record<string, Track>): Record<string, Track> {
  return Object.assign({}, ...PEOPLE.map(make));
}

/**
 * De Polonaise: four revellers in a line, hands on the shoulders in front.
 * Walking, they step in time with a dip on every step and the leader waves
 * them on; standing, they sway together.
 */
const polonaiseClips: { idle: Clip; walk: Clip } = {
  idle: {
    loop: true,
    seconds: 1.6,
    tracks: {
      ...everyone((n) => ({
        [`p${n}_body`]: { rot: SWAY },
        [`p${n}_leg_front`]: { rot: UNSWAY },
        [`p${n}_leg_back`]: { rot: UNSWAY },
      })),
      p1_arm: { rot: swing(10, 0), rate: 2 },
    },
  },

  walk: {
    loop: true,
    stride: 52,
    tracks: {
      ...everyone((n) => ({
        [`p${n}_body`]: { y: bob(DIP), rot: bob(2) },
        [`p${n}_leg_front`]: { rot: swing(-SWING) },
        [`p${n}_leg_back`]: { rot: swing(SWING) },
        [`p${n}_arm`]: { rot: bob(-2) },
      })),
      // This way, everybody!
      p1_arm: { rot: swing(14, 0), rate: 2 },
    },
  },
};

export default polonaiseClips;
