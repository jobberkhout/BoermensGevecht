import { bob, flinch, idle, slinkOff, swing } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * De Zweefschaatser. Friesland is tropical now and there has not been a frozen
 * ditch in his lifetime, but he has the full tour outfit, hover-skates that
 * glow underneath, and a Hawaiian shirt over the suit. One hand on his back,
 * as skaters do; in the other a cocktail, umbrella and all. Standing, he sips
 * it. On the move he leans into the long gliding stroke without spilling a
 * drop. He fights with a skate kick, drink held high. Beaten, he glides home
 * hunched over, guarding the glass.
 */
const zweefschaatser: ClipSet = {
  idle: idle(
    { seconds: 2.8, breathe: 0.025, armSway: 0, lean: 6 },
    {
      // Hovering: a gentle bob over the road.
      hips: { y: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']], rate: 2 },
      // A sip, eyes closed in bliss, and the glass down again.
      arm_front: { rot: [[0, 0], [0.42, 0, 'hold'], [0.56, -58, 'inOut'], [0.74, -58, 'hold'], [0.88, 0, 'inOut'], [1, 0]] },
      head: { rot: [[0, 0], [0.5, 0, 'hold'], [0.6, -10, 'inOut'], [0.74, -10, 'hold'], [0.88, 0, 'inOut'], [1, 0]] },
      arm_back: { rot: [[0, 0]] },
      shirt_tail: { rot: [[0, 0], [0.5, 10, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  // The long gliding stroke: low, leaning in, one leg pushing out behind at a time.
  walk: {
    loop: true,
    stride: 78,
    tracks: {
      hips: { y: bob(2.4, 3) },
      leg_front: { rot: [[0, -6], [0.25, 34, 'sineOut'], [0.5, -6, 'sineIn'], [1, -6, 'hold']] },
      leg_back: { rot: [[0, -6], [0.5, -6, 'hold'], [0.75, 34, 'sineOut'], [1, -6, 'sineIn']] },
      torso: { rot: [[0, 24], [0.25, 27, 'sineInOut'], [0.5, 24, 'sineInOut'], [0.75, 27, 'sineInOut'], [1, 24, 'sineInOut']] },
      head: { rot: [[0, -18]] },
      // The free arm swings across, glass steady; the other stays on his back.
      arm_front: { rot: swing(18, -20) },
      arm_back: { rot: [[0, 0]] },
      shirt_tail: { rot: swing(10, 38), rate: 2 },
    },
  },

  // A skate kick, glowing sole first, with the drink held well out of harm's way.
  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: { x: [[0, 0], [0.26, -4, 'out'], [0.42, 6, 'in'], [1, 0, 'inOut']], y: [[0, 0], [0.26, 2, 'out'], [0.42, -2, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 6], [0.26, 14, 'out'], [0.42, -14, 'in'], [0.7, -6, 'out'], [1, 6, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 30, 'out'], [0.42, -78, 'in'], [0.62, -66, 'out'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -6, 'out'], [0.42, 12, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, -30, 'out'], [0.42, -96, 'in'], [0.7, -80, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, -6, 'out'], [0.42, 10, 'in'], [1, 0, 'inOut']] },
      shirt_tail: { rot: [[0, 0], [0.42, 40, 'in'], [0.7, 10, 'out'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    // Not the drink!
    arm_front: { rot: [[0, 0], [0.3, -40, 'out'], [1, 0, 'inOut']] },
    shirt_tail: { rot: [[0, 0], [0.3, 30, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 70 },
    {
      // Hunched over the glass, gliding home.
      arm_front: { rot: [[0, -70], [0.5, -62, 'sineInOut'], [1, -70, 'sineInOut']] },
      arm_back: { rot: [[0, 0]] },
      shirt_tail: { rot: swing(12, 30), rate: 2 },
    },
  ),
};

export default zweefschaatser;
