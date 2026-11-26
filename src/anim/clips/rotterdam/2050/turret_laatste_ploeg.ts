import type { Clip, Key } from '../../../types.ts';

/** The joystick leaves his fist early in the throw, and a fresh one is pulled out of the desk before the next. */
const STICK: Key[] = [[0, 1], [0.18, 1, 'hold'], [0.2, 0, 'hold'], [0.86, 0, 'hold'], [0.96, 1, 'backOut'], [1, 1]];

/** The line on the graph grows, holds, and starts again from the bottom. */
const GROW: Key[] = [[0, 0.25], [0.7, 1, 'out'], [0.92, 1, 'hold'], [1, 0.25, 'hold']];

/**
 * De Laatste Ploeg. The port's last three people, in the control cabin. A has
 * his boots up on the desk and his bakkie pleur in his fist; B jabs a thumb
 * over her shoulder at the graph, which only goes up; C still waggles the
 * joystick he pulled out of the desk, cable and all. When the turret fires,
 * C hurls it overhand, A raises his mug, and B turns round to watch it go.
 */
const laatstePloeg: { idle: Clip; attack: Clip } = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      // A: tips the chair back, a long slurp, and down again.
      a_body: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      a_arm: { rot: [[0, 0], [0.2, 0, 'hold'], [0.32, -38, 'inOut'], [0.5, -38, 'hold'], [0.62, 0, 'inOut'], [1, 0, 'hold']] },
      a_head: { rot: [[0, 0], [0.22, 0, 'hold'], [0.34, -10, 'inOut'], [0.5, -10, 'hold'], [0.62, 0, 'inOut'], [1, 0, 'hold']] },
      // B: "Kijk dan." Jab, jab, and a nod.
      b_arm: { rot: [[0, 0], [0.1, -12, 'out'], [0.18, 0, 'in'], [0.28, -12, 'out'], [0.36, 0, 'in'], [1, 0, 'hold']] },
      b_head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.48, 6, 'inOut'], [0.56, 0, 'inOut'], [0.64, 6, 'inOut'], [0.72, 0, 'inOut'], [1, 0, 'hold']] },
      b_cup: { rot: [[0, 0], [0.5, -4, 'sineInOut'], [1, 0, 'sineInOut']] },
      // C: still steering, with nothing on the other end.
      c_arm: { rot: [[0, 0], [0.5, -7, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      c_stick: { rot: [[0, 0], [0.5, 10, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      c_head: { rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      c_body: { rot: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']], rate: 3 },
      graph: { sx: GROW, sy: GROW },
    },
  },

  attack: {
    loop: false,
    seconds: 0.8,
    tracks: {
      // Over the top, and it is gone.
      c_arm: { rot: [[0, 0], [0.1, -120, 'out'], [0.2, -14, 'in'], [0.4, 16, 'out'], [1, 0, 'inOut']] },
      c_stick: { sx: STICK, sy: STICK, rot: [[0, 0], [0.1, -30, 'out'], [0.2, 20, 'in'], [1, 0, 'inOut']] },
      c_body: { rot: [[0, 0], [0.1, -6, 'out'], [0.2, 8, 'in'], [0.5, 2, 'out'], [1, 0, 'inOut']] },
      c_head: { rot: [[0, 0], [0.1, 6, 'out'], [0.2, -8, 'in'], [0.6, -8, 'hold'], [1, 0, 'inOut']] },
      // A raises his mug to it.
      a_arm: { rot: [[0, 0], [0.24, -54, 'out'], [0.7, -54, 'hold'], [1, 0, 'inOut']] },
      a_head: { rot: [[0, 0], [0.24, 8, 'out'], [0.7, 8, 'hold'], [1, 0, 'inOut']] },
      a_body: { rot: [[0, 0], [0.2, 3, 'out'], [0.6, 0, 'inOut'], [1, 0]] },
      // B turns to watch it go, and lifts her cup.
      b_head: { rot: [[0, 0], [0.26, 10, 'out'], [0.8, 10, 'hold'], [1, 0, 'inOut']] },
      b_cup: { rot: [[0, 0], [0.24, -34, 'out'], [0.7, -34, 'hold'], [1, 0, 'inOut']] },
      b_arm: { rot: [[0, 0], [0.24, 10, 'out'], [1, 0, 'inOut']] },
    },
  },
};

export default laatstePloeg;
