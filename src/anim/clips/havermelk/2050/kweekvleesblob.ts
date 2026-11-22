import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** In, out and back to `mid`, like breathing. */
const pulse = (amount: number, mid = 1): Key[] => [[0, mid], [0.5, mid + amount, 'sineInOut'], [1, mid, 'sineInOut']];
/** A smooth swing around `mid`: up to mid+amp a quarter of the way in, down to mid-amp three quarters in. */
const sway = (amp: number, mid = 0): Key[] => [[0, mid], [0.25, mid + amp, 'sineOut'], [0.75, mid - amp, 'sineInOut'], [1, mid, 'sineIn']];
/** One slug step: `reach` at its furthest forward, `drag` while the rest catches up. */
const step = (reach: number, drag: number, mid = 0): Key[] => [[0, mid], [0.3, mid + reach, 'sineInOut'], [0.8, mid + drag, 'sineInOut'], [1, mid, 'sineInOut']];

/**
 * The Kweekvleesblob has no legs, no wheels and no plan. It reaches forward,
 * drags its tank after it, and when something stands in the way it rears up
 * and flops down on top of it. Beaten, it goes flat and oozes home.
 */
const kweekvleesblob: ClipSet = {
  idle: {
    loop: true,
    seconds: 2.2,
    tracks: {
      // It never quite stops wobbling.
      blob: { sy: pulse(0.035), sx: pulse(-0.025) },
      front: { rot: pulse(1.6, 0), sy: [[0, 1.015], [0.25, 1, 'sineInOut'], [0.75, 1.03, 'sineInOut'], [1, 1.015, 'sineInOut']] },
      tank: { rot: pulse(-1.6, 0) },
      // The eyes each go their own way.
      pupil_front: { rot: [[0, 0], [0.28, -48, 'inOut'], [0.52, -48, 'hold'], [0.78, 30, 'inOut'], [1, 0, 'inOut']] },
      pupil_back: { rot: [[0, 0], [0.34, 62, 'inOut'], [0.6, 62, 'hold'], [0.86, -26, 'inOut'], [1, 0, 'inOut']] },
      parsley: { rot: sway(6) },
      arm: { rot: pulse(-9, 0) },
      arm_back: { rot: pulse(7, 0) },
      mouth: { sy: pulse(0.18) },
    },
  },

  walk: {
    loop: true,
    stride: 52,
    tracks: {
      // The front reaches out thin and long, then humps up while the rest is hauled in behind it.
      front: { x: step(7, -4), sx: step(0.07, -0.05, 1), sy: step(-0.05, 0.06, 1) },
      foot: { sx: step(0.05, -0.03, 1) },
      tank: { x: step(-3, 3), rot: step(-3, 2.5), y: [[0, 0], [0.55, -2.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      eye_front: { y: step(1.5, -2) },
      eye_back: { y: step(2, -1.5) },
      pupil_front: { rot: sway(34) },
      pupil_back: { rot: sway(-40, 20) },
      parsley: { rot: sway(10) },
      arm: { rot: sway(13, -10) },
      arm_back: { rot: sway(-13, 8) },
      mouth: { sy: step(0.25, -0.1, 1) },
    },
  },

  attack: {
    loop: false,
    markers: { hit: 0.36 },
    tracks: {
      // Up and back, tall and thin; then flat on its face, and the wobble takes a while to die down.
      front: {
        x: [[0, 0], [0.24, -8, 'out'], [0.36, 16, 'in'], [0.6, 4, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.24, -13, 'out'], [0.36, 4, 'in'], [0.52, 1, 'out'], [1, 0, 'inOut']],
        sy: [[0, 1], [0.24, 1.22, 'out'], [0.36, 0.72, 'in'], [0.5, 1.12, 'out'], [0.66, 0.95, 'inOut'], [0.82, 1.03, 'inOut'], [1, 1, 'inOut']],
        sx: [[0, 1], [0.24, 0.88, 'out'], [0.36, 1.2, 'in'], [0.5, 0.94, 'out'], [0.66, 1.04, 'inOut'], [0.82, 0.99, 'inOut'], [1, 1, 'inOut']],
      },
      // Both pseudopods go up in front of it, clear of its face, and come down hard.
      arm: { rot: [[0, 0], [0.24, -88, 'out'], [0.36, 36, 'in'], [0.52, 8, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.24, -74, 'out'], [0.36, 30, 'in'], [0.52, 6, 'out'], [1, 0, 'inOut']] },
      mouth: { sy: [[0, 1], [0.24, 2.3, 'out'], [0.36, 0.5, 'in'], [0.6, 1.5, 'out'], [1, 1, 'inOut']], sx: [[0, 1], [0.24, 0.85, 'out'], [0.36, 1.2, 'in'], [1, 1, 'inOut']] },
      eye_front: { sx: [[0, 1], [0.28, 1.25, 'out'], [0.36, 0.82, 'in'], [0.52, 1.15, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.28, 1.25, 'out'], [0.36, 0.82, 'in'], [0.52, 1.15, 'out'], [1, 1, 'inOut']] },
      eye_back: { sx: [[0, 1], [0.28, 1.2, 'out'], [0.36, 0.85, 'in'], [0.52, 1.1, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.28, 1.2, 'out'], [0.36, 0.85, 'in'], [0.52, 1.1, 'out'], [1, 1, 'inOut']] },
      pupil_front: { rot: [[0, 0], [0.24, -70, 'out'], [0.36, 40, 'in'], [0.54, 170, 'out'], [0.78, -50, 'inOut'], [1, 0, 'inOut']] },
      pupil_back: { rot: [[0, 0], [0.24, -60, 'out'], [0.36, 50, 'in'], [0.56, -150, 'out'], [0.8, 40, 'inOut'], [1, 0, 'inOut']] },
      parsley: { rot: [[0, 0], [0.24, -22, 'out'], [0.4, 42, 'in'], [0.6, -14, 'inOut'], [0.8, 6, 'inOut'], [1, 0, 'inOut']] },
      // The tank is dragged along, a beat late, and lands with a clunk.
      tank: {
        y: [[0, 0], [0.24, -3, 'out'], [0.36, 0, 'in'], [0.47, -12, 'out'], [0.62, 0, 'in'], [0.71, -3, 'out'], [0.8, 0, 'in'], [1, 0]],
        rot: [[0, 0], [0.24, 6, 'out'], [0.36, -6, 'in'], [0.5, 5, 'inOut'], [0.7, -2, 'inOut'], [1, 0, 'inOut']],
        x: [[0, 0], [0.24, -3, 'out'], [0.4, 6, 'in'], [1, 0, 'inOut']],
      },
      foot: { sx: [[0, 1], [0.24, 0.95, 'out'], [0.36, 1.09, 'in'], [0.62, 1, 'out'], [1, 1]] },
    },
  },

  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      blob: { x: [[0, 0], [0.25, -6, 'out'], [1, 0, 'inOut']] },
      front: {
        rot: [[0, 0], [0.25, -6, 'out'], [1, 0, 'inOut']],
        sx: [[0, 1], [0.25, 0.9, 'out'], [0.6, 1.05, 'inOut'], [1, 1, 'inOut']],
        sy: [[0, 1], [0.25, 1.1, 'out'], [0.6, 0.96, 'inOut'], [1, 1, 'inOut']],
      },
      pupil_front: { rot: [[0, 0], [0.5, 110, 'out'], [1, 0, 'inOut']] },
      pupil_back: { rot: [[0, 0], [0.5, -90, 'out'], [1, 0, 'inOut']] },
      tank: { rot: rattle(5, 3) },
      parsley: { rot: [[0, 0], [0.3, -26, 'out'], [0.65, 8, 'inOut'], [1, 0, 'inOut']] },
      arm: { rot: [[0, 0], [0.3, -40, 'out'], [1, 0, 'inOut']] },
    },
  },

  die: {
    loop: true,
    stride: 60,
    tracks: {
      // All the air is out of it. The smile is upside down, the parsley hangs, the tank bumps along behind.
      blob: { sy: pulse(-0.06, 0.78), sx: pulse(0.04, 1.06) },
      front: { x: step(6, -4), sy: step(-0.06, 0.06, 0.84), rot: [[0, 7]] },
      foot: { sx: step(0.05, -0.03, 1) },
      mouth: { sy: [[0, -0.9]], y: [[0, 6]] },
      eye_front: { sy: [[0, 0.62]] },
      eye_back: { sy: [[0, 0.62]] },
      pupil_front: { rot: [[0, 80]] },
      pupil_back: { rot: [[0, 70]] },
      parsley: { rot: sway(8, 78) },
      tank: { rot: sway(6, -7), y: [[0, 0], [0.25, -5, 'sineOut'], [0.5, 0, 'sineIn'], [0.75, -3, 'sineOut'], [1, 0, 'sineIn']] },
      arm: { rot: sway(18, 58) },
      arm_back: { rot: sway(-18, 50) },
    },
  },
};

export default kweekvleesblob;
