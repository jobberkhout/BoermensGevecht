import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The envelope is gone from his hand at the throw; he has the next one out of the satchel for the one after. */
const GONE_THEN_BACK: Key[] = [[0, 1], [0.4, 0, 'hold'], [0.84, 0, 'hold'], [1, 1, 'backOut']];

/**
 * De Tolk: ten years old and the family's translator. Waiting, he holds the
 * letter up and reads it carefully, then turns round to explain it (a little
 * more kindly than it was written). He walks briskly with the satchel
 * bouncing, and throws the envelopes back with a flick, like a card.
 */
const deTolk: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.035, armSway: 1.5 },
    {
      // Up to his eyes: read, read, read...
      arm_front: { rot: [[0, 0], [0.12, -38, 'inOut'], [0.5, -38, 'hold'], [0.62, 0, 'inOut'], [1, 0, 'hold']] },
      prop: { rot: [[0, 0], [0.12, 26, 'inOut'], [0.5, 26, 'hold'], [0.62, 0, 'inOut'], [1, 0, 'hold']] },
      // ...and then turn round and tell it, nodding.
      head: {
        y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.12, 8, 'inOut'], [0.2, 10, 'sineInOut'], [0.3, 8, 'sineInOut'], [0.4, 10, 'sineInOut'], [0.5, 8, 'sineInOut'], [0.62, -12, 'inOut'], [0.7, -8, 'sineInOut'], [0.78, -12, 'sineInOut'], [0.86, -8, 'sineInOut'], [1, 0, 'inOut']],
      },
      arm_back: { rot: [[0, 0], [0.62, 0, 'hold'], [0.7, -24, 'out'], [0.86, -18, 'sineInOut'], [1, 0, 'inOut']] },
      satchel: { rot: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 38, legSwing: 26, legLen: 30, armSwing: 26, lean: 5, sway: 3, headNod: 3 },
    {
      arm_front: { rot: swing(10, -6) },
      prop: { rot: swing(5) },
      satchel: { y: bob(1.6), rot: swing(5) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      hips: {
        x: [[0, 0], [0.26, -3, 'out'], [0.4, 5, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.26, -12, 'out'], [0.4, 12, 'in'], [0.7, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 8, 'out'], [0.4, -6, 'in'], [1, 0, 'inOut']] },
      // A flick: the hand goes back across his chest and snaps open towards the enemy.
      arm_front: { rot: [[0, 0], [0.26, 30, 'out'], [0.4, -70, 'in'], [0.6, -50, 'out'], [1, 0, 'inOut']] },
      prop: { rot: [[0, 0], [0.26, 40, 'out'], [0.4, -20, 'in'], [1, 0, 'inOut']], sx: GONE_THEN_BACK, sy: GONE_THEN_BACK },
      arm_back: { rot: [[0, 0], [0.26, -30, 'out'], [0.4, 30, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.4, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -5, 'out'], [0.4, 12, 'in'], [1, 0, 'inOut']] },
      satchel: { rot: [[0, 0], [0.26, -6, 'out'], [0.42, 9, 'in'], [0.62, -3, 'out'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    satchel: { rot: [[0, 0], [0.3, -10, 'out'], [0.65, 4, 'inOut'], [1, 0, 'inOut']] },
    prop: { rot: [[0, 0], [0.3, -18, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 30, stride: 54 },
    {
      satchel: { y: bob(2.5), rot: swing(10) },
      // The letter clutched to his chest: he will finish it at home.
      arm_front: { rot: swing(10, -40) },
      prop: { rot: swing(6, 30) },
      head: { rot: bob(4, 14) },
    },
  ),
};

export default deTolk;
