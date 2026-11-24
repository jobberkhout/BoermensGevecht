import { bob, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Plattegrond-Paula: lost behind a city map the size of a tablecloth. Standing
 * still she turns it this way and that, trying to make it fit the street. She
 * shuffles on with it held up in front of her, bumps whoever is in the way
 * with it, and what hits it only tears another hole that she does not notice.
 * When it is over she goes home with the map over her head.
 */
const plattegrondPaula: ClipSet = {
  idle: idle(
    { seconds: 3.6, breathe: 0.02, armSway: 0 },
    {
      arm_front: { rot: [[0, 0]] },
      arm_back: { rot: [[0, 0]] },
      // Is it this way up? Or this way?
      map: { rot: [[0, 0], [0.2, -7, 'sineInOut'], [0.36, -7, 'hold'], [0.56, 6, 'sineInOut'], [0.72, 6, 'hold'], [0.9, 0, 'sineInOut'], [1, 0, 'hold']] },
      head: {
        y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.2, -6, 'sineInOut'], [0.36, -6, 'hold'], [0.56, 5, 'sineInOut'], [0.72, 5, 'hold'], [0.9, 0, 'sineInOut'], [1, 0, 'hold']],
      },
      corner: { rot: [[0, 0], [0.56, 0, 'hold'], [0.62, -18, 'out'], [0.7, 8, 'inOut'], [0.78, 0, 'inOut'], [1, 0, 'hold']] },
    },
  ),

  walk: walk(
    { stride: 40, legSwing: 22, legLen: 38, armSwing: 0, lean: 3, sway: 1.5, headNod: 2 },
    {
      // The map stays up in front of her and wobbles at every step.
      map: { rot: swing(2, 0, 0.1), y: bob(-1.5) },
      arm_front: { rot: [[0, 0]] },
      arm_back: { rot: [[0, 0]] },
      corner: { rot: swing(14, -4, 0.2) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      // Excuse me... sorry... she walks the map right into you.
      hips: { x: [[0, 0], [0.26, -3, 'out'], [0.42, 7, 'in'], [0.62, 3, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -5, 'out'], [0.42, 8, 'in'], [1, 0, 'inOut']] },
      map: {
        x: [[0, 0], [0.26, -3, 'out'], [0.42, 8, 'in'], [0.62, 3, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.26, -4, 'out'], [0.42, 6, 'in'], [0.6, -2, 'out'], [1, 0, 'inOut']],
      },
      arm_front: { x: [[0, 0], [0.26, -2, 'out'], [0.42, 5, 'in'], [1, 0, 'inOut']] },
      arm_back: { x: [[0, 0], [0.26, -2, 'out'], [0.42, 5, 'in'], [1, 0, 'inOut']] },
      corner: { rot: [[0, 0], [0.42, 0, 'hold'], [0.5, -26, 'out'], [0.66, 10, 'inOut'], [0.84, -4, 'inOut'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 5, 'out'], [0.42, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.42, 11, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Flap. The paper shivers, the loose corner flutters; she reads on.
  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      map: {
        rot: [[0, 0], [0.1, -2.4, 'out'], [0.3, 1.8, 'sineInOut'], [0.5, -1, 'sineInOut'], [0.72, 0.5, 'sineInOut'], [1, 0, 'sineInOut']],
        sx: [[0, 1], [0.12, 0.95, 'out'], [0.36, 1.02, 'sineInOut'], [0.6, 0.99, 'sineInOut'], [1, 1, 'sineInOut']],
      },
      corner: { rot: rattle(24, 4) },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 58 },
    {
      // Off she goes, still lost, the map dragging behind her over the cobbles.
      torso: { rot: bob(2, 8) },
      head: { rot: bob(3, 6) },
      map: { rot: swing(3, 80), y: [[0, 52]], x: [[0, -30]] },
      arm_back: { rot: swing(-4, -82) },
      arm_front: { rot: swing(24, 110) },
      corner: { rot: swing(16) },
    },
  ),
};

export default plattegrondPaula;
