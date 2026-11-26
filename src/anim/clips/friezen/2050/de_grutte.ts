import { bob, idle, swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** How far the legs swing, in degrees. With legs of 80 pixels that is about 90 pixels a cycle. */
const STEP = 15;
/** How far the hips drop when both legs are spread. */
const DIP = 80 * (1 - Math.cos((STEP * Math.PI) / 180));

/** The finger: up, a wag, up. */
const WAG: Key[] = [[0, 0], [0.5, 0, 'hold'], [0.58, -10, 'inOut'], [0.66, 8, 'inOut'], [0.74, -10, 'inOut'], [0.82, 0, 'inOut'], [1, 0]];

/** The cloud swells now and then, as if he has said it again. */
const SWELL: Key[] = [[0, 1], [0.2, 1.08, 'sineInOut'], [0.4, 1, 'sineInOut'], [1, 1, 'hold']];

/**
 * De Grutte. A giant without a name, in a Hawaiian shirt as big as a sail and
 * a straw hat like a parasol, sunburnt from the nose down. He stands on the
 * road leaning on a sword taller than a man, one finger up, and over his head
 * hangs what he wants to hear: butter, bread and green cheese. Whoever cannot
 * say it does not get by. He walks with the sword carried before him and the
 * finger still up; he fights with one enormous overhead chop. Turret fire
 * bounces off the sword and the hat bobs. Beaten, he trudges home dragging
 * the blade, the cloud gone.
 */
const deGrutte: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.015, armSway: 0 },
    {
      hips: { y: [[0, 0], [0.5, 0.8, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_back: { rot: WAG },
      // A slow nod: well?
      head: { rot: [[0, 0], [0.2, 6, 'inOut'], [0.36, 0, 'inOut'], [1, 0]] },
      hat: { rot: [[0, 0], [0.22, 3, 'inOut'], [0.4, 0, 'inOut'], [1, 0]] },
      cloud: { sx: SWELL, sy: SWELL, y: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: [[0, 0]] },
      sword: { rot: [[0, 0], [0.5, -1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: {
    loop: true,
    stride: 92,
    tracks: {
      hips: { y: bob(DIP) },
      leg_front: { rot: swing(-STEP) },
      leg_back: { rot: swing(STEP) },
      torso: { rot: bob(1.4, 2) },
      head: { rot: bob(-1.5) },
      hat: { rot: bob(-2) },
      // The sword lifted off the road and carried point down before him.
      arm_front: { rot: [[0, -14], [0.5, -10, 'sineInOut'], [1, -14, 'sineInOut']] },
      sword: { rot: [[0, 12], [0.25, 15, 'sineInOut'], [0.75, 9, 'sineInOut'], [1, 12, 'sineInOut']] },
      arm_back: { rot: swing(6, 0, 0.2) },
      cloud: { y: bob(-2) },
    },
  },

  // One enormous chop: up over the hat, and down through everything in front of him.
  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: { x: [[0, 0], [0.26, -6, 'out'], [0.42, 10, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']], y: [[0, 0], [0.42, 4, 'in'], [0.7, 0, 'out'], [1, 0]] },
      torso: { rot: [[0, 0], [0.26, -8, 'out'], [0.42, 10, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, -70, 'out'], [0.42, 10, 'in'], [0.66, 4, 'out'], [1, 0, 'inOut']] },
      sword: { rot: [[0, 0], [0.26, 160, 'out'], [0.42, -92, 'in'], [0.62, -80, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, 20, 'out'], [0.42, -10, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 4, 'out'], [0.42, -10, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -3, 'out'], [0.42, 8, 'in'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, -6, 'out'], [0.42, 6, 'in'], [1, 0, 'inOut']] },
      hat: { rot: [[0, 0], [0.42, 0, 'hold'], [0.5, -10, 'out'], [0.7, 4, 'inOut'], [1, 0, 'inOut']], y: [[0, 0], [0.42, 0, 'hold'], [0.5, -6, 'out'], [0.66, 0, 'in'], [1, 0]] },
      cloud: { sx: [[0, 1], [0.42, 1, 'hold'], [0.5, 1.2, 'out'], [0.8, 1, 'inOut'], [1, 1]], sy: [[0, 1], [0.42, 1, 'hold'], [0.5, 1.2, 'out'], [0.8, 1, 'inOut'], [1, 1]] },
    },
  },

  // Turret fire: a ting off the blade, the hat bobs, he does not even look.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      torso: { rot: [[0, 0], [0.25, -2, 'out'], [1, 0, 'inOut']] },
      sword: { rot: rattle(4, 3) },
      hat: { y: [[0, 0], [0.2, -4, 'out'], [0.5, 0, 'in'], [1, 0]], rot: rattle(4, 2) },
    },
  },

  // Home, dragging the sword behind him, finger down, the cloud gone.
  die: {
    loop: true,
    stride: 80,
    tracks: {
      hips: { y: bob(DIP * 1.4) },
      leg_front: { rot: swing(-20) },
      leg_back: { rot: swing(20) },
      torso: { rot: bob(2, 12) },
      head: { rot: bob(3, 14) },
      hat: { rot: [[0, 8]] },
      // The arm hangs; the point drags along the road behind him.
      arm_front: { rot: [[0, 70]] },
      sword: { rot: [[0, -26], [0.5, -22, 'sineInOut'], [1, -26, 'sineInOut']] },
      arm_back: { rot: [[0, 150]] },
      cloud: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  },
};

export default deGrutte;
