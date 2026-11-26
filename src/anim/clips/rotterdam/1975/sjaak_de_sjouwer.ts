import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The front sack leaves his arms at the throw; by the end he has hoisted the next one. */
const GONE_THEN_BACK: Key[] = [[0, 1], [0.45, 1, 'hold'], [0.46, 0, 'hold'], [0.84, 0, 'hold'], [1, 1, 'backOut']];

/**
 * Sjaak de Sjouwer: hitches his two sacks up while he waits, trudges along
 * under them, and throws: down into his knees, then the front sack heaved up
 * off his shoulder and out over the top with both his weight and a grunt.
 */
const sjaakDeSjouwer: ClipSet = {
  idle: idle(
    { seconds: 2.8, breathe: 0.04, armSway: 0 },
    {
      // Every so often he bounces both sacks up into place again.
      hips: { y: [[0, 0], [0.56, 0, 'hold'], [0.62, 3, 'out'], [0.7, -1.5, 'out'], [0.78, 0, 'inOut'], [1, 0, 'hold']] },
      sack_back: { rot: [[0, 0], [0.62, 0, 'hold'], [0.68, -4, 'out'], [0.78, 2, 'inOut'], [0.88, 0, 'inOut'], [1, 0, 'hold']] },
      arm_front: { rot: [[0, 0], [0.62, 0, 'hold'], [0.68, -6, 'out'], [0.78, 2, 'inOut'], [0.88, 0, 'inOut'], [1, 0, 'hold']] },
      arm_back: { rot: [[0, 0], [0.62, 0, 'hold'], [0.68, 4, 'out'], [0.8, 0, 'inOut'], [1, 0, 'hold']] },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.3, 3, 'sineInOut'], [0.6, 0, 'sineInOut'], [1, 0, 'hold']],
      },
    },
  ),

  walk: walk(
    { stride: 42, legSwing: 22, legLen: 38, armSwing: 0, lean: 6, sway: 2, headNod: 2 },
    {
      // Heavy steps: the sacks lag behind each one.
      arm_front: { rot: swing(4, 0) },
      arm_back: { rot: swing(-3, 0) },
      sack_back: { rot: swing(4, 0, 0.15), y: bob(1.5) },
      sack_front: { rot: swing(3, 0, 0.15) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: {
        x: [[0, 0], [0.28, -4, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.28, 4, 'out'], [0.45, -2, 'in'], [0.6, 0, 'out'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.28, -14, 'out'], [0.45, 18, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, 8, 'out'], [0.45, -10, 'in'], [1, 0, 'inOut']] },
      // The sack comes up off his shoulder and goes over the top.
      arm_front: { rot: [[0, 0], [0.28, 14, 'out'], [0.45, -130, 'in'], [0.62, -100, 'out'], [0.84, -20, 'inOut'], [1, 0, 'inOut']] },
      sack_front: { sx: GONE_THEN_BACK, sy: GONE_THEN_BACK },
      sack_back: { rot: [[0, 0], [0.28, -6, 'out'], [0.45, 10, 'in'], [0.62, -4, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 8, 'out'], [0.45, -16, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -6, 'out'], [0.45, 12, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    // His arms stay on the sacks; the sacks wobble.
    arm_front: { rot: [[0, 0], [0.3, -8, 'out'], [1, 0, 'inOut']] },
    arm_back: { rot: [[0, 0], [0.3, 6, 'out'], [1, 0, 'inOut']] },
    sack_back: { rot: [[0, 0], [0.3, -10, 'out'], [0.65, 4, 'inOut'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 60 },
    {
      // He goes home with the one sack he has left still on his back, the front one dropped.
      arm_front: { rot: swing(26, 10) },
      arm_back: { rot: [[0, 0]] },
      sack_front: { sx: [[0, 0]], sy: [[0, 0]] },
      sack_back: { rot: swing(6, 4) },
    },
  ),
};

export default sjaakDeSjouwer;
