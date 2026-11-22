import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * VR-Vik: sees nothing of the real world through that headset. He shuffles
 * forward with his hands out, feeling for a wall that is not there, looks the
 * wrong way half the time, and throws a haymaker at whatever his game shows him.
 */
const vrVik: ClipSet = {
  idle: idle(
    { seconds: 2.4, breathe: 0.03, armSway: 0 },
    {
      // Something is behind him. No, in front. He guards, jabs twice, and looks round again.
      head: { rot: [[0, 0], [0.16, -16, 'inOut'], [0.4, -16, 'hold'], [0.56, 12, 'inOut'], [0.86, 12, 'hold'], [1, 0, 'inOut']] },
      hips: { y: [[0, 0], [0.5, 1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: [[0, -62], [0.5, -62, 'hold'], [0.58, -100, 'out'], [0.68, -62, 'inOut'], [0.76, -100, 'out'], [0.88, -62, 'inOut'], [1, -62]] },
      arm_back: { rot: [[0, -48], [0.5, -40, 'sineInOut'], [1, -48, 'sineInOut']] },
      tuft: { rot: [[0, 0], [0.2, 10, 'inOut'], [0.44, 0, 'inOut'], [0.6, -9, 'inOut'], [0.9, 0, 'inOut'], [1, 0]] },
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 22, legLen: 38, armSwing: 0, lean: -5, sway: 2, headNod: 0 },
    {
      // Both hands out in front, patting the air.
      arm_front: { rot: swing(9, -84), rate: 2 },
      arm_back: { rot: swing(-9, -68), rate: 2 },
      head: { rot: swing(9) },
      tuft: { rot: swing(8, 0, 0.25), y: bob(1.5) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: {
        x: [[0, 0], [0.26, -4, 'out'], [0.42, 8, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, 2, 'out'], [0.42, -2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.26, -13, 'out'], [0.42, 19, 'in'], [0.7, 9, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 9, 'out'], [0.42, -12, 'in'], [1, 0, 'inOut']] },
      // The haymaker: cocked far back, then all the way through. It ends clear of his own headset.
      arm_front: { rot: [[0, -62], [0.26, 70, 'out'], [0.42, -100, 'in'], [0.6, -122, 'out'], [1, -62, 'inOut']] },
      arm_back: { rot: [[0, -48], [0.26, -95, 'out'], [0.42, 34, 'in'], [1, -48, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 8, 'out'], [0.42, -22, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -6, 'out'], [0.42, 16, 'in'], [1, 0, 'inOut']] },
      tuft: { rot: [[0, 0], [0.26, -14, 'out'], [0.46, 22, 'in'], [0.7, -8, 'out'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    // Where did that come from?
    head: { rot: [[0, 0], [0.3, -18, 'out'], [1, 0, 'inOut']] },
    tuft: { rot: [[0, 0], [0.3, 24, 'out'], [0.65, -8, 'inOut'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 68 },
    {
      // Still in the headset, still feeling his way, now at a run.
      arm_front: { rot: swing(26, -96) },
      arm_back: { rot: swing(-26, -84) },
      torso: { rot: bob(3, 8) },
      head: { rot: bob(5, -14) },
      tuft: { rot: swing(16), y: bob(2) },
    },
  ),
};

export default vrVik;
