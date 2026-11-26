import { bob, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/** The stop hand: pushed out twice, sharply, the way the online course showed it. */
const HALT: Key[] = [[0, 0], [0.5, 0, 'hold'], [0.56, -8, 'out'], [0.62, 2, 'in'], [0.68, -8, 'out'], [0.76, 0, 'inOut'], [1, 0]];

/**
 * De Verkeersregelaar: a volunteer in an orange vest with a section of crowd
 * barrier held up in front of him. He did the online course; the certificate
 * hangs from his lanyard. He looks left, looks right, blows his whistle and
 * holds up his hand: nothing gets through here. He marches with the hand still
 * up, shoves with the barrier, and what hits the barrier goes ting.
 */
const verkeersregelaar: ClipSet = {
  idle: {
    loop: true,
    seconds: 3.2,
    tracks: {
      torso: { sy: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']] },
      // Left, right, then straight ahead and the whistle.
      head: { rot: [[0, 0], [0.12, -6, 'sineInOut'], [0.24, -6, 'hold'], [0.34, 4, 'sineInOut'], [0.44, 4, 'hold'], [0.5, 0, 'sineInOut'], [0.56, -3, 'out'], [0.68, -3, 'hold'], [0.78, 0, 'inOut'], [1, 0]] },
      whistle: { rot: [[0, 0], [0.52, 0, 'hold'], [0.56, -4, 'out'], [0.6, 3, 'inOut'], [0.64, -4, 'inOut'], [0.68, 3, 'inOut'], [0.72, 0, 'inOut'], [1, 0]], sx: [[0, 1], [0.52, 1, 'hold'], [0.56, 1.15, 'out'], [0.72, 1.15, 'hold'], [0.78, 1, 'in'], [1, 1]] },
      arm_front: { rot: HALT },
      arm_back: { rot: STILL },
      barrier: { rot: [[0, 0], [0.5, -0.6, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  },

  // A march, the hand still up, the barrier carried just clear of the road.
  walk: walk(
    { stride: 42, legSwing: 22, legLen: 38, armSwing: 0, lean: 2, sway: 1, headNod: 1.5 },
    {
      arm_front: { rot: swing(3) },
      arm_back: { rot: STILL },
      barrier: { y: bob(1.6, -2.4) },
      whistle: { rot: swing(3) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // The barrier forward with his shoulder behind it, and the stop hand jabbed out with it.
      hips: { x: [[0, 0], [0.24, -3, 'out'], [0.4, 6, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.24, -5, 'out'], [0.4, 8, 'in'], [0.66, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, 3, 'out'], [0.4, -6, 'in'], [1, 0, 'inOut']] },
      barrier: {
        x: [[0, 0], [0.24, -3, 'out'], [0.4, 9, 'in'], [0.66, 3, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, -3, 'out'], [0.4, -1, 'in'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.24, -4, 'out'], [0.4, 3, 'in'], [1, 0, 'inOut']],
      },
      arm_front: { rot: [[0, 0], [0.24, 14, 'out'], [0.4, -14, 'in'], [0.66, -6, 'out'], [1, 0, 'inOut']], x: [[0, 0], [0.24, -2, 'out'], [0.4, 5, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: STILL },
      whistle: { rot: [[0, 0], [0.36, 0, 'hold'], [0.42, -6, 'out'], [0.5, 4, 'inOut'], [0.58, -4, 'inOut'], [0.7, 0, 'inOut'], [1, 0]] },
      leg_front: { rot: [[0, 0], [0.24, 5, 'out'], [0.4, -12, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.4, 10, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Ting. It came off the barrier; he did not so much as blink. The whistle goes, on principle.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      barrier: { x: rattle(3.2, 6), rot: rattle(2.4, 6) },
      whistle: { rot: rattle(5, 3) },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 62 },
    {
      // Home with the barrier dragged along behind him on its feet, the stop hand finally down.
      barrier: { x: [[0, -60]], sx: [[0, 0.72]], rot: [[0, -6], [0.5, -3, 'sineInOut'], [1, -6, 'sineInOut']], y: [[0, 0], [0.5, -1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: swing(10, 50) },
      arm_back: { rot: [[0, 40]] },
      head: { rot: bob(4, 10) },
      whistle: { rot: [[0, 30]] },
    },
  ),
};

export default verkeersregelaar;
