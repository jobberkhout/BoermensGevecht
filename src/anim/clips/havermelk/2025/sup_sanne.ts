import { bob, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** Undoes the breathing of her chest for the things she holds: a board does not breathe. */
const RIGID: Key[] = [[0, 1], [0.5, 1 / 1.03, 'sineInOut'], [1, 1, 'sineInOut']];

/**
 * Sup-Sanne: off the canal and into the fight, her board held up like a tower
 * shield and her paddle like a halberd. Whatever is fired at her goes ting. To
 * hit she rams the board forward; beaten, she slings it on her back and heads home.
 *
 * The board (`shield`) hangs from her near fist and the paddle from her far one.
 * The clips turn both back by as much as her arms and body have turned.
 */
const supSanne: ClipSet = {
  idle: idle(
    { seconds: 3.4, breathe: 0.03, armSway: 0 },
    {
      // On guard, until her phone buzzes: a quick look down at the pouch.
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.52, 0, 'hold'], [0.62, 14, 'inOut'], [0.84, 14, 'hold'], [0.94, 0, 'inOut'], [1, 0, 'hold']],
      },
      ponytail: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [0.64, -9, 'inOut'], [0.84, 0, 'inOut'], [1, 0, 'inOut']] },
      pouch: { rot: [[0, 0], [0.52, 0, 'hold'], [0.58, 7, 'out'], [0.68, -5, 'inOut'], [0.78, 3, 'inOut'], [0.88, 0, 'inOut'], [1, 0, 'hold']] },
      arm_front: { rot: [[0, 0]] },
      arm_back: { rot: [[0, 0]] },
      // The tail of the board rests on the road.
      shield: { y: [[0, 5]], sy: RIGID },
      paddle: { sy: RIGID },
      plant: { rot: swing(4) },
    },
  ),

  walk: walk(
    { stride: 44, legSwing: 24, legLen: 38, armSwing: 8, lean: 3, sway: 1.5, headNod: 2 },
    {
      // The board arm stays where it is whatever her back does; the board rocks a little.
      arm_front: { rot: bob(-1.5, -3) },
      shield: { rot: bob(1.5, -1.5) },
      plant: { rot: swing(9, 0, 0.15), rate: 2 },
      // The paddle goes along like a walking staff, upright, off the ground.
      paddle: {
        y: [[0, -5]],
        rot: [[0, -3], [0.25, 3.5, 'sineOut'], [0.5, -3, 'sineInOut'], [0.75, -12.5, 'sineInOut'], [1, -3, 'sineIn']],
      },
      pouch: { rot: swing(9, 0, 0.2), rate: 2 },
      ponytail: { rot: swing(11, 5, 0.9) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // She draws the board in, then rams it forward, nose first.
      hips: {
        x: [[0, 0], [0.24, -4, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, 2, 'out'], [0.45, -1, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.24, -7, 'out'], [0.45, 11, 'in'], [0.68, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, 5, 'out'], [0.45, -6, 'in'], [1, 0, 'inOut']] },
      ponytail: { rot: [[0, 0], [0.24, -12, 'out'], [0.5, 20, 'in'], [0.78, -6, 'out'], [1, 0, 'inOut']] },
      pouch: { rot: [[0, 0], [0.24, 10, 'out'], [0.5, -22, 'in'], [0.75, 10, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.24, 12, 'out'], [0.45, -20, 'in'], [0.68, -10, 'out'], [1, 0, 'inOut']] },
      // What is left after her arm and back: tipped towards her at first, forward on the hit.
      shield: {
        rot: [[0, 0], [0.24, -9, 'out'], [0.45, 16, 'in'], [0.68, 8, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, -2, 'out'], [0.45, 5, 'in'], [0.68, 3, 'out'], [1, 0, 'inOut']],
      },
      plant: { rot: [[0, 0], [0.24, 10, 'out'], [0.45, -26, 'in'], [0.6, 16, 'out'], [0.78, -8, 'inOut'], [1, 0, 'inOut']] },
      // The paddle swings out behind her for balance.
      arm_back: { rot: [[0, 0], [0.24, -12, 'out'], [0.45, 24, 'in'], [1, 0, 'inOut']] },
      paddle: {
        rot: [[0, 0], [0.24, 16, 'out'], [0.45, -24, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, -7, 'out'], [0.45, 0, 'in'], [1, 0, 'inOut']],
      },
      leg_front: { rot: [[0, 0], [0.24, 6, 'out'], [0.45, -15, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.45, 12, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Ting. The board rings like a tuning fork and the cutting shakes its leaves; she does not budge.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      shield: {
        x: [[0, 0], [0.12, -2.2, 'out'], [0.36, 0.8, 'inOut'], [1, 0, 'inOut']],
        rot: rattle(1.8, 5),
      },
      plant: { rot: rattle(26, 4) },
      pouch: { rot: rattle(9, 3) },
      ponytail: { rot: rattle(7, 3) },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // The board goes on her back, the paddle over her shoulder: the trip is off.
      arm_front: { rot: bob(-3, 108) },
      shield: { rot: bob(1.5, -112) },
      plant: { rot: swing(12), rate: 2 },
      arm_back: { rot: bob(-3, -36) },
      paddle: { y: [[0, -13]], rot: bob(2, 8) },
      pouch: { rot: swing(12, -10, 0.2), rate: 2 },
      head: { rot: bob(3, 6) },
      ponytail: { rot: bob(8, 22) },
    },
  ),
};

export default supSanne;
