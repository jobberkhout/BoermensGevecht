import type { Clip, Key, Track } from '../../../types.ts';

/** Where a coin comes into the picture, and the open case it ends up in, in the drawing's own coordinates. */
const START: readonly [number, number] = [108, -141];
const CASE: readonly [number, number] = [50, -76];
/** How long one coin is on its way, as a share of the loop. */
const FLIGHT = 0.3;

/**
 * One coin dropping into the case. `rest` is where it is drawn, `from` when in
 * the loop it sets off (0..0.7). Outside its flight it is not there.
 */
function flight(rest: readonly [number, number], from: number): Track {
  const to = from + FLIGHT;
  const x0 = START[0] - rest[0];
  const y0 = START[1] - rest[1];
  const x1 = CASE[0] - rest[0];
  const y1 = CASE[1] - rest[1];
  // Key times must go up, so a coin that sets off at the very start has no key for the wait before it.
  const wait = (value: number): Key[] => (from > 0 ? [[0, value], [from, value, 'hold']] : [[0, value]]);
  const size: Key[] = [
    ...(from > 0 ? ([[0, 0], [from, 1, 'hold']] as Key[]) : ([[0, 1]] as Key[])),
    [to - 0.05, 1, 'hold'],
    [to, 0.35, 'in'],
    [to + 0.01, 0, 'hold'],
    [1, 0, 'hold'],
  ];
  return {
    x: [...wait(x0), [to, x1, 'linear'], [1, x1, 'hold']],
    // A little lob: up first, then down into the case.
    y: [...wait(y0), [from + 0.12, y0 - 2, 'out'], [to, y1, 'in'], [1, y1, 'hold']],
    sx: size,
    sy: size,
  };
}

/** The moments in the loop a coin lands in the case. */
const LANDS = [0.3, 0.63, 0.94] as const;

/** A channel that sits at `rest` and jumps to `peak` every time a coin lands, back again `back` of a loop later. */
function atLandings(rest: number, peak: number, rise: number, back: number): Key[] {
  const keys: Key[] = [[0, rest]];
  for (const at of LANDS) {
    keys.push([at, rest, 'hold'], [at + rise, peak, 'out']);
    if (at + rise + back < 1) keys.push([at + rise + back, rest, 'inOut']);
  }
  keys.push([1, rest, 'inOut']);
  return keys;
}

/** A twinkle: there, gone, there again, twice per loop, `shift` of a beat out of step. */
function twinkle(shift: number): Track {
  const size: Key[] = [[0, shift], [0.5, 1 - shift, 'sineInOut'], [1, shift, 'sineInOut']];
  return { sx: size, sy: size, rot: [[0, 0], [1, 90, 'linear']], rate: 2 };
}

/**
 * De Succesfee. A fee in krijtstreep on her own little cloud. She waves her
 * wand, the cloud bobs, her wings whirr, and coins that belong to somebody
 * else drop into her case one after another. The case gives a little with
 * every one of them, and she nods: quite right too.
 */
const succesfeeClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 0.9,
    tracks: {
      munt_a: flight([64, -96], 0),
      munt_b: flight([84, -118], 0.33),
      munt_c: flight([104, -138], 0.64),

      wolk: { y: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      // Smaller when she is higher up.
      schaduw: { sx: [[0, 1], [0.5, 0.93, 'sineInOut'], [1, 1, 'sineInOut']] },

      vleugels: { sx: [[0, 1], [0.5, 0.68, 'sineInOut'], [1, 1, 'sineInOut']], rate: 5 },
      arm: { rot: [[0, 0], [0.25, -16, 'sineInOut'], [0.5, 5, 'sineInOut'], [0.75, -12, 'sineInOut'], [1, 0, 'sineInOut']] },
      ster_a: twinkle(0.25),
      ster_b: twinkle(0.85),
      fee: { rot: atLandings(0, 2.5, 0.04, 0.1) },

      koffer: { sy: atLandings(1, 0.93, 0.03, 0.09), sx: atLandings(1, 1.04, 0.03, 0.09) },
    },
  },
};

export default succesfeeClips;
