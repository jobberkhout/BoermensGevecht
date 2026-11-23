import { bob, swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** How far the legs swing, in degrees. With legs of 76 pixels that is about 84 pixels a cycle. */
const STEP = 16;
/** How far the body dips when the legs are spread. */
const DIP = 76 * (1 - Math.cos((STEP * Math.PI) / 180));

/** Mo's wave: twice, then the hand down again. */
const WAVE: Key[] = [[0, 0], [0.5, 0, 'hold'], [0.56, -40, 'out'], [0.62, -10, 'inOut'], [0.68, -40, 'inOut'], [0.74, -10, 'inOut'], [0.8, 0, 'inOut'], [1, 0]];

/**
 * Mo-Tron. Mo worked the night shift in 1975, "for two or three years". He is
 * a great-grandfather now, and he never stopped: he sits in the glass dome of a
 * robot as big as the factory gate, in the same blue overall, with the lunch tin
 * in one hand, the spanner in the other, the calendar on its chest and next
 * summer packed on its shoulders. The alarm clock of the boarding house sits on
 * top. He waves at you. Then he brings the spanner down. Turret fire bounces off;
 * Mo ducks, out of habit. Beaten, he trudges home dragging the spanner, and
 * waves anyway.
 */
const moTron: ClipSet = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      torso: { sy: [[0, 1], [0.5, 1.015, 'sineInOut'], [1, 1, 'sineInOut']], rot: [[0, 0], [0.5, 1, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_back: { rot: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: [[0, 0], [0.5, 3, 'sineInOut'], [1, 0, 'sineInOut']] },
      spanner: { rot: [[0, 0], [0.5, -4, 'sineInOut'], [1, 0, 'sineInOut']] },
      head: { rot: [[0, 0], [0.2, -4, 'inOut'], [0.46, -4, 'hold'], [0.6, 3, 'inOut'], [1, 0, 'inOut']] },
      mo: { y: [[0, 0], [0.5, -0.8, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      mo_arm: { rot: WAVE },
      // The clock ticks.
      clock: { rot: [[0, -3], [0.5, 3, 'hold'], [1, -3, 'hold']], rate: 4 },
      rack: { rot: [[0, 0], [0.5, 1, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  },

  walk: {
    loop: true,
    stride: 84,
    tracks: {
      mech: { y: bob(DIP) },
      leg_front: { rot: swing(-STEP) },
      leg_back: { rot: swing(STEP) },
      torso: { rot: bob(1.4, 2) },
      arm_front: { rot: swing(8) },
      arm_back: { rot: swing(-8) },
      spanner: { rot: swing(-4) },
      head: { rot: bob(-1.5) },
      rack: { rot: swing(2, 0, 0.15) },
      mo: { y: bob(-1.2) },
      mo_arm: { rot: [[0, -10]] },
      clock: { rot: swing(8, 0, 0.2), rate: 2 },
    },
  },

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      mech: { x: [[0, 0], [0.26, -6, 'out'], [0.42, 10, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']], y: [[0, 0], [0.42, 4, 'in'], [0.7, 0, 'out'], [1, 0]] },
      torso: { rot: [[0, 0], [0.26, -7, 'out'], [0.42, 9, 'in'], [0.7, 3, 'out'], [1, 0, 'inOut']] },
      // The spanner up over the shoulder, and down in one go.
      arm_front: { rot: [[0, 0], [0.26, -140, 'out'], [0.42, -8, 'in'], [0.66, -14, 'out'], [1, 0, 'inOut']] },
      spanner: { rot: [[0, 0], [0.26, -14, 'out'], [0.42, 86, 'in'], [0.66, 70, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, 14, 'out'], [0.42, -10, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 4, 'out'], [0.42, -10, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -3, 'out'], [0.42, 8, 'in'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, -4, 'out'], [0.42, 5, 'in'], [1, 0, 'inOut']] },
      // Mo leans into it with him.
      mo: { rot: [[0, 0], [0.26, -10, 'out'], [0.42, 12, 'in'], [1, 0, 'inOut']] },
      mo_arm: { rot: [[0, 0], [0.26, -60, 'out'], [0.42, 20, 'in'], [1, 0, 'inOut']] },
      rack: { rot: [[0, 0], [0.26, -3, 'out'], [0.46, 5, 'in'], [0.7, -2, 'inOut'], [1, 0, 'inOut']] },
      // The alarm goes off on the blow.
      clock: { rot: [[0, 0], [0.42, 0, 'hold'], [0.46, 14, 'linear'], [0.5, -14, 'linear'], [0.54, 12, 'linear'], [0.58, -12, 'linear'], [0.62, 8, 'linear'], [0.7, 0, 'linear'], [1, 0]] },
    },
  },

  // Turret fire bounces off the big blue body. Only Mo ducks, out of habit.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      torso: { rot: [[0, 0], [0.2, -1.6, 'out'], [0.6, 0.6, 'inOut'], [1, 0, 'inOut']] },
      mo: { y: [[0, 0], [0.25, 3, 'out'], [1, 0, 'inOut']] },
      clock: { rot: rattle(10, 3) },
      rack: { rot: rattle(2, 3) },
    },
  },

  // Home at a trudge, dragging the spanner, and still he waves: next year.
  die: {
    loop: true,
    stride: 100,
    tracks: {
      mech: { y: bob(DIP * 0.8) },
      leg_front: { rot: swing(-STEP * 0.85) },
      leg_back: { rot: swing(STEP * 0.85) },
      torso: { rot: bob(1.4, 6) },
      head: { rot: [[0, 8]] },
      arm_front: { rot: swing(3, 34) },
      spanner: { rot: [[0, 160]] },
      arm_back: { rot: swing(-4, 10) },
      rack: { rot: swing(3, -2, 0.15) },
      mo: { rot: [[0, 4]] },
      mo_arm: { rot: [[0, -20], [0.25, -44, 'sineInOut'], [0.5, -20, 'sineInOut'], [0.75, -44, 'sineInOut'], [1, -20, 'sineInOut']] },
      clock: { rot: [[0, 10]] },
    },
  },
};

export default moTron;
