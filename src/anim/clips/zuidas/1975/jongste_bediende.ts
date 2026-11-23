import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { pop } from '../../../props.ts';
import type { ClipSet, Track } from '../../../types.ts';

/** The twinkle on her pass only shows when she looks at it. */
const NO_TWINKLE: Track = { sx: [[0, 0]], sy: [[0, 0]] };

/**
 * De jongste bediende: sixteen, in a suit bought to grow into. Standing still
 * she keeps checking that her new floor pass is still there (it is, and it
 * shines). She trots along with her beursboekje at the ready, and to hit she
 * winds her whole arm round like a windmill and swats with the book.
 */
const jongsteBediende: ClipSet = {
  idle: idle(
    { seconds: 3, breathe: 0.03, armSway: 0 },
    {
      // A look down at the pass, then chin up again, a little taller than before.
      head: {
        rot: [[0, 0], [0.2, 0, 'hold'], [0.31, 17, 'inOut'], [0.58, 17, 'hold'], [0.7, -6, 'inOut'], [0.88, -6, 'hold'], [1, 0, 'inOut']],
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
      },
      ponytail: { rot: [[0, 0], [0.2, 0, 'hold'], [0.33, -12, 'out'], [0.48, 4, 'sineInOut'], [0.6, 0, 'sineInOut'], [0.72, 12, 'out'], [0.86, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      pass: { rot: [[0, 0], [0.3, 0, 'hold'], [0.37, -10, 'out'], [0.47, 6, 'sineInOut'], [0.56, -3, 'sineInOut'], [0.64, 0, 'sineInOut'], [1, 0]] },
      twinkle: { ...pop(0.36, 0.62), rot: [[0, -20], [0.36, -20, 'hold'], [0.62, 70, 'out'], [1, 70, 'hold']] },
      hips: { y: [[0, 0], [0.66, 0, 'hold'], [0.72, -2.5, 'out'], [0.88, -2.5, 'hold'], [1, 0, 'inOut']] },
      // The far sleeve slides down over her hand again; she shakes it back.
      arm_back: { rot: [[0, 0], [0.7, 0, 'hold'], [0.76, -16, 'out'], [0.82, 6, 'inOut'], [0.88, -8, 'inOut'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.5, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
      boekje: { rot: [[0, 0], [0.5, -5, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 42, legSwing: 25, legLen: 38, armSwing: 30, armRest: 4, lean: 5, sway: 2.5, headNod: 3 },
    {
      // The book stays in front of her; everything that is too big for her flaps.
      arm_front: { rot: bob(4, -3) },
      forearm: { rot: bob(-6) },
      boekje: { rot: bob(7) },
      ponytail: { rot: swing(14, 6, 0.9) },
      pass: { rot: swing(12, 0, 0.1) },
      twinkle: NO_TWINKLE,
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: {
        x: [[0, 0], [0.26, -3, 'out'], [0.45, 5, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, 2, 'out'], [0.45, -5, 'in'], [0.62, 0, 'in'], [1, 0]],
      },
      torso: { rot: [[0, 0], [0.26, -8, 'out'], [0.45, 10, 'in'], [0.62, 5, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 6, 'out'], [0.45, -6, 'in'], [1, 0, 'inOut']] },
      ponytail: { rot: [[0, 0], [0.26, -14, 'out'], [0.5, 24, 'in'], [0.75, -8, 'out'], [1, 0, 'inOut']] },
      pass: { rot: [[0, 0], [0.26, 12, 'out'], [0.47, -26, 'in'], [0.7, 12, 'inOut'], [1, 0, 'inOut']] },
      twinkle: NO_TWINKLE,
      // Once round like a windmill: back, up, over the top and down on whoever is in front.
      arm_front: { rot: [[0, 0], [0.26, 173, 'out'], [0.45, 280, 'in'], [0.62, 315, 'out'], [1, 360, 'inOut']] },
      forearm: { rot: [[0, 0], [0.26, 70, 'out'], [0.45, 45, 'inOut'], [0.62, 55, 'out'], [1, 0, 'inOut']] },
      boekje: { rot: [[0, 0], [0.26, 60, 'out'], [0.45, 120, 'in'], [0.62, 125, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, -24, 'out'], [0.45, 30, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.45, -16, 'in'], [0.62, 0, 'in'], [1, 0]] },
      leg_back: { rot: [[0, 0], [0.26, -5, 'out'], [0.45, 14, 'in'], [0.62, 0, 'in'], [1, 0]] },
    },
  },

  hit: flinch({
    ponytail: { rot: [[0, 0], [0.3, -18, 'out'], [0.65, 8, 'inOut'], [1, 0, 'inOut']] },
    pass: { rot: [[0, 0], [0.3, 20, 'out'], [0.65, -8, 'inOut'], [1, 0, 'inOut']] },
    boekje: { rot: [[0, 0], [0.3, -16, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 62 },
    {
      // Home, with the book clutched to her and the empty sleeve flapping behind.
      arm_front: { rot: bob(5, 8) },
      forearm: { rot: bob(-8, -26) },
      boekje: { rot: bob(6, -8) },
      arm_back: { rot: swing(-34, 30) },
      ponytail: { rot: bob(10, 34) },
      pass: { rot: swing(16, 20) },
      twinkle: NO_TWINKLE,
    },
  ),
};

export default jongsteBediende;
