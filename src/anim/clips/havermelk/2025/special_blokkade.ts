import { swing } from '../../../humanoid.ts';
import type { Clip, Key } from '../../../types.ts';

/** Rocking side to side while they chant, each a little out of step with the next. */
const rock = (lag: number): Key[] => swing(5, 0, lag);

const blokkadeClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 1.3,
    tracks: {
      a_body: { rot: rock(0.01) },
      a_head: { rot: swing(6, 0, 0.2) },
      b_body: { rot: rock(0.34) },
      b_head: { rot: swing(7, 0, 0.5) },
      b_arm: { rot: swing(18, -6), rate: 2 },
      c_body: { rot: rock(0.67) },
      c_head: { rot: swing(6, 0, 0.8) },
      c_arm: { rot: swing(16, 4), rate: 2 },
      banner: { y: [[0, 0], [0.25, -4, 'sineOut'], [0.5, 0, 'sineIn'], [0.75, -4, 'sineOut'], [1, 0, 'sineIn']], rot: swing(2) },
    },
  },
};

export default blokkadeClips;
