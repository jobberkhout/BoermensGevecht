import { bob, idle, swing } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { Clip, ClipSet, Key } from '../../../types.ts';

/** How far the legs swing, in degrees. With legs of 70 pixels that is about 75 pixels a cycle. */
const STEP = 15;
/** How far the hips drop when both legs are spread. */
const DIP = 70 * (1 - Math.cos((STEP * Math.PI) / 180));

/** A puff from a confetti cannon: swells and settles. */
const PUFF: Key[] = [[0, 1], [0.12, 1.25, 'out'], [0.4, 0.92, 'inOut'], [1, 1, 'inOut']];
/** The same, the other cannon, half a beat later. */
const PUFF_LATE: Key[] = [[0, 1], [0.5, 1, 'hold'], [0.62, 1.25, 'out'], [0.9, 0.92, 'inOut'], [1, 1, 'inOut']];

/** One row of the council heaves on its levers, in turn with the other two. */
const heave = (from: number): Key[] => [[0, 0], [from, 0, 'hold'], [from + 0.12, -1.4, 'inOut'], [from + 0.26, 0, 'inOut'], [1, 0, 'hold']];

/** How far the free arm goes up for the key, and the key turned back the other way so it stands upright. */
const RAISE = 130;

/**
 * Laid on top of whatever else is playing when he takes a turret: the free
 * hand comes out from under the cape holding the key of the city high, the
 * cannons fire, the council cheers. The key itself then flies to the turret.
 */
const trick: Clip = {
  loop: false,
  seconds: 0.8,
  tracks: {
    arm_back: { rot: [[0, 0], [0.3, RAISE, 'backOut'], [0.74, RAISE, 'hold'], [1, 0, 'inOut']] },
    key: {
      rot: [[0, 0], [0.3, -RAISE, 'backOut'], [0.74, -RAISE, 'hold'], [1, 0, 'inOut']],
    },
    torso: { rot: [[0, 0], [0.3, -5, 'out'], [0.74, -5, 'hold'], [1, 0, 'inOut']] },
    head: { rot: [[0, 0], [0.3, -7, 'out'], [0.74, -7, 'hold'], [1, 0, 'inOut']] },
    cape: { rot: [[0, 0], [0.3, 5, 'out'], [0.6, -2, 'inOut'], [1, 0, 'inOut']] },
    confetti_a: { sx: [[0, 1], [0.32, 1, 'hold'], [0.42, 1.7, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.32, 1, 'hold'], [0.42, 1.7, 'out'], [1, 1, 'inOut']] },
    confetti_b: { sx: [[0, 1], [0.38, 1, 'hold'], [0.48, 1.7, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.38, 1, 'hold'], [0.48, 1.7, 'out'], [1, 1, 'inOut']] },
    raad_top: { y: [[0, 0], [0.32, -1.6, 'out'], [0.46, 0, 'in'], [0.6, -1.6, 'out'], [0.74, 0, 'in'], [1, 0]] },
    raad_mid: { y: [[0, 0], [0.36, -1.6, 'out'], [0.5, 0, 'in'], [0.64, -1.6, 'out'], [0.78, 0, 'in'], [1, 0]] },
    raad_low: { y: [[0, 0], [0.4, -1.6, 'out'], [0.54, 0, 'in'], [0.68, -1.6, 'out'], [0.82, 0, 'in'], [1, 0]] },
  },
};

/**
 * De Reuzenprins. A float that walks: Prins Carnaval three storeys high, in
 * papier-mâché and paint, with the steek and its pheasant feathers, a lace
 * collar, the chain of medals, and a golden sceptre he uses as a club. Two
 * confetti cannons stick out of his cape. In his belly are eleven little
 * lit windows, and in each sits one of the Raad van Elf in a feathered cap,
 * heaving on a lever: they make him go. Standing, the council heaves row by
 * row and the cannons puff. He walks slow and heavy, the cape trailing. He
 * fights with the sceptre, brought down from on high. Turret fire really
 * hurts him, so a hit makes the whole float sway and the council rattle in
 * their windows. Beaten, he trudges home, head and feathers down, the
 * sceptre trailing behind him. His trick: holding up the key of the city.
 */
