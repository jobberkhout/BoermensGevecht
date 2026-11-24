import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** Looking left, looking right, looking left again: where did the umbrella go? */
const LOOKING: Key[] = [[0, 0], [0.2, -12, 'sineInOut'], [0.45, -12, 'hold'], [0.6, 10, 'sineInOut'], [0.85, 10, 'hold'], [1, 0, 'sineInOut']];

/** Waving the phone about up there, as if the signal were a bit further up. */
const SEARCHING: Key[] = [[0, 0], [0.25, -10, 'sineInOut'], [0.5, 4, 'sineInOut'], [0.75, -6, 'sineInOut'], [1, 0, 'sineInOut']];

/**
 * De verdwaalde toerist: one of Pam's group, with nobody to follow. The map is
 * upside down and the phone is held as high as it goes, at 2%. It walks on
 * towards the enemy because that is the way everyone else was walking, and
 * swats at whoever is in the way with the map.
 */
const verdwaaldeToerist: ClipSet = {
  idle: idle(
    { seconds: 3.4, breathe: 0.03, armSway: 2 },
    {
      head: { rot: LOOKING },
      arm_back: { rot: SEARCHING },
      arm_front: { rot: [[0, 0]] },
      phone: { rot: [[0, 0], [0.5, 8, 'sineInOut'], [1, 0, 'sineInOut']] },
      // Turns the map round. Turns it back.
      map: { rot: [[0, 0], [0.4, 0, 'hold'], [0.55, 20, 'inOut'], [0.75, 20, 'hold'], [0.9, 0, 'inOut'], [1, 0]] },
    },
  ),

  walk: walk(
    { stride: 42, legSwing: 22, legLen: 38, armSwing: 6, lean: 1, sway: 3, headNod: 2 },
    {
      head: { rot: [[0, -8], [0.5, 8, 'sineInOut'], [1, -8, 'sineInOut']] },
      arm_back: { rot: swing(8) },
      arm_front: { rot: swing(-4) },
      map: { rot: swing(5) },
      phone: { rot: swing(6) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // A swat with the map. It is a map: it does not do much.
      torso: { rot: [[0, 0], [0.28, -6, 'out'], [0.45, 8, 'in'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, -4, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.28, -60, 'out'], [0.45, 14, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      map: { rot: [[0, 0], [0.28, -20, 'out'], [0.45, 30, 'in'], [0.6, -10, 'out'], [0.8, 8, 'inOut'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.45, -8, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 4, 'out'], [0.45, -8, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -3, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    arm_back: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
    arm_front: { rot: [[0, 0], [0.3, 10, 'out'], [1, 0, 'inOut']] },
    map: { rot: [[0, 0], [0.3, 24, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 62 },
    {
      // Phone down at last, map crumpled, still lost.
      arm_back: { rot: bob(4, -150) },
      phone: { rot: [[0, 20]] },
      arm_front: { rot: swing(8, 40) },
      map: { rot: [[0, 50]], sy: [[0, 0.6]] },
      head: { rot: [[0, 10], [0.5, 18, 'sineInOut'], [1, 10, 'sineInOut']] },
    },
  ),
};

export default verdwaaldeToerist;
