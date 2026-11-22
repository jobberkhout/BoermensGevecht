import type { Clip, Key, Track } from '../../../types.ts';

/**
 * One red triangle coming off the line: it appears at `start` (0..0.5 of the
 * cycle), drops `drop` pixels and is gone, until the next cycle.
 */
function fall(start: number, drop: number): Track {
  const size: Key[] = [[start, 0.3, 'hold'], [start + 0.08, 1, 'out'], [start + 0.34, 1, 'hold'], [start + 0.5, 0, 'in']];
  return {
    y: [[start, -4, 'hold'], [start + 0.5, drop, 'in']],
    sx: size,
    sy: size,
  };
}

/**
 * Flitskrach. The chart does not glide across the field, it judders: the good
 * weeks at the back wag about, the drop gives a little at every step, and the
 * arrow at the front lifts and stabs the road again and again. Red triangles
 * drop off it all the way.
 */
const flitskrachClips: { walk: Clip } = {
  walk: {
    loop: true,
    stride: 120,
    tracks: {
      crash: {
        y: [[0, 0], [0.2, -4, 'out'], [0.5, 1.5, 'in'], [0.7, -2, 'out'], [1, 0, 'in']],
        rot: [[0, 0], [0.2, -1.6, 'out'], [0.5, 1.4, 'in'], [1, 0, 'inOut']],
      },
      top: { rot: [[0, 0], [0.25, 5, 'sineInOut'], [0.5, -3, 'sineInOut'], [0.75, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      drop: { rot: [[0, 0], [0.2, -5, 'out'], [0.5, 4, 'in'], [0.72, -1.5, 'out'], [1, 0, 'inOut']] },
      // Up, and down into the road, at the half-way mark of every cycle.
      plunge: { rot: [[0, 0], [0.2, -13, 'out'], [0.5, 7, 'in'], [0.66, 2, 'out'], [1, 0, 'inOut']] },
      tri_a: fall(0.02, 30),
      tri_b: fall(0.3, 34),
      tri_c: fall(0.46, 26),
      tri_d: fall(0.16, 20),
    },
  },
};

export default flitskrachClips;
