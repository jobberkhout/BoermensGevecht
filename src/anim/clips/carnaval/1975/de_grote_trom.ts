import { bob, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** Two booms to the loop: back with the beater, and into the drum. */
const BEAT: Key[] = [
  [0, 0], [0.12, -28, 'out'], [0.2, 14, 'in'], [0.32, 0, 'inOut'],
  [0.5, 0, 'hold'], [0.62, -28, 'out'], [0.7, 14, 'in'], [0.82, 0, 'inOut'], [1, 0, 'hold'],
];

/** The drum swells for a moment with every boom. */
const SWELL: Key[] = [
  [0, 1], [0.2, 1, 'hold'], [0.24, 1.04, 'out'], [0.36, 1, 'inOut'],
  [0.7, 1, 'hold'], [0.74, 1.04, 'out'], [0.86, 1, 'inOut'], [1, 1, 'hold'],
];

/** And he nods along: that one was good. */
const NOD: Key[] = [
  [0, 0], [0.2, 0, 'hold'], [0.28, 6, 'out'], [0.42, 0, 'inOut'],
  [0.7, 0, 'hold'], [0.78, 6, 'out'], [0.92, 0, 'inOut'], [1, 0, 'hold'],
];

/**
 * De Grote Trom: the bass drummer of the hofkapel. He stands behind his drum
 * keeping time, boom, boom, eyes shut; he marches in step with a boom on every
 * other foot, and he attacks by shoving the drum into the enemy with a boom to
 * go with it. A shot off the drum is one more boom, in time: the drum shudders,
 * he swings the beater into it, and nods. Beaten, the drum sags and the beater
 * hangs.
 */
const deGroteTrom: ClipSet = {
  idle: {
    loop: true,
    seconds: 2,
    tracks: {
      beater: { rot: BEAT },
      drum: { sx: SWELL, sy: SWELL },
      head: { rot: NOD, y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']] },
      torso: { sy: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']] },
      arm_front: { rot: [[0, 0], [0.12, -4, 'out'], [0.2, 3, 'in'], [0.32, 0, 'inOut'], [0.5, 0, 'hold'], [0.62, -4, 'out'], [0.7, 3, 'in'], [0.82, 0, 'inOut'], [1, 0, 'hold']] },
    },
  },

  walk: walk(
    { stride: 48, legSwing: 22, legLen: 42, armSwing: 0, lean: 0, sway: 1, headNod: 2 },
    {
      // In step, the drum carried level, a boom on every left foot.
      arm_front: { rot: [[0, 0]] },
      arm_back: { rot: [[0, 0]] },
      beater: { rot: BEAT },
      drum: { sx: SWELL, sy: SWELL, y: bob(1.2) },
      head: { rot: NOD },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // He draws the drum in, then shoves it into them, with a boom on top.
      hips: { x: [[0, 0], [0.26, -4, 'out'], [0.4, 8, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -6, 'out'], [0.4, 9, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 4, 'out'], [0.4, -2, 'in'], [0.55, 6, 'out'], [1, 0, 'inOut']] },
      drum: {
        x: [[0, 0], [0.26, -4, 'out'], [0.4, 10, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.26, -4, 'out'], [0.4, 5, 'in'], [0.6, 1, 'out'], [1, 0, 'inOut']],
        sx: [[0, 1], [0.4, 1, 'hold'], [0.45, 1.06, 'out'], [0.6, 1, 'inOut'], [1, 1, 'hold']],
        sy: [[0, 1], [0.4, 1, 'hold'], [0.45, 1.06, 'out'], [0.6, 1, 'inOut'], [1, 1, 'hold']],
      },
      beater: { rot: [[0, 0], [0.26, -40, 'out'], [0.4, 16, 'in'], [0.6, 4, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.4, -12, 'in'], [0.62, -4, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 5, 'out'], [0.4, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.4, 12, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Boom. One more, in time. The drum shudders, the beater goes in, and he nods: good one.
  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      drum: {
        x: [[0, 0], [0.12, -2, 'out'], [0.36, 0.8, 'sineInOut'], [1, 0, 'sineInOut']],
        sx: [[0, 1], [0.14, 1.06, 'out'], [0.34, 0.97, 'sineInOut'], [0.56, 1.02, 'sineInOut'], [1, 1, 'sineInOut']],
        sy: [[0, 1], [0.14, 1.06, 'out'], [0.34, 0.97, 'sineInOut'], [0.56, 1.02, 'sineInOut'], [1, 1, 'sineInOut']],
      },
      beater: { rot: [[0, 0], [0.18, -26, 'out'], [0.42, 14, 'in'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.4, 0, 'hold'], [0.6, 7, 'out'], [1, 0, 'inOut']] },
    },
  },

  die: slinkOff(
    { legLen: 42, stride: 60 },
    {
      // The drum sags against his knees, the beater hangs from his hand.
      torso: { rot: bob(2, 8) },
      head: { rot: bob(3, 16), y: [[0, 2]] },
      arm_front: { rot: swing(3, 4) },
      arm_back: { rot: [[0, 0]] },
      beater: { rot: swing(6, 110) },
      drum: { rot: swing(2, 6), y: [[0, 4]] },
    },
  ),
};

export default deGroteTrom;
