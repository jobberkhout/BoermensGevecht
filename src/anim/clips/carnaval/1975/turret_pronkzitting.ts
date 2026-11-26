import { chatter, rattle } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** Shaking with laughter from `from` to `to`, head thrown back. */
const laugh = (from: number, to: number, back: number): Key[] => {
  const keys: Key[] = [[0, 0], [from, 0, 'hold'], [from + 0.05, back, 'out']];
  const shakes = 6;
  for (let i = 1; i <= shakes; i++) {
    keys.push([from + 0.05 + ((to - from - 0.1) * i) / shakes, back + (i % 2 === 0 ? 3 : -3), 'sineInOut']);
  }
  keys.push([to, 0, 'inOut'], [1, 0, 'hold']);
  return keys;
};

/** Gone from his fingers on the flick; the next one is ready by the end. */
const GONE_THEN_BACK: Key[] = [[0, 1], [0.14, 1, 'hold'], [0.16, 0, 'hold'], [0.86, 0, 'hold'], [1, 1, 'backOut']];

/**
 * De Pronkzitting. The tonprater in his barrel tells one, wagging his finger
 * and waving the other hand; at the punchline the Raad van Elf falls about,
 * A slapping the table, and then the two of them nod: very good, very good.
 * When the turret fires, B flicks a beer mat off his fingers at the enemy and
 * the other two turn to watch it go.
 */
const pronkzittingClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      // The joke: talk, talk, finger up... and the punchline.
      tp_mouth: { sy: chatter(0.02, 0.5, 9, 0.35) },
      tp_arm_front: { rot: [[0, 0], [0.1, -10, 'sineInOut'], [0.2, 4, 'sineInOut'], [0.3, -10, 'sineInOut'], [0.4, 4, 'sineInOut'], [0.5, -18, 'out'], [0.62, -18, 'hold'], [0.72, 0, 'inOut'], [1, 0, 'hold']] },
      tp_arm_back: { rot: [[0, 0], [0.15, 14, 'sineInOut'], [0.3, -6, 'sineInOut'], [0.5, 20, 'out'], [0.62, 20, 'hold'], [0.72, 0, 'inOut'], [1, 0, 'hold']] },
      tp_body: { rot: [[0, 0], [0.2, -3, 'sineInOut'], [0.4, 3, 'sineInOut'], [0.5, -4, 'out'], [0.65, -4, 'hold'], [0.75, 0, 'inOut'], [1, 0, 'hold']] },
      tp_head: { rot: [[0, 0], [0.1, -4, 'sineInOut'], [0.25, 3, 'sineInOut'], [0.4, -3, 'sineInOut'], [0.5, -8, 'out'], [0.65, -8, 'hold'], [0.75, 0, 'inOut'], [1, 0, 'hold']] },
      // The council: a polite nod while he talks, and then they fall about.
      a_head: {
        rot: [[0, 0], [0.12, 5, 'sineInOut'], [0.2, 0, 'sineInOut'], [0.32, 5, 'sineInOut'], [0.4, 0, 'sineInOut'], [0.52, 0, 'hold'], ...laugh(0.52, 0.82, -14).slice(2, -1), [0.88, 6, 'sineInOut'], [0.94, 0, 'sineInOut'], [1, 0, 'hold']],
      },
      a_body: { rot: laugh(0.52, 0.82, -5) },
      a_arm: { rot: [[0, 0], [0.56, 0, 'hold'], [0.6, -24, 'out'], [0.64, 0, 'in'], [0.68, -24, 'out'], [0.72, 0, 'in'], [0.76, -20, 'out'], [0.8, 0, 'in'], [1, 0, 'hold']] },
      b_head: {
        rot: [[0, 0], [0.2, 0, 'hold'], [0.28, 5, 'sineInOut'], [0.36, 0, 'sineInOut'], [0.54, 0, 'hold'], ...laugh(0.54, 0.84, 12).slice(2, -1), [0.9, -5, 'sineInOut'], [0.96, 0, 'sineInOut'], [1, 0, 'hold']],
      },
      b_body: { rot: laugh(0.54, 0.84, 4) },
    },
  },

  attack: {
    loop: false,
    seconds: 0.8,
    tracks: {
      // Cock the wrist, and flick: the mat is gone.
      b_arm: { rot: [[0, 0], [0.08, 14, 'out'], [0.16, -34, 'in'], [0.45, -26, 'out'], [1, 0, 'inOut']] },
      b_mat: { sx: GONE_THEN_BACK, sy: GONE_THEN_BACK, rot: [[0, 0], [0.08, 20, 'out'], [0.16, -30, 'in'], [1, 0, 'hold']] },
      b_body: { rot: [[0, 0], [0.08, -3, 'out'], [0.16, 5, 'in'], [0.5, 2, 'out'], [1, 0, 'inOut']] },
      b_head: { rot: [[0, 0], [0.16, -4, 'out'], [0.7, -4, 'hold'], [1, 0, 'inOut']] },
      // The other two turn to watch it fly.
      a_head: { rot: [[0, 0], [0.24, 8, 'out'], [0.8, 8, 'hold'], [1, 0, 'inOut']] },
      tp_head: { rot: [[0, 0], [0.22, 10, 'out'], [0.8, 10, 'hold'], [1, 0, 'inOut']] },
      tp_body: { rot: [[0, 0], [0.22, 3, 'out'], [1, 0, 'inOut']] },
      tp_mouth: { sy: [[0, 0.35], [0.2, 1.1, 'out'], [0.7, 1.1, 'hold'], [1, 0.35, 'inOut']] },
      a_arm: { rot: rattle(6, 3) },
    },
  },
};

export default pronkzittingClips;
