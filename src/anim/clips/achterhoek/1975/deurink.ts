import { bob, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Deurink: stands behind the door of the deel and looks round it now and then,
 * and so does the cat behind the flap. He shuffles forward with the door held
 * just clear of the ground, shoves with it, and when it is over he carries it
 * home on his head. A shot on the door makes it ring; he does not feel a thing.
 */
const deurink: ClipSet = {
  idle: idle(
    { seconds: 3.4, breathe: 0.03, armSway: 0 },
    {
      // Both hands stay on the door.
      arm_front: { rot: [[0, 0]] },
      arm_back: { rot: [[0, 0]] },
      // A look round the door, and back behind it.
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        x: [[0, -1], [0.3, -1, 'hold'], [0.42, 3, 'sineInOut'], [0.74, 3, 'hold'], [0.86, -1, 'sineInOut'], [1, -1, 'hold']],
        rot: [[0, -2], [0.3, -2, 'hold'], [0.42, 9, 'sineInOut'], [0.58, 6, 'sineInOut'], [0.74, 9, 'sineInOut'], [0.86, -2, 'sineInOut'], [1, -2, 'hold']],
      },
      // The cat wants to know what is going on as well.
      flap: { sy: [[0, 1], [0.5, 1, 'hold'], [0.6, 0.28, 'out'], [0.78, 0.28, 'hold'], [0.83, 1, 'in'], [0.88, 0.8, 'out'], [0.93, 1, 'in'], [1, 1, 'hold']] },
    },
  ),

  walk: walk(
    { stride: 44, legSwing: 24, legLen: 38, armSwing: 0, lean: 4, sway: 2, headNod: 3 },
    {
      // He lifts the door just clear of the ground; at the bottom of every step it all but touches.
      door: { y: [[0, -3.6]], rot: swing(1.2, -0.5) },
      arm_front: { rot: [[0, -4]], y: [[0, -3]] },
      arm_back: { rot: [[0, -4]], y: [[0, -3]] },
      flap: { sy: [[0, 1], [0.3, 1, 'hold'], [0.38, 0.72, 'out'], [0.5, 1, 'in'], [0.8, 1, 'hold'], [0.88, 0.72, 'out'], [1, 1, 'in']] },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // He draws the door in, then puts his shoulder behind it.
      hips: { x: [[0, 0], [0.26, -3, 'out'], [0.4, 7, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -7, 'out'], [0.4, 9, 'in'], [0.62, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 5, 'out'], [0.4, -4, 'in'], [1, 0, 'inOut']] },
      door: {
        x: [[0, 0], [0.26, -3, 'out'], [0.4, 8, 'in'], [0.62, 3, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, -5, 'out'], [0.4, -2, 'in'], [0.62, -3, 'out'], [1, 0, 'in']],
        rot: [[0, 0], [0.26, -5, 'out'], [0.4, 7, 'in'], [0.56, 2, 'out'], [1, 0, 'inOut']],
      },
      arm_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.4, -24, 'in'], [0.62, -10, 'out'], [1, 0, 'inOut']], y: [[0, 0], [0.26, -4, 'out'], [0.4, -3, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, 6, 'out'], [0.4, -22, 'in'], [0.62, -8, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 5, 'out'], [0.4, -16, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.4, 13, 'in'], [1, 0, 'inOut']] },
      flap: { sy: [[0, 1], [0.4, 1, 'hold'], [0.48, 0.3, 'out'], [0.62, 1, 'in'], [0.72, 0.7, 'out'], [0.84, 1, 'in'], [1, 1, 'hold']] },
    },
  },

  // Ting. The door shudders in his hands and the flap rattles; that is all.
  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      door: {
        rot: [[0, 0], [0.1, -3.4, 'out'], [0.28, 2.4, 'sineInOut'], [0.48, -1.5, 'sineInOut'], [0.7, 0.7, 'sineInOut'], [1, 0, 'sineInOut']],
        x: [[0, 0], [0.1, -2.4, 'out'], [0.32, 1, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      flap: { sy: [[0, 1], [0.16, 0.4, 'out'], [0.4, 1, 'in'], [0.56, 0.72, 'out'], [0.76, 1, 'in'], [1, 1, 'hold']] },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // The door goes home on his head, held up with both hands: one behind his cap, one out of sight.
      torso: { rot: bob(2, 9) },
      head: { rot: bob(3, 4), y: [[0, 5]] },
      arm_front: { rot: swing(3, -176), y: [[0, -4]] },
      arm_back: { rot: swing(-3, -154), y: [[0, -4]] },
      door: { rot: swing(2.5, -96), x: [[0, -4]], y: bob(2, -50) },
    },
  ),
};

export default deurink;
