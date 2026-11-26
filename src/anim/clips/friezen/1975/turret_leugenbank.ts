import { chatter } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** Nodding along, each in his own time. */
const nod = (amp: number, from: number): Key[] => [[0, 0], [from, 0, 'hold'], [from + 0.06, amp, 'sineInOut'], [from + 0.12, 0, 'sineInOut'], [1, 0, 'hold']];

/**
 * De Leugenbank. A tells the story of '63 with his arm out, wider and wider;
 * B has heard it a hundred times, rolls his eyes and gives him an elbow; C
 * just eats dúmkes out of the tin. When the turret fires, C flicks one at the
 * enemy with his thumb and the other two turn to watch it go.
 */
const leugenbankClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      // "It was THIS cold." Wider. "No, THIS cold."
      a_arm: { rot: [[0, 0], [0.15, -14, 'sineInOut'], [0.3, 6, 'sineInOut'], [0.45, -22, 'sineInOut'], [0.6, 0, 'sineInOut'], [1, 0, 'hold']] },
      a_head: { rot: [[0, 0], [0.15, -6, 'sineInOut'], [0.3, 4, 'sineInOut'], [0.45, -8, 'sineInOut'], [0.6, 0, 'sineInOut'], [1, 0, 'hold']] },
      a_body: {
        rot: [[0, 0], [0.45, -3, 'sineInOut'], [0.6, 0, 'sineInOut'], [1, 0, 'hold']],
        // and he rocks when the elbow lands
        x: [[0, 0], [0.6, 0, 'hold'], [0.63, -2, 'out'], [0.7, 0, 'in'], [1, 0, 'hold']],
      },
      // An elbow in the ribs, and a slow shake of the head.
      b_arm: { rot: [[0, 0], [0.55, 0, 'hold'], [0.6, 16, 'out'], [0.66, 0, 'in'], [0.72, 16, 'out'], [0.78, 0, 'in'], [1, 0, 'hold']] },
      b_head: { rot: [[0, 0], [0.2, -6, 'sineInOut'], [0.35, 6, 'sineInOut'], [0.5, -6, 'sineInOut'], [0.65, 0, 'sineInOut'], [1, 0, 'hold']] },
      // Another one out of the tin and into the mouth; chew, chew.
      c_arm: { rot: [[0, 0], [0.3, 0, 'hold'], [0.4, -40, 'inOut'], [0.5, 0, 'inOut'], [1, 0, 'hold']] },
      c_head: { rot: nod(5, 0.5), sy: chatter(0.5, 0.9, 6, 1) },
    },
  },

  attack: {
    loop: false,
    seconds: 0.7,
    tracks: {
      // Thumb back, and flick.
      c_arm: { rot: [[0, 0], [0.18, 22, 'out'], [0.32, -30, 'in'], [0.6, -24, 'out'], [1, 0, 'inOut']] },
      c_body: { rot: [[0, 0], [0.18, -3, 'out'], [0.32, 4, 'in'], [1, 0, 'inOut']] },
      // The other two lean over to watch it fly.
      a_head: { rot: [[0, 0], [0.3, 10, 'out'], [0.8, 10, 'hold'], [1, 0, 'inOut']] },
      b_head: { rot: [[0, 0], [0.3, 12, 'out'], [0.8, 12, 'hold'], [1, 0, 'inOut']] },
      a_arm: { rot: [[0, 0], [0.3, 10, 'out'], [1, 0, 'inOut']] },
    },
  },
};

export default leugenbankClips;
