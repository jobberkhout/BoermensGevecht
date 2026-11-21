import { chatter, pop, rattle } from '../props.ts';
import type { Clip, Key } from '../types.ts';

const HOLD_OPEN: Key[] = [[0, 1.6], [0.7, 1.6, 'hold'], [1, 0.18, 'in']];

/**
 * The Podcaststudio. The two hosts take turns complaining: while one talks and
 * waves, the other sighs and looks away. When the turret fires they both lean
 * in and shout at once, and the whole booth rattles.
 */
export const podcastClips: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.4,
    tracks: {
      // A's turn.
      a_mouth: { sy: chatter(0.04, 0.44, 7) },
      a_head: {
        rot: [[0, 0], [0.1, -7, 'inOut'], [0.2, 5, 'inOut'], [0.3, -6, 'inOut'], [0.44, 0, 'inOut'], [0.6, 13, 'inOut'], [0.9, 13, 'hold'], [1, 0, 'inOut']],
      },
      // Her arm flails behind her while she rants, and drops while she has to listen.
      a_arm: {
        rot: [[0, -10], [0.08, 22, 'out'], [0.17, -14, 'inOut'], [0.26, 26, 'inOut'], [0.35, -10, 'inOut'], [0.44, 0, 'inOut'], [0.58, -95, 'inOut'], [0.92, -95, 'hold'], [1, -10, 'inOut']],
      },
      a_body: { rot: [[0, 0], [0.22, 3, 'sineInOut'], [0.44, 0, 'sineInOut'], [0.6, -3, 'inOut'], [0.92, -3, 'hold'], [1, 0, 'inOut']] },
      bubble_a: pop(0.06, 0.43),
      // B's turn. Until then he shakes his head at everything A says.
      b_mouth: { sy: chatter(0.54, 0.94, 6) },
      b_head: {
        rot: [[0, 0], [0.12, 7, 'sineInOut'], [0.24, -6, 'sineInOut'], [0.36, 6, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.62, -6, 'inOut'], [0.72, 4, 'inOut'], [0.82, -7, 'inOut'], [0.94, 0, 'inOut'], [1, 0]],
      },
      // His finger stays down until it is his turn, then wags.
      b_arm: {
        rot: [[0, 95], [0.5, 95, 'hold'], [0.6, -12, 'out'], [0.68, 14, 'inOut'], [0.76, -14, 'inOut'], [0.84, 12, 'inOut'], [0.94, 95, 'inOut'], [1, 95]],
      },
      b_body: { rot: [[0, 0], [0.5, 0, 'hold'], [0.72, 4, 'sineInOut'], [0.94, 0, 'sineInOut'], [1, 0]] },
      bubble_b: pop(0.56, 0.93),
      // The lamp flickers between the two rants.
      lamp: {
        sx: [[0, 1], [0.46, 1, 'hold'], [0.48, 0, 'hold'], [0.5, 1, 'hold'], [0.52, 0, 'hold'], [0.54, 1, 'hold'], [1, 1]],
        sy: [[0, 1], [0.46, 1, 'hold'], [0.48, 0, 'hold'], [0.5, 1, 'hold'], [0.52, 0, 'hold'], [0.54, 1, 'hold'], [1, 1]],
      },
    },
  },

  attack: {
    loop: false,
    seconds: 0.6,
    tracks: {
      a_body: { rot: [[0, 0], [0.18, 9, 'out'], [0.7, 7, 'hold'], [1, 0, 'inOut']] },
      a_head: { rot: [[0, 0], [0.18, -12, 'out'], [0.7, -10, 'hold'], [1, 0, 'inOut']] },
      a_arm: { rot: [[0, -10], [0.18, 30, 'out'], [0.45, 5, 'inOut'], [0.7, 30, 'inOut'], [1, -10, 'inOut']] },
      a_mouth: { sy: HOLD_OPEN, sx: [[0, 1.3], [0.7, 1.3, 'hold'], [1, 1, 'in']] },
      b_body: { rot: [[0, 0], [0.18, 10, 'out'], [0.7, 8, 'hold'], [1, 0, 'inOut']] },
      b_head: { rot: [[0, 0], [0.18, -12, 'out'], [0.7, -10, 'hold'], [1, 0, 'inOut']] },
      b_arm: { rot: [[0, 95], [0.18, -16, 'out'], [0.45, 10, 'inOut'], [0.7, -16, 'inOut'], [1, 95, 'inOut']] },
      b_mouth: { sy: HOLD_OPEN, sx: [[0, 1.3], [0.7, 1.3, 'hold'], [1, 1, 'in']] },
      bubble_a: pop(0.02, 0.9, 1.15),
      bubble_b: pop(0.02, 0.9, 1.15),
      glass: { x: rattle(3, 6) },
      desk: { x: rattle(-2, 6) },
      lamp: { sx: [[0, 1.25], [1, 1, 'out']], sy: [[0, 1.25], [1, 1, 'out']] },
    },
  },
};
