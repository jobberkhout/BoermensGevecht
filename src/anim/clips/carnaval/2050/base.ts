import type { Clip, Key } from '../../../types.ts';

/** A third of a turn, each time someone goes through. */
const PUSH: Key[] = [[0, 0], [0.2, 0, 'hold'], [0.32, 120, 'inOut'], [0.7, 120, 'hold'], [0.82, 240, 'inOut'], [1, 240, 'hold']];
/** The open slot on the board blinks: come in now. */
const BLINK: Key[] = [[0, 1], [0.12, 1, 'hold'], [0.13, 0, 'hold'], [0.25, 0, 'hold'], [0.26, 1, 'hold'], [0.37, 1, 'hold'], [0.38, 0, 'hold'], [0.5, 0, 'hold'], [0.51, 1, 'hold'], [1, 1, 'hold']];
/** A light that goes green for a moment when a wristband is scanned. */
const scan = (at: number): Key[] => [[0, 1], [at, 1, 'hold'], [at + 0.03, 1.6, 'out'], [at + 0.12, 1, 'in'], [1, 1, 'hold']];
/** The sparkle off the mirror ball. */
const SPARK: Key[] = [[0, 0], [0.4, 0, 'hold'], [0.46, 1.2, 'out'], [0.56, 0, 'in'], [0.86, 0, 'hold'], [0.9, 0.9, 'out'], [0.98, 0, 'in'], [1, 0]];

/**
 * De Carnavalskoepel. Carnival in 2050 happens under a tall glass dome, kept
 * at the right temperature by the unit on the roof, whose fan never stops.
 * Inside, the mirror ball turns and sparkles. Downstairs the time-slot board
 * blinks the slot that is open now, and the turnstiles turn a third at a time
 * as wristbands are scanned.
 */
const base: { idle: Clip } = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      fan: { rot: [[0, 0], [1, 360, 'linear']], rate: 4 },
      mirror_ball: { rot: [[0, -2], [0.5, 2, 'sineInOut'], [1, -2, 'sineInOut']], sx: [[0, 1], [0.25, 0.94, 'sineInOut'], [0.5, 1, 'sineInOut'], [0.75, 0.94, 'sineInOut'], [1, 1, 'sineInOut']] },
      sparkle: { sx: SPARK, sy: SPARK, rot: [[0, 0], [1, 90, 'linear']] },
      glint: { sx: [[0, 0.5], [0.6, 0.5, 'hold'], [0.7, 1.2, 'out'], [0.85, 0.5, 'in'], [1, 0.5, 'hold']] },
      slot_now: { sx: BLINK, sy: BLINK },
      turn_a: { rot: PUSH },
      turn_b: { rot: [[0, 0], [0.5, 0, 'hold'], [0.62, 120, 'inOut'], [1, 120, 'hold']] },
      scan_a: { sx: scan(0.14), sy: scan(0.14) },
      scan_b: { sx: scan(0.44), sy: scan(0.44) },
    },
  },
};

export default base;
