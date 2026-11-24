import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The case jolting over cobbles: a quick little hop, several times per step. */
const COBBLES: Key[] = [[0, 0], [0.2, -1.6, 'out'], [0.3, 0, 'in'], [0.55, -1.2, 'out'], [0.65, 0, 'in'], [0.85, -1.8, 'out'], [1, 0, 'in']];

/**
 * Rolkoffer-Rita: walks with her eyes on the map on her phone and her suitcase
 * clattering behind her. When someone is in the way she swings the whole case
 * over her head and brings it down on them.
 */
const rolkofferRita: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.03, armSway: 2 },
    {
      // Phone, then up at the street, then the other way, then the phone again.
      head: {
        rot: [[0, 6], [0.3, 6, 'hold'], [0.42, -8, 'inOut'], [0.6, -8, 'hold'], [0.7, 4, 'inOut'], [0.86, 4, 'hold'], [1, 6, 'inOut']],
        y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      arm_back: { rot: [[0, 0]] },
      suitcase: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      shades: { rot: [[0, 0]] },
    },
  ),

  walk: walk(
    { stride: 48, legSwing: 26, legLen: 38, armSwing: 14, lean: 4, sway: 2, headNod: 2 },
    {
      head: { rot: bob(-2, 5) },
      // The case arm only gives a little; the case rattles along behind.
      arm_back: { rot: swing(-4, 0) },
      arm_front: { rot: swing(5, -4) },
      suitcase: { y: COBBLES, rot: rattle(1.5, 5), rate: 2 },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.46 },
    tracks: {
      // Back with the case, then up and over and down on whoever it is. A full circle, back where it started.
      hips: { x: [[0, 0], [0.26, -4, 'out'], [0.46, 5, 'in'], [1, 0, 'inOut']], y: [[0, 0], [0.26, 2, 'out'], [0.46, -1, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -10, 'out'], [0.46, 14, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, -6, 'out'], [0.46, 8, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, 40, 'out'], [0.38, 170, 'linear'], [0.46, 250, 'in'], [0.66, 290, 'out'], [1, 360, 'inOut']] },
      suitcase: { rot: [[0, 0], [0.26, 20, 'out'], [0.38, -10, 'linear'], [0.46, -6, 'in'], [0.66, 14, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, 20, 'out'], [0.46, -20, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.46, -12, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.46, 10, 'in'], [1, 0, 'inOut']] },
      shades: { rot: [[0, 0], [0.46, 0, 'hold'], [0.56, -12, 'out'], [0.8, 0, 'inOut']] },
    },
  },

  hit: flinch({
    suitcase: { rot: rattle(6, 3) },
    shades: { rot: [[0, 0], [0.3, -14, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 66 },
    {
      // She does not leave it behind. She drags it home, on one wheel.
      arm_back: { rot: swing(-4, -16) },
      suitcase: { y: COBBLES, rot: rattle(3, 5), rate: 2 },
      shades: { rot: [[0, 0]] },
    },
  ),
};

export default rolkofferRita;
