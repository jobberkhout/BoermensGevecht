import { bob, swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** How far the legs swing, in degrees. With legs of 118 pixels that is about 98 pixels a cycle. */
const STEP = 12;
/** How far the frame dips when the legs are spread. */
const DIP = 118 * (1 - Math.cos((STEP * Math.PI) / 180));
/** The hoist cables are 34 pixels long at rest; lowering the hook by `d` stretches them by this much. */
const stretch = (d: number): number => (34 + d) / 34;

/** The beacon flashes twice a cycle. */
const FLASH: Key[] = [[0, 1], [0.1, 1.4, 'out'], [0.2, 1, 'in'], [0.5, 1, 'hold'], [0.6, 1.4, 'out'], [0.7, 1, 'in'], [1, 1, 'hold']];

/** In the attack: the hook goes down onto whoever is in front, is yanked up, carried out over the next one, let down a little to drop it, and wound home. */
const DROP: Key[] = [[0, 0], [0.18, 0, 'hold'], [0.38, 46, 'in'], [0.46, 46, 'hold'], [0.56, -18, 'out'], [0.66, -18, 'hold'], [0.74, 10, 'inOut'], [0.8, 10, 'hold'], [1, 0, 'inOut']];

/**
 * De Kraan. A quay crane that got up and walked, on four legs in steel work
 * boots. The cab hanging under the trolley is its face, and it looks down at
 * whatever is next. Waiting, it shuttles the trolley and lets the hook sway.
 * It walks like a table would, in diagonal pairs. It attacks the way it always
 * worked: trolley out, hook down, yank, carry it over, set it down, wind home.
 * Turret fire rings off the steel and sets the hook swinging. Beaten, it
 * trudges home with the boom hanging and the hook dangling low.
 */
const deKraan: ClipSet = {
  idle: {
    loop: true,
    seconds: 4,
    tracks: {
      mech: { y: [[0, 0], [0.5, 0.8, 'sineInOut'], [1, 0, 'sineInOut']] },
      trolley: { x: [[0, 0], [0.3, 0, 'hold'], [0.45, -8, 'inOut'], [0.7, -8, 'hold'], [0.85, 0, 'inOut'], [1, 0]] },
      hoist: { rot: [[0, 0], [0.45, 0, 'hold'], [0.52, 5, 'out'], [0.62, -3, 'inOut'], [0.72, 1.5, 'inOut'], [0.85, -4, 'inOut'], [0.94, 2, 'inOut'], [1, 0, 'inOut']] },
      eyes: { x: [[0, 0], [0.2, 0, 'hold'], [0.28, -2, 'inOut'], [0.5, -2, 'hold'], [0.58, 1, 'inOut'], [1, 1, 'hold']] },
      boom: { rot: [[0, 0], [0.5, -0.6, 'sineInOut'], [1, 0, 'sineInOut']] },
      beacon: { sx: FLASH, sy: FLASH },
    },
  },

  // Four legs in diagonal pairs: near front with far back, near back with far front.
  walk: {
    loop: true,
    stride: 98,
    tracks: {
      mech: { y: bob(DIP) },
      leg_front: { rot: swing(-STEP) },
      leg_back_far: { rot: swing(-STEP) },
      leg_back: { rot: swing(STEP) },
      leg_front_far: { rot: swing(STEP) },
      frame: { rot: bob(0.8) },
      boom: { rot: bob(-0.6) },
      hoist: { rot: swing(6, 0, 0.2) },
      trolley: { x: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      beacon: { sx: FLASH, sy: FLASH },
    },
  },

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      // Trolley out over the one in front; then further out, over the one behind; then home.
      trolley: { x: [[0, 0], [0.18, 14, 'inOut'], [0.56, 14, 'hold'], [0.7, 28, 'inOut'], [0.84, 28, 'hold'], [1, 0, 'inOut']] },
      hook: { y: DROP },
      cables: { sy: DROP.map(([u, d, e]): Key => [u, stretch(d), e]) },
      // The load swings as it is carried out, and settles.
      hoist: { rot: [[0, 0], [0.18, -4, 'out'], [0.3, 0, 'inOut'], [0.56, 0, 'hold'], [0.68, 12, 'out'], [0.78, -8, 'inOut'], [0.88, 4, 'inOut'], [1, 0, 'inOut']] },
      // It leans into the lift, and the boom gives under the weight.
      frame: { rot: [[0, 0], [0.46, 0, 'hold'], [0.56, 2, 'out'], [0.8, 1, 'inOut'], [1, 0, 'inOut']] },
      boom: { rot: [[0, 0], [0.46, 0, 'hold'], [0.56, 2.4, 'out'], [0.66, 1.2, 'inOut'], [0.8, 1.8, 'inOut'], [1, 0, 'inOut']] },
      mech: { y: [[0, 0], [0.46, 0, 'hold'], [0.56, 3, 'out'], [0.8, 1, 'inOut'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.46, 0, 'hold'], [0.56, -2, 'out'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.46, 0, 'hold'], [0.56, 2, 'out'], [1, 0, 'inOut']] },
      eyes: { y: [[0, 0], [0.2, 2, 'out'], [0.46, 2, 'hold'], [0.6, -1, 'inOut'], [1, 0, 'inOut']], x: [[0, 0], [0.2, 1, 'out'], [0.6, 2, 'inOut'], [1, 0, 'inOut']] },
      beacon: { sx: FLASH, sy: FLASH },
    },
  },

  // Turret fire rings off the steel: the hook swings, the boom hums, the face does not move.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      frame: { rot: [[0, 0], [0.2, -0.8, 'out'], [0.6, 0.4, 'inOut'], [1, 0, 'inOut']] },
      boom: { rot: rattle(1.2, 3) },
      hoist: { rot: rattle(9, 3) },
      beacon: { sx: [[0, 1], [0.2, 1.4, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.2, 1.4, 'out'], [1, 1, 'inOut']] },
    },
  },

  // Home at a trudge: the boom hanging, the hook dangling low, the eyes down.
  die: {
    loop: true,
    stride: 84,
    tracks: {
      mech: { y: bob(DIP * 1.2) },
      leg_front: { rot: swing(-STEP * 0.85) },
      leg_back_far: { rot: swing(-STEP * 0.85) },
      leg_back: { rot: swing(STEP * 0.85) },
      leg_front_far: { rot: swing(STEP * 0.85) },
      frame: { rot: [[0, 2], [0.5, 3, 'sineInOut'], [1, 2, 'sineInOut']] },
      boom: { rot: [[0, 3], [0.5, 3.6, 'sineInOut'], [1, 3, 'sineInOut']] },
      trolley: { x: [[0, -6]] },
      hook: { y: [[0, 30]] },
      cables: { sy: [[0, stretch(30)]] },
      hoist: { rot: swing(7, 0, 0.1) },
      eyes: { y: [[0, 2.6]] },
      beacon: { sx: [[0, 0.8]], sy: [[0, 0.8]] },
    },
  },
};

export default deKraan;
