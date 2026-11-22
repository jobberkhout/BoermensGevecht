import { pop } from '../../../props.ts';
import type { Clip, Key } from '../../../types.ts';

/** A thump on the beat: out at once, then settling. */
const thump = (by: number): Key[] => [[0, 1], [0.1, 1 + by, 'out'], [0.45, 1, 'inOut'], [1, 1, 'hold']];

/**
 * Høken! One loop is two beats. The wagon bounces, the speakers thump, the
 * drummer goes cymbal, hi-hat, cymbal, hi-hat, and the guitarist bangs his
 * head with one klomp on a bale while his hair tries to keep up.
 */
const hokenClips: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 0.8,
    tracks: {
      wagon: { y: [[0, 0], [0.5, -1.8, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      speaker: { sx: thump(0.07), sy: thump(0.05), rate: 2 },
      drum: { sx: thump(0.06), sy: thump(0.06), rate: 2 },
      drummer: { y: [[0, 0], [0.5, -2.5, 'sineInOut'], [1, 0, 'sineInOut']], rot: [[0, -5], [0.5, 5, 'sineInOut'], [1, -5, 'sineInOut']], rate: 2 },
      // Crash on the beat...
      stick_a: { rot: [[0, -4], [0.12, 6, 'out'], [0.6, 42, 'sineInOut'], [1, -4, 'in']], rate: 2 },
      cymbal: { rot: [[0, 11], [0.2, -8, 'sineInOut'], [0.4, 5, 'sineInOut'], [0.6, -2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      // ...hi-hat in between.
      stick_b: { rot: [[0, -26], [0.1, -40, 'sineInOut'], [0.5, 4, 'in'], [0.62, -6, 'out'], [1, -26, 'sineInOut']], rate: 2 },
      rocker: { rot: [[0, -5], [0.5, 5, 'sineInOut'], [1, -5, 'sineInOut']] },
      rocker_head: { rot: [[0, 20], [0.5, -12, 'sineInOut'], [1, 20, 'sineInOut']], rate: 2 },
      hair: { rot: [[0, 6], [0.25, -18, 'sineInOut'], [0.75, 18, 'sineInOut'], [1, 6, 'sineInOut']], rate: 2 },
      guitar: { rot: [[0, -3], [0.5, 3, 'sineInOut'], [1, -3, 'sineInOut']], rate: 2 },
      strum: { rot: [[0, -12], [0.5, 14, 'sineInOut'], [1, -12, 'sineInOut']], rate: 4 },
      note_a: {
        ...pop(0.02, 0.46),
        y: [[0, 0], [0.46, -14, 'out'], [1, -14, 'hold']],
        rot: [[0, -10], [0.46, 12, 'linear'], [1, 12, 'hold']],
      },
      note_b: {
        ...pop(0.52, 0.96),
        y: [[0, 0], [0.5, 0, 'hold'], [0.96, -14, 'out'], [1, 0, 'hold']],
        rot: [[0, 10], [0.5, 10, 'hold'], [0.96, -12, 'linear'], [1, 10, 'hold']],
      },
    },
  },
};

export default hokenClips;
