import { flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The ball is gone from his palm at the serve; he has the next one ready by the end. */
const GONE_THEN_BACK: Key[] = [[0, 1], [0.45, 0, 'hold'], [0.85, 0, 'hold'], [1, 1, 'backOut']];

/**
 * De Opslagger: bounces the ball on his palm and stamps his feet against the
 * cold, walks in his whites under a coat he will not take off, and serves the
 * way kaatsers do: a long swing from behind and the flat of the hand right
 * through the ball.
 */
const opslagger: ClipSet = {
  idle: idle(
    { seconds: 2.6, breathe: 0.03, armSway: 1.5 },
    {
      // Up off the palm, and caught again.
      ball: { y: [[0, 0], [0.12, -16, 'out'], [0.24, 0, 'in'], [0.4, -12, 'out'], [0.52, 0, 'in'], [1, 0, 'hold']] },
      arm_front: { rot: [[0, -14], [0.12, -20, 'out'], [0.24, -14, 'in'], [0.4, -19, 'out'], [0.52, -14, 'in'], [1, -14, 'hold']] },
      // Then the feet: cold.
      leg_back: { rot: [[0, 0], [0.62, 0, 'hold'], [0.68, 10, 'out'], [0.74, 0, 'in'], [1, 0, 'hold']] },
      leg_front: { rot: [[0, 0], [0.74, 0, 'hold'], [0.8, -10, 'out'], [0.86, 0, 'in'], [1, 0, 'hold']] },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.12, -8, 'out'], [0.24, 0, 'in'], [0.4, -6, 'out'], [0.52, 0, 'in'], [1, 0, 'hold']],
      },
    },
  ),

  walk: walk(
    { stride: 44, legSwing: 24, legLen: 38, armSwing: 18, lean: 4, sway: 2, headNod: 2.5 },
    {
      arm_front: { rot: swing(6, -12) },
      ball: { y: [[0, 0], [0.25, -3, 'sineOut'], [0.5, 0, 'sineIn'], [0.75, -3, 'sineOut'], [1, 0, 'sineIn']] },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: {
        x: [[0, 0], [0.28, -5, 'out'], [0.45, 6, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.28, 2, 'out'], [0.45, -1, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.28, -8, 'out'], [0.45, 16, 'in'], [0.7, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, 4, 'out'], [0.45, -10, 'in'], [1, 0, 'inOut']] },
      // The long swing: back behind him, and through underneath to the front.
      arm_front: { rot: [[0, -14], [0.28, 60, 'out'], [0.45, -95, 'in'], [0.64, -120, 'out'], [1, -14, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.28, -40, 'out'], [0.45, 30, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 4, 'out'], [0.45, -20, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -6, 'out'], [0.45, 16, 'in'], [1, 0, 'inOut']] },
      ball: { sx: GONE_THEN_BACK, sy: GONE_THEN_BACK },
    },
  },

  hit: flinch({
    ball: { rot: [[0, 0], [0.3, -20, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 60 },
    {
      // Coat pulled tight, hands under his arms.
      arm_front: { rot: swing(6, -40) },
      arm_back: { rot: swing(-6, -30) },
      ball: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  ),
};

export default opslagger;
