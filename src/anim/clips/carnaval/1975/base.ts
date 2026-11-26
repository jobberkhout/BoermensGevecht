import type { Clip, Key } from '../../../types.ts';

/** A paper garland stirring in the draught, each a little out of step with the next. */
const stir = (lag: number): { rot: Key[]; sy: Key[] } => ({
  rot: [[0, 0], [0.25 + lag, 1.2, 'sineInOut'], [0.75 + lag, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
  sy: [[0, 1], [0.5 + lag, 1.1, 'sineInOut'], [1, 1, 'sineInOut']],
});

/** Hossing: up off his feet and down again, four times to the loop. */
const HOP: Key[] = [
  [0, 0], [0.12, -7, 'out'], [0.25, 0, 'in'],
  [0.37, -7, 'out'], [0.5, 0, 'in'],
  [0.62, -7, 'out'], [0.75, 0, 'in'],
  [0.87, -7, 'out'], [1, 0, 'in'],
];

/**
 * The residence: the stove smokes, the paper garlands stir, and behind the
 * lace curtain someone has been hossing since the eleventh of the eleventh.
 */
const baseClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 3,
    tracks: {
      smoke: {
        y: [[0, 6], [1, -22, 'linear']],
        x: [[0, 0], [1, 10, 'sineIn']],
        sx: [[0, 0.3], [0.2, 1, 'out'], [0.8, 1.2, 'linear'], [1, 0, 'in']],
        sy: [[0, 0.3], [0.2, 1, 'out'], [0.8, 1.2, 'linear'], [1, 0, 'in']],
      },
      hosser: { y: HOP, rate: 2 },
      garland_cafe: stir(0),
      garland_hall: stir(0.08),
      garland_top: stir(0.16),
    },
  },
};

export default baseClips;
