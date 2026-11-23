import { bob, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * De Koffer: stands behind a suitcase the size of a wardrobe, packed for next
 * year, and now and then leans on it to see whether it will shut this time.
 * It will not: the shirtsleeve stays caught in the lid. He shuffles forward
 * with it, shoves with it, and when it is over he carries it home on his
 * head. A shot on it goes "tok"; he does not feel a thing.
 */
const deKoffer: ClipSet = {
  idle: idle(
    { seconds: 3.6, breathe: 0.03, armSway: 0 },
    {
      arm_front: { rot: [[0, 0]] },
      arm_back: { rot: [[0, 0]] },
      // He leans his weight on it... it gives a little... and springs back.
      torso: {
        sy: [[0, 1], [0.5, 1.03, 'sineInOut'], [1, 1, 'sineInOut']],
        rot: [[0, 0], [0.4, 0, 'hold'], [0.5, 7, 'inOut'], [0.64, 7, 'hold'], [0.72, 0, 'out'], [1, 0, 'hold']],
      },
      koffer: {
        sy: [[0, 1], [0.4, 1, 'hold'], [0.5, 0.97, 'inOut'], [0.64, 0.97, 'hold'], [0.7, 1.02, 'out'], [0.78, 1, 'inOut'], [1, 1, 'hold']],
      },
      // The sleeve: in a bit... and out again.
      sleeve: {
        sx: [[0, 1], [0.4, 1, 'hold'], [0.5, 0.6, 'inOut'], [0.64, 0.6, 'hold'], [0.7, 1.25, 'out'], [0.8, 1, 'inOut'], [1, 1, 'hold']],
        rot: [[0, 0], [0.7, 0, 'hold'], [0.76, 14, 'out'], [0.86, 6, 'inOut'], [1, 0, 'inOut']],
      },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, -2], [0.4, -2, 'hold'], [0.5, 10, 'inOut'], [0.64, 10, 'hold'], [0.74, -6, 'out'], [0.9, -2, 'inOut'], [1, -2, 'hold']],
      },
    },
  ),

  walk: walk(
    { stride: 44, legSwing: 24, legLen: 38, armSwing: 0, lean: 4, sway: 2, headNod: 3 },
    {
      // He lifts the suitcase just clear of the ground.
      koffer: { y: [[0, -3.6]], rot: swing(1.2, -0.5) },
      arm_front: { rot: [[0, -4]], y: [[0, -3]] },
      arm_back: { rot: [[0, -4]], y: [[0, -3]] },
      sleeve: { rot: swing(10) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      hips: { x: [[0, 0], [0.26, -3, 'out'], [0.4, 7, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -7, 'out'], [0.4, 9, 'in'], [0.62, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 5, 'out'], [0.4, -4, 'in'], [1, 0, 'inOut']] },
      koffer: {
        x: [[0, 0], [0.26, -3, 'out'], [0.4, 8, 'in'], [0.62, 3, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, -5, 'out'], [0.4, -2, 'in'], [0.62, -3, 'out'], [1, 0, 'in']],
        rot: [[0, 0], [0.26, -5, 'out'], [0.4, 7, 'in'], [0.56, 2, 'out'], [1, 0, 'inOut']],
      },
      arm_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.4, -24, 'in'], [0.62, -10, 'out'], [1, 0, 'inOut']], y: [[0, 0], [0.26, -4, 'out'], [0.4, -3, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, 6, 'out'], [0.4, -22, 'in'], [0.62, -8, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 5, 'out'], [0.4, -16, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.4, 13, 'in'], [1, 0, 'inOut']] },
      sleeve: { rot: [[0, 0], [0.4, 0, 'hold'], [0.48, 24, 'out'], [0.7, -6, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  // Tok. The suitcase shudders in his hands and the sleeve flaps; that is all.
  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      koffer: {
        rot: [[0, 0], [0.1, -3.4, 'out'], [0.28, 2.4, 'sineInOut'], [0.48, -1.5, 'sineInOut'], [0.7, 0.7, 'sineInOut'], [1, 0, 'sineInOut']],
        x: [[0, 0], [0.1, -2.4, 'out'], [0.32, 1, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      sleeve: { rot: [[0, 0], [0.16, 22, 'out'], [0.4, -8, 'inOut'], [0.7, 6, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // The suitcase goes home on his head, held up with both hands. Still packed.
      torso: { rot: bob(2, 9) },
      head: { rot: bob(3, 4), y: [[0, 5]] },
      arm_front: { rot: swing(3, -176), y: [[0, -4]] },
      arm_back: { rot: swing(-3, -154), y: [[0, -4]] },
      koffer: { rot: swing(2.5, -96), x: [[0, -4]], y: bob(2, -50) },
      sleeve: { rot: swing(18, 10), rate: 2 },
    },
  ),
};

export default deKoffer;
