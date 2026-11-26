import type { Clip, Key } from '../../../types.ts';

/** The chair leaves with the throw, and she has the next one in her hand by the end. */
const CHAIR: Key[] = [[0, 1], [0.16, 1, 'hold'], [0.18, 0, 'hold'], [0.8, 0, 'hold'], [0.92, 1, 'backOut'], [1, 1]];

/**
 * De Kubuswoning. Everything inside slides: he slides down past the window
 * with his coffee held high and climbs back up, again and again; she leans out
 * with a kitchen chair and gives him a piece of her mind; grandad reads the
 * paper in the armchair that slid out last week. When the turret fires, out
 * goes the chair, and she reaches back in for the next one.
 */
const kubuswoningClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      // Down the slope he goes, mug up, and back up hand over hand.
      b_body: {
        x: [[0, -6], [0.3, 7, 'in'], [0.42, 7, 'hold'], [0.9, -6, 'inOut'], [1, -6]],
        y: [[0, -3.4], [0.3, 4, 'in'], [0.42, 4, 'hold'], [0.9, -3.4, 'inOut'], [1, -3.4]],
        rot: [[0, 0], [0.3, 8, 'in'], [0.36, 2, 'out'], [0.42, 6, 'inOut'], [0.6, -4, 'inOut'], [0.75, 4, 'inOut'], [0.9, 0, 'inOut'], [1, 0]],
      },
      b_head: { rot: [[0, 0], [0.3, -10, 'in'], [0.42, -10, 'hold'], [0.9, 0, 'inOut'], [1, 0]] },
      // She shouts at him through the wall, chair in hand.
      a_head: {
        rot: [[0, 0], [0.3, -18, 'inOut'], [0.36, -12, 'inOut'], [0.42, -18, 'inOut'], [0.48, -12, 'inOut'], [0.54, -18, 'inOut'], [0.6, -14, 'inOut'], [0.72, 0, 'inOut'], [1, 0]],
      },
      a_body: { rot: [[0, 0], [0.3, -6, 'inOut'], [0.6, -6, 'hold'], [0.72, 0, 'inOut'], [1, 0]] },
      a_arm: { rot: [[0, 0], [0.35, 6, 'sineInOut'], [0.45, -4, 'sineInOut'], [0.55, 6, 'sineInOut'], [0.7, 0, 'sineInOut'], [1, 0]] },
      a_chair: { rot: [[0, 0], [0.35, -8, 'sineInOut'], [0.45, 6, 'sineInOut'], [0.55, -8, 'sineInOut'], [0.7, 0, 'sineInOut'], [1, 0]] },
      // Grandad turns a page, and shakes his head at the noise.
      c_paper: { rot: [[0, 0], [0.7, 0, 'hold'], [0.76, -16, 'inOut'], [0.84, 0, 'inOut'], [1, 0]] },
      c_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.46, -5, 'sineInOut'], [0.52, 4, 'sineInOut'], [0.58, -4, 'sineInOut'], [0.64, 0, 'sineInOut'], [1, 0]] },
    },
  },

  attack: {
    loop: false,
    seconds: 0.8,
    tracks: {
      // Up and back, and out of the window with it. Then in again for the next one.
      a_arm: { rot: [[0, 0], [0.08, -60, 'out'], [0.18, 40, 'in'], [0.34, 30, 'out'], [0.62, -150, 'inOut'], [0.8, -150, 'hold'], [1, 0, 'inOut']] },
      a_chair: { rot: [[0, 0], [0.08, -30, 'out'], [0.18, 50, 'in'], [0.8, 50, 'hold'], [0.86, 150, 'hold'], [1, 0, 'inOut']], sx: CHAIR, sy: CHAIR },
      a_body: { rot: [[0, 0], [0.08, -8, 'out'], [0.18, 10, 'in'], [0.4, 6, 'out'], [0.62, -12, 'inOut'], [0.8, -12, 'hold'], [1, 0, 'inOut']] },
      a_head: { rot: [[0, 0], [0.18, 8, 'out'], [0.4, 8, 'hold'], [0.6, 0, 'inOut'], [1, 0]], sy: [[0, 1], [0.12, 1.4, 'out'], [0.4, 1.4, 'hold'], [0.6, 1, 'in'], [1, 1]] },
      // He ducks; grandad lowers the paper to see where it lands.
      b_body: { y: [[0, 0], [0.1, 6, 'out'], [0.7, 6, 'hold'], [1, 0, 'inOut']] },
      c_paper: { rot: [[0, 0], [0.16, 30, 'out'], [0.8, 30, 'hold'], [1, 0, 'inOut']], y: [[0, 0], [0.16, 6, 'out'], [0.8, 6, 'hold'], [1, 0, 'inOut']] },
      c_head: { rot: [[0, 0], [0.2, 8, 'out'], [0.8, 8, 'hold'], [1, 0, 'inOut']] },
    },
  },
};

export default kubuswoningClips;
