import { swing } from '../../../humanoid.ts';
import { pop, rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** The same keys with the sign flipped: for the member who sits the other way round, and for the tray that stays level. */
const flip = (keys: readonly Key[]): Key[] => keys.map((k): Key => [k[0], -k[1], k[2]]);

/**
 * A knocking arm. Two raps on the table starting at `at`; a little later the
 * same hand waves the waiter away. Negative lifts the fist of the member on
 * the left; flip it for the one on the right.
 */
function knockAndShoo(at: number): Key[] {
  return [
    [0, 0],
    [at, 0, 'hold'],
    [at + 0.025, -13, 'out'],
    [at + 0.05, 0, 'in'],
    [at + 0.075, -13, 'out'],
    [at + 0.1, 0, 'in'],
    [at + 0.23, 0, 'hold'],
    [at + 0.26, -34, 'out'],
    [at + 0.285, -20, 'inOut'],
    [at + 0.31, -36, 'inOut'],
    [at + 0.335, -20, 'inOut'],
    [at + 0.36, -36, 'inOut'],
    [at + 0.41, 0, 'inOut'],
    [1, 0, 'hold'],
  ];
}

/** Something that jumps `height` pixels at each of the `times`. */
function hops(times: readonly number[], height: number): Key[] {
  const keys: Key[] = [[0, 0]];
  for (const t of times) {
    keys.push([t, 0, 'hold'], [t + 0.016, -height, 'out'], [t + 0.04, 0, 'in']);
  }
  keys.push([1, 0, 'hold']);
  return keys;
}

/** The waiter's bow: in after each pair of knocks, out again (a little too straight) when he is waved away. */
const BOW: Key[] = [
  [0, 0],
  [0.18, 0, 'hold'],
  [0.26, 26, 'inOut'],
  [0.38, 26, 'hold'],
  [0.45, -4, 'inOut'],
  [0.5, 0, 'inOut'],
  [0.62, 0, 'hold'],
  [0.7, 26, 'inOut'],
  [0.82, 26, 'hold'],
  [0.89, -4, 'inOut'],
  [0.94, 0, 'inOut'],
  [1, 0, 'hold'],
];

/** When the knuckles land (0..1 of the idle loop): A twice, then B twice. */
const RAPS_A = [0.11, 0.16];
const RAPS_B = [0.55, 0.6];

/**
 * De Sociëteit. Two members play toepen, and in toepen you raise the stakes
 * by knocking on the table. The waiter has been trained to come when someone
 * knocks. So: knock knock, the waiter bows in with the jenever, gets waved
 * away, straightens up, and then the other member knocks.
 *
 * When the turret fires, the stout member has just thrown a card he did not
 * like over his shoulder without looking. The thin one knocks once more.
 */
const societeitClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 5.4,
    tracks: {
      a_near: { rot: knockAndShoo(0.06) },
      b_near: { rot: flip(knockAndShoo(0.5)) },
      knock_a: pop(0.105, 0.2, 1),
      knock_b: pop(0.545, 0.64, 1),
      table: { y: hops([...RAPS_A, ...RAPS_B], 1.4) },
      drinks: { y: hops([...RAPS_A, ...RAPS_B], 3.2), rot: [[0, 0], [0.12, 3, 'out'], [0.17, -3, 'inOut'], [0.22, 0, 'inOut'], [0.56, -3, 'out'], [0.61, 3, 'inOut'], [0.66, 0, 'inOut'], [1, 0]] },

      waiter: { rot: BOW },
      tray: { rot: flip(BOW) },
      tails: { rot: BOW.map((k): Key => [k[0], -k[1] * 0.8, k[2]]) },
      bottle: { rot: [[0, 0], [0.18, 0, 'hold'], [0.24, -7, 'out'], [0.3, 5, 'inOut'], [0.36, 0, 'inOut'], [0.62, 0, 'hold'], [0.68, -7, 'out'], [0.74, 5, 'inOut'], [0.8, 0, 'inOut'], [1, 0]] },
      // Attentive on the way in, nose in the air on the way out.
      waiter_head: {
        rot: [[0, -3], [0.18, -3, 'hold'], [0.26, 8, 'inOut'], [0.38, 8, 'hold'], [0.45, -12, 'inOut'], [0.58, -12, 'hold'], [0.62, -3, 'inOut'], [0.7, 8, 'inOut'], [0.82, 8, 'hold'], [0.89, -12, 'inOut'], [0.97, -12, 'hold'], [1, -3, 'inOut']],
      },

      // The members do not look at him. They barely look at each other.
      a_body: {
        sy: [[0, 1], [0.5, 1.03, 'sineInOut'], [1, 1, 'sineInOut']],
        rot: [[0, 0], [0.09, 3, 'out'], [0.2, 0, 'inOut'], [0.3, -3, 'out'], [0.44, 0, 'inOut'], [1, 0]],
      },
      a_head: { rot: [[0, 0], [0.09, 5, 'out'], [0.2, 0, 'inOut'], [0.29, -9, 'out'], [0.42, -9, 'hold'], [0.5, 0, 'inOut'], [0.56, 4, 'out'], [0.66, 0, 'inOut'], [1, 0]] },
      b_body: {
        sy: [[0, 1], [0.5, 1.03, 'sineInOut'], [1, 1, 'sineInOut']],
        rot: [[0, 0], [0.53, -3, 'out'], [0.64, 0, 'inOut'], [0.74, 3, 'out'], [0.88, 0, 'inOut'], [1, 0]],
      },
      b_head: { rot: [[0, 0], [0.12, -4, 'out'], [0.22, 0, 'inOut'], [0.53, -5, 'out'], [0.64, 0, 'inOut'], [0.73, 9, 'out'], [0.86, 9, 'hold'], [0.94, 0, 'inOut'], [1, 0]] },
      wisp: {
        rot: swing(14),
        sy: [[0, 0.8], [0.5, 1.25, 'sineInOut'], [1, 0.8, 'sineInOut']],
        rate: 4,
      },
    },
  },

  attack: {
    loop: false,
    seconds: 0.7,
    tracks: {
      // The card has just left his fingers, somewhere behind his right ear.
      b_near: { rot: [[0, 165], [0.12, 180, 'out'], [0.34, 180, 'hold'], [0.82, 0, 'inOut'], [1, 0]] },
      b_body: { rot: [[0, 7], [0.4, 0, 'out'], [1, 0]] },
      b_head: { rot: [[0, -7], [0.45, 0, 'inOut'], [1, 0]] },
      wisp: { sx: [[0, 1.8], [1, 1, 'out']], sy: [[0, 1.8], [1, 1, 'out']], rot: rattle(20, 3) },
      // "Toep."
      a_near: { rot: [[0, 0], [0.14, -17, 'out'], [0.27, 0, 'in'], [0.38, -7, 'out'], [0.48, 0, 'in'], [1, 0]] },
      a_head: { rot: [[0, 0], [0.27, 6, 'in'], [0.6, 0, 'inOut'], [1, 0]] },
      knock_a: pop(0.26, 0.6, 1.2),
      knock_b: { sx: [[0, 0]], sy: [[0, 0]] },
      table: { y: [[0, 0], [0.27, 0, 'hold'], [0.32, -2.4, 'out'], [0.42, 0, 'in'], [1, 0]] },
      drinks: {
        y: [[0, 0], [0.27, 0, 'hold'], [0.34, -6, 'out'], [0.5, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.27, 0, 'hold'], [0.36, 6, 'out'], [0.5, -4, 'inOut'], [0.64, 0, 'inOut'], [1, 0]],
      },
      // The waiter is already on his way.
      waiter: { rot: [[0, 0], [0.3, 0, 'hold'], [0.6, 15, 'out'], [0.8, 15, 'hold'], [1, 0, 'inOut']] },
      tray: { rot: [[0, 0], [0.3, 0, 'hold'], [0.6, -15, 'out'], [0.8, -15, 'hold'], [1, 0, 'inOut']] },
      tails: { rot: [[0, 0], [0.3, 0, 'hold'], [0.6, -12, 'out'], [0.8, -12, 'hold'], [1, 0, 'inOut']] },
      waiter_head: { rot: [[0, -3], [0.3, -3, 'hold'], [0.6, 7, 'out'], [0.8, 7, 'hold'], [1, -3, 'inOut']] },
      bottle: { rot: rattle(9, 4) },
    },
  },
};

export default societeitClips;
