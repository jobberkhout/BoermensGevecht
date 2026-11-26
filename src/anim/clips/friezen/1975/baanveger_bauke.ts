import { bob, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { pop, rattle } from '../../../props.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Baanveger Bauke: leans on his snow scraper puffing his pipe and peers round
 * the board, glides along behind it on his skates pushing the snow ahead of
 * him, and shoves it into whoever is in the way. A shot on the board knocks a
 * bit of snow off; he does not feel a thing. Beaten, he carries the scraper
 * home over his head.
 */
const baanvegerBauke: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.03, armSway: 0 },
    {
      arm_front: { rot: [[0, 0]] },
      arm_back: { rot: [[0, 0]] },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        x: [[0, 0], [0.5, 0, 'hold'], [0.6, 3, 'sineInOut'], [0.85, 3, 'hold'], [0.95, 0, 'sineInOut'], [1, 0, 'hold']],
        rot: [[0, 0], [0.5, 0, 'hold'], [0.6, 8, 'sineInOut'], [0.85, 8, 'hold'], [0.95, 0, 'sineInOut'], [1, 0, 'hold']],
      },
      // Puff, puff.
      smoke: { ...pop(0.05, 0.4, 1), y: [[0, 0], [0.05, 0, 'hold'], [0.4, -10, 'out'], [1, -10, 'hold']] },
      scraper: { rot: [[0, 0], [0.5, -1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 62, legSwing: 26, legLen: 41, armSwing: 0, lean: 8, sway: 2, headNod: 2 },
    {
      // Long gliding strokes on his skates; the board goes ahead of him and scrapes the road.
      arm_front: { rot: [[0, -4]] },
      arm_back: { rot: [[0, -4]] },
      scraper: { y: [[0, 0], [0.25, -1.5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -1.5, 'sineInOut'], [1, 0, 'sineInOut']], rot: swing(1.4) },
      smoke: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      hips: { x: [[0, 0], [0.26, -4, 'out'], [0.4, 7, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -6, 'out'], [0.4, 10, 'in'], [0.62, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 5, 'out'], [0.4, -4, 'in'], [1, 0, 'inOut']] },
      scraper: {
        x: [[0, 0], [0.26, -4, 'out'], [0.4, 9, 'in'], [0.62, 3, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.26, -6, 'out'], [0.4, 8, 'in'], [0.56, 2, 'out'], [1, 0, 'inOut']],
      },
      arm_front: { rot: [[0, 0], [0.26, 8, 'out'], [0.4, -20, 'in'], [0.62, -8, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, 8, 'out'], [0.4, -18, 'in'], [0.62, -6, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 5, 'out'], [0.4, -16, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.4, 14, 'in'], [1, 0, 'inOut']] },
      smoke: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  },

  // Ting. The board shudders and that is that; his pipe does not even go out.
  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      scraper: { rot: rattle(3, 4), x: [[0, 0], [0.12, -2.4, 'out'], [0.4, 1, 'sineInOut'], [1, 0, 'sineInOut']] },
      head: { rot: [[0, 0], [0.2, -3, 'out'], [1, 0, 'inOut']] },
    },
  },

  die: slinkOff(
    { legLen: 41, stride: 66 },
    {
      // The scraper goes home over his head, like a roof.
      torso: { rot: bob(2, 9) },
      head: { rot: bob(3, 6), y: [[0, 4]] },
      arm_front: { rot: swing(3, -150) },
      arm_back: { rot: swing(-3, -140) },
      scraper: { rot: swing(2.5, -78), x: [[0, -14]], y: bob(2, -28) },
      smoke: { sx: [[0, 0]], sy: [[0, 0]] },
    },
  ),
};

export default baanvegerBauke;
