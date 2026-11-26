import { swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key, Track } from '../../../types.ts';

const SKATERS = [1, 2, 3, 4] as const;

/** One long push back with each leg in turn, gliding in between: the tour skater's stroke. */
const PUSH: Key[] = [[0, -8], [0.45, 30, 'sineInOut'], [0.55, 30, 'hold'], [1, -8, 'sineInOut']];
const GLIDE: Key[] = [[0, 30], [0.05, 30, 'hold'], [0.5, -8, 'sineInOut'], [1, 30, 'sineInOut']];

/** Builds the same tracks for all four, with `of(n)` giving each skater's own. */
function all(of: (n: number) => Record<string, Track>): Record<string, Track> {
  return Object.assign({}, ...SKATERS.map((n) => of(n)));
}

/**
 * De Kopgroep: four tour skaters in a row, bent double, hands on their backs,
 * every stroke in perfect time, each one's scarf in the face of the one
 * behind. When they hit something the man in front puts his shoulder in and
 * the rest bump into him one after the other. Beaten, they straighten up and
 * shuffle home on their skates, each at his own pace.
 */
const kopgroep: ClipSet = {
  idle: {
    loop: true,
    seconds: 2.4,
    tracks: all((n) => ({
      [`s${n}_body`]: {
        y: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']],
        // The one at the back is out of breath; the one in front stares down the road.
        sy: n === 1 ? [[0, 1], [0.25, 1.05, 'sineInOut'], [0.5, 1, 'sineInOut'], [0.75, 1.05, 'sineInOut'], [1, 1, 'sineInOut']] : [[0, 1]],
        rot: n === 4 ? [[0, 0], [0.4, 0, 'hold'], [0.55, -6, 'sineInOut'], [0.85, -6, 'hold'], [1, 0, 'sineInOut']] : [[0, 0]],
      },
      [`s${n}_leg_front`]: { rot: [[0, 4], [0.5, 8, 'sineInOut'], [1, 4, 'sineInOut']] },
      [`s${n}_leg_back`]: { rot: [[0, -4], [0.5, -8, 'sineInOut'], [1, -4, 'sineInOut']] },
      [`s${n}_scarf`]: { rot: swing(6, 0, n * 0.17), rate: 2 },
    })),
  },

  walk: {
    loop: true,
    stride: 84,
    tracks: all((n) => ({
      [`s${n}_leg_front`]: { rot: PUSH },
      [`s${n}_leg_back`]: { rot: GLIDE },
      [`s${n}_body`]: {
        y: [[0, 0], [0.25, 2, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: swing(2.5),
      },
      [`s${n}_scarf`]: { rot: swing(9, 0, n * 0.13), rate: 2 },
    })),
  },

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: all((n) => {
      // The man in front first, then each one behind bumps into the one ahead.
      const late = (4 - n) * 0.05;
      return {
        [`s${n}_body`]: {
          rot: [[0, 0], [0.24, -12, 'out'], [0.4 + late, 16, 'in'], [0.62 + late, 6, 'out'], [1, 0, 'inOut']],
          x: [[0, 0], [0.24, -4, 'out'], [0.4 + late, 8, 'in'], [0.62 + late, 3, 'out'], [1, 0, 'inOut']],
        },
        [`s${n}_leg_front`]: { rot: [[0, 0], [0.24, 10, 'out'], [0.4 + late, -14, 'in'], [1, 0, 'inOut']] },
        [`s${n}_leg_back`]: { rot: [[0, 0], [0.24, -6, 'out'], [0.4 + late, 18, 'in'], [1, 0, 'inOut']] },
        [`s${n}_scarf`]: { rot: [[0, 0], [0.4 + late, -16, 'in'], [0.7, 10, 'out'], [1, 0, 'inOut']] },
      };
    }),
  },

  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      train: { x: [[0, 0], [0.25, -6, 'out'], [1, 0, 'inOut']] },
      ...all((n) => ({
        [`s${n}_body`]: { rot: [[0, 0], [0.25, -7, 'out'], [1, 0, 'inOut']] },
        [`s${n}_scarf`]: { rot: rattle(10, 3) },
      })),
    },
  },

  // The train falls apart: upright, scarves hanging, each shuffling home on his skates at his own pace.
  die: {
    loop: true,
    stride: 70,
    tracks: all((n) => ({
      [`s${n}_body`]: {
        rot: swing(4, -34, n * 0.21),
        x: [[0, (n - 2.5) * 5]],
        y: [[0, 0], [0.25, 2.5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 2.5, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      [`s${n}_leg_front`]: { rot: swing(-22, 34, n * 0.29) },
      [`s${n}_leg_back`]: { rot: swing(22, 34, n * 0.29) },
      [`s${n}_scarf`]: { rot: swing(5, -22, n * 0.11) },
    })),
  },
};

export default kopgroep;
