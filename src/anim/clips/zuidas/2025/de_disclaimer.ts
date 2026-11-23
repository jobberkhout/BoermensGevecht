import { bob, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STILL: Key[] = [[0, 0]];

/** A part that is not there in this clip. */
const GONE = { sx: STILL, sy: STILL };

/**
 * De Disclaimer: a compliance officer behind a page of small print in a clear
 * screen. He looks over the top of it, ducks when anything comes his way, and
 * shoves with the whole sheet. What hits the sheet makes it ring; he does not
 * move. On the way home the same sheet is a roll under his arm.
 */
const deDisclaimer: ClipSet = {
  idle: {
    loop: true,
    seconds: 3.6,
    tracks: {
      torso: { sy: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']] },
      // He looks left and right over the edge, then thinks better of it and goes under.
      head: {
        rot: [[0, 0], [0.18, -5, 'sineInOut'], [0.36, 3, 'sineInOut'], [0.5, 0, 'sineInOut'], [1, 0]],
        y: [[0, 0], [0.5, 0, 'hold'], [0.57, 12, 'in'], [0.78, 12, 'hold'], [0.92, -1.5, 'out'], [1, 0, 'inOut']],
      },
      sheet: { rot: [[0, 0], [0.57, 0, 'hold'], [0.62, -1.5, 'out'], [0.8, -1.5, 'hold'], [0.94, 0, 'inOut'], [1, 0]] },
      roll: GONE,
    },
  },

  walk: walk(
    { stride: 44, legSwing: 22, legLen: 38, armSwing: 0, lean: 3, sway: 1, headNod: 1.5 },
    {
      arm_front: { rot: STILL },
      arm_back: { rot: STILL },
      // He carries it just clear of the ground; it comes down with every step.
      sheet: { y: bob(1.6, -2.4) },
      roll: GONE,
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // A shove with the whole sheet: back a little, then forward with his shoulder behind it.
      hips: { x: [[0, 0], [0.24, -3, 'out'], [0.4, 6, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.24, -5, 'out'], [0.4, 8, 'in'], [0.66, 4, 'out'], [1, 0, 'inOut']] },
      head: {
        rot: [[0, 0], [0.24, 4, 'out'], [0.4, -6, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, 0, 'hold'], [0.4, 5, 'in'], [0.7, 5, 'hold'], [1, 0, 'inOut']],
      },
      sheet: {
        x: [[0, 0], [0.24, -3, 'out'], [0.4, 9, 'in'], [0.66, 3, 'out'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, -3, 'out'], [0.4, -1, 'in'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.24, -4, 'out'], [0.4, 3, 'in'], [1, 0, 'inOut']],
      },
      arm_front: { rot: [[0, 0], [0.24, 12, 'out'], [0.4, -34, 'in'], [0.66, -12, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: STILL },
      leg_front: { rot: [[0, 0], [0.24, 5, 'out'], [0.4, -12, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.4, 10, 'in'], [1, 0, 'inOut']] },
      roll: GONE,
    },
  },

  // Ting. Whatever it was, it is covered by clause 14. The sheet rings; he does not flinch.
  hit: {
    loop: false,
    seconds: 0.3,
    tracks: {
      sheet: { x: rattle(3.4, 6), rot: rattle(2.6, 6) },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // The screen stays behind. The small print goes home rolled up under his arm.
      sheet: GONE,
      roll: { rot: [[0, 74]], x: [[0, -26]], y: [[0, -7]] },
      arm_front: { rot: bob(3, 16) },
      arm_back: { rot: swing(-26, -14) },
      head: { rot: bob(4, 10) },
    },
  ),
};

export default deDisclaimer;