const reuzenprins: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.012, armSway: 0 },
    {
      hips: { y: [[0, 0], [0.5, 0.8, 'sineInOut'], [1, 0, 'sineInOut']] },
      raad_top: { y: heave(0.04) },
      raad_mid: { y: heave(0.34) },
      raad_low: { y: heave(0.64) },
      confetti_a: { sx: PUFF, sy: PUFF },
      confetti_b: { sx: PUFF_LATE, sy: PUFF_LATE },
      // A gracious nod to the crowd, and the feathers sway with it.
      head: { rot: [[0, 0], [0.5, 0, 'hold'], [0.62, 6, 'inOut'], [0.78, 0, 'inOut'], [1, 0]] },
      hat: { rot: [[0, 0], [0.52, 0, 'hold'], [0.64, 2, 'inOut'], [0.8, 0, 'inOut'], [1, 0]] },
      plume: { rot: [[0, 0], [0.25, 3, 'sineInOut'], [0.75, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      cape: { rot: [[0, 0], [0.5, 1.2, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: [[0, 0]] },
      sceptre: { rot: [[0, 0], [0.5, -1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  // Slow and heavy: short steps, the body rocking, the cape trailing.
  walk: {
    loop: true,
    stride: 76,
    tracks: {
      hips: { y: bob(DIP) },
      leg_front: { rot: swing(-STEP) },
      leg_back: { rot: swing(STEP) },
      torso: { rot: bob(1.4, 2) },
      head: { rot: bob(-1.4) },
      hat: { rot: bob(-1.4) },
      plume: { rot: bob(4) },
      cape: { rot: swing(2, 5) },
      arm_front: { rot: swing(4, -3) },
      sceptre: { rot: swing(-3) },
      arm_back: { rot: swing(-4) },
      raad_top: { y: bob(-1) },
      raad_mid: { y: bob(-1) },
      raad_low: { y: bob(-1) },
      confetti_a: { sx: bob(0.12, 1), sy: bob(0.12, 1) },
    },
  },

  // The sceptre raised high, and brought down on whoever is in front of him.
  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: { x: [[0, 0], [0.26, -6, 'out'], [0.42, 10, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']], y: [[0, 0], [0.42, 3, 'in'], [0.7, 0, 'out'], [1, 0]] },
      torso: { rot: [[0, 0], [0.26, -6, 'out'], [0.42, 8, 'in'], [0.7, 3, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, -30, 'out'], [0.42, 20, 'in'], [0.66, 18, 'out'], [1, 0, 'inOut']] },
      sceptre: { rot: [[0, 0], [0.26, 20, 'out'], [0.42, 80, 'in'], [0.62, 86, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, -6, 'out'], [0.42, 6, 'in'], [1, 0, 'inOut']] },
      hat: { rot: [[0, 0], [0.42, 0, 'hold'], [0.5, -6, 'out'], [0.7, 3, 'inOut'], [1, 0, 'inOut']] },
      plume: { rot: [[0, 0], [0.42, 0, 'hold'], [0.52, 10, 'out'], [0.74, -4, 'inOut'], [1, 0, 'inOut']] },
      cape: { rot: [[0, 0], [0.26, -3, 'out'], [0.46, 8, 'in'], [0.74, -2, 'inOut'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 4, 'out'], [0.42, -8, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -3, 'out'], [0.42, 7, 'in'], [1, 0, 'inOut']] },
      confetti_a: { sx: [[0, 1], [0.42, 1, 'hold'], [0.5, 1.5, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.42, 1, 'hold'], [0.5, 1.5, 'out'], [1, 1, 'inOut']] },
      confetti_b: { sx: [[0, 1], [0.44, 1, 'hold'], [0.52, 1.5, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.44, 1, 'hold'], [0.52, 1.5, 'out'], [1, 1, 'inOut']] },
      raad_top: { y: [[0, 0], [0.42, 0, 'hold'], [0.48, -1.6, 'out'], [0.6, 0, 'in'], [1, 0]] },
      raad_mid: { y: [[0, 0], [0.42, 0, 'hold'], [0.5, -1.6, 'out'], [0.62, 0, 'in'], [1, 0]] },
      raad_low: { y: [[0, 0], [0.42, 0, 'hold'], [0.52, -1.6, 'out'], [0.64, 0, 'in'], [1, 0]] },
    },
  },

  // Turret fire hurts him: the whole float sways on its legs and the council is shaken in its windows.
  hit: {
    loop: false,
    seconds: 0.55,
    tracks: {
      hips: { x: [[0, 0], [0.18, -5, 'out'], [0.5, 2, 'inOut'], [0.8, -1, 'inOut'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.18, -6, 'out'], [0.5, 4, 'inOut'], [0.78, -1.6, 'inOut'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, 5, 'out'], [0.56, -3, 'inOut'], [1, 0, 'inOut']] },
      hat: { rot: rattle(5, 3) },
      plume: { rot: rattle(10, 3) },
      cape: { rot: [[0, 0], [0.22, 6, 'out'], [0.56, -4, 'inOut'], [1, 0, 'inOut']] },
      sceptre: { rot: rattle(5, 3) },
      arm_front: { rot: [[0, 0], [0.2, -8, 'out'], [0.6, 3, 'inOut'], [1, 0, 'inOut']] },
      raad_top: { x: rattle(1.2, 4) },
      raad_mid: { x: rattle(-1.2, 4) },
      raad_low: { x: rattle(1.2, 4) },
      leg_front: { rot: [[0, 0], [0.18, 3, 'out'], [0.5, -1.5, 'inOut'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.18, 3, 'out'], [0.5, -1.5, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  // Home, head and feathers down, the sceptre trailing, the cannons spent, the council slumped.
  die: {
    loop: true,
    stride: 70,
    tracks: {
      hips: { y: bob(DIP * 1.4) },
      leg_front: { rot: swing(-18) },
      leg_back: { rot: swing(18) },
      torso: { rot: bob(2, 9) },
      head: { rot: bob(3, 14) },
      hat: { rot: [[0, 6]] },
      plume: { rot: [[0, -16]] },
      cape: { rot: [[0, 2]] },
      arm_front: { rot: [[0, 34]] },
      sceptre: { rot: [[0, -158], [0.5, -154, 'sineInOut'], [1, -158, 'sineInOut']] },
      arm_back: { rot: [[0, 0]] },
      confetti_a: { sx: [[0, 0]], sy: [[0, 0]] },
      confetti_b: { sx: [[0, 0]], sy: [[0, 0]] },
      raad_top: { y: [[0, 1.4]] },
      raad_mid: { y: [[0, 1.4]] },
      raad_low: { y: [[0, 1.4]] },
    },
  },

  trick,
};

export default reuzenprins;
