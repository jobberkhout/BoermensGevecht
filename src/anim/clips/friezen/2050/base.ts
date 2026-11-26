import type { Clip, Key } from '../../../types.ts';

/** The glass of the dome catches the sun now and then. */
const SHINE: Key[] = [[0, 0.4], [0.6, 0.4, 'hold'], [0.7, 1.3, 'out'], [0.85, 0.4, 'in'], [1, 0.4, 'hold']];

/**
 * Terp 2.0. The farm on its freshly raised mound, the sea lapping at its foot:
 * the palm by the door sways in the warm wind, the two flamingos on the
 * ûleboerd nod to each other, and the dome over the last natural ice glints.
 */
const base: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      palm: { rot: [[0, -0.8], [0.5, 1.2, 'sineInOut'], [1, -0.8, 'sineInOut']] },
      flamingo: { rot: [[0, 0], [0.3, 0, 'hold'], [0.4, 6, 'inOut'], [0.55, 6, 'hold'], [0.65, 0, 'inOut'], [1, 0]] },
      glint: { sx: SHINE, sy: SHINE },
    },
  },
};

export default base;
