import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The poncho flaps behind him: more the faster he goes. */
const FLAP: Key[] = [[0, -4], [0.25, 6, 'sineInOut'], [0.5, -2, 'sineInOut'], [0.75, 8, 'sineInOut'], [1, -4, 'sineInOut']];

/**
 * De Kluner: a tour skater with nowhere to skate. On dry land he waddles on his
 * blades, stiff-legged, rocking from side to side with his hands on his back
 * and his poncho flapping. He cannot brake, so his blow is a body-slam with both
 * arms flung out; after his first one he sits on his backside for a moment and
 * looks at the sky, which is still not freezing.
 */
const deKluner: ClipSet = {
  idle: idle(
    { seconds: 2.8, breathe: 0.03, armSway: 0, lean: 6 },
    {
      // Hands stay on his back; he shifts his weight from blade to blade.
      arm_front: { rot: [[0, 0]] },
      arm_back: { rot: [[0, 0]] },
      hips: { x: [[0, 0], [0.25, -1.5, 'sineInOut'], [0.75, 1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      head: { rot: [[0, 0], [0.4, -6, 'sineInOut'], [0.6, -6, 'hold'], [1, 0, 'sineInOut']], y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      poncho: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']] },
      card: { rot: [[0, 0], [0.5, 5, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  // Klunen: short stiff steps on the blades, the whole body rocking over each one.
  walk: walk(
    { stride: 40, legSwing: 16, legLen: 38, armSwing: 0, lean: 12, sway: 7, headNod: 4 },
    {
      hips: { y: bob(-2.4), x: swing(2.5) },
      arm_front: { rot: swing(3, 0) },
      arm_back: { rot: swing(-3, 0) },
      poncho: { rot: FLAP },
      card: { rot: swing(14, -8) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      // Arms come out from behind his back, and he throws everything he has at whoever is in front of him.
      hips: { x: [[0, 0], [0.24, -5, 'out'], [0.42, 9, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']], y: [[0, 0], [0.24, 2, 'out'], [0.42, -2, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.24, -12, 'out'], [0.42, 22, 'in'], [0.7, 10, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, -8, 'out'], [0.42, 6, 'in'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.24, 20, 'out'], [0.42, -150, 'in'], [0.7, -120, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.24, 20, 'out'], [0.42, -140, 'in'], [0.7, -112, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.24, 6, 'out'], [0.42, -18, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.42, 16, 'in'], [1, 0, 'inOut']] },
      poncho: { rot: [[0, 0], [0.42, 0, 'hold'], [0.56, 26, 'out'], [1, 0, 'inOut']] },
      card: { rot: [[0, 0], [0.42, 0, 'hold'], [0.52, -40, 'out'], [0.8, 10, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    poncho: { rot: rattle(10, 3) },
    card: { rot: rattle(-16, 3) },
  }),

  die: slinkOff(
    { legLen: 38, stride: 52 },
    {
      // Still on his skates, so it is a hobble; the card gets one more look.
      arm_front: { rot: swing(10, -40) },
      arm_back: { rot: swing(-10, -20) },
      poncho: { rot: FLAP },
      card: { rot: swing(10, 30) },
    },
  ),

  // On his backside on the asphalt, blades in the air, head going round. The game draws the stars.
  dazed: {
    loop: true,
    seconds: 1.1,
    tracks: {
      hips: { y: [[0, 27]], x: [[0, -4]] },
      torso: { rot: [[0, -14], [0.5, -10, 'sineInOut'], [1, -14, 'sineInOut']] },
      leg_front: { rot: [[0, -84], [0.5, -78, 'sineInOut'], [1, -84, 'sineInOut']] },
      leg_back: { rot: [[0, -76], [0.5, -82, 'sineInOut'], [1, -76, 'sineInOut']] },
      head: { rot: [[0, -8], [0.25, 6, 'sineInOut'], [0.5, -2, 'sineInOut'], [0.75, 8, 'sineInOut'], [1, -8, 'sineInOut']] },
      arm_front: { rot: [[0, 40]] },
      arm_back: { rot: [[0, 46]] },
      poncho: { rot: [[0, 30], [0.5, 34, 'sineInOut'], [1, 30, 'sineInOut']] },
      card: { rot: [[0, 20]] },
    },
  },
};

export default deKluner;
