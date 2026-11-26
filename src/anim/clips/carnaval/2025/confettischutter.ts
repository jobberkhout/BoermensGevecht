import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The serpentine dangles from the rim and sways with whatever he does. */
const DANGLE: Key[] = [[0, -6], [0.5, 8, 'sineInOut'], [1, -6, 'sineInOut']];

/**
 * De Confettischutter: goggles on against the confetti, a cannon under his arm.
 * He bobs to music only he can hear and pumps a fist now and then. When he
 * fires, the twist at the back goes, the tube kicks up and back into his side,
 * and he rocks back on his heels; the serpentine on the rim whips about.
 */
const confettischutter: ClipSet = {
  idle: idle(
    { seconds: 2.4, breathe: 0.03, armSway: 0 },
    {
      // Bobbing to the beat from the tent.
      hips: { y: [[0, 0], [0.25, 1.6, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 1.6, 'sineInOut'], [1, 0, 'sineInOut']] },
      head: { rot: [[0, 0], [0.25, 5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 5, 'sineInOut'], [1, 0, 'sineInOut']] },
      // A fist in the air on the off-beat: Alaaf.
      arm_back: { rot: [[0, 0], [0.5, 0, 'hold'], [0.62, -150, 'out'], [0.78, -140, 'sineInOut'], [0.92, 0, 'inOut'], [1, 0]] },
      arm_front: { rot: [[0, 0], [0.5, 2, 'sineInOut'], [1, 0, 'sineInOut']] },
      cannon: { rot: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
      streamer: { rot: DANGLE },
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 24, legLen: 38, armSwing: 14, lean: 3, sway: 2, headNod: 3 },
    {
      // The cannon arm stays clamped; the barrel bobs with his steps.
      arm_front: { rot: swing(3) },
      cannon: { rot: swing(3, 0, 0.25) },
      streamer: { rot: swing(12, 4), rate: 2 },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      // Aim, twist, and the kick: the tube jumps up and back into his side, he rocks back on his heels.
      hips: { x: [[0, 0], [0.3, 1, 'out'], [0.42, 1, 'hold'], [0.5, -6, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.3, 4, 'out'], [0.42, 4, 'hold'], [0.5, -10, 'out'], [0.75, -3, 'inOut'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.3, 4, 'out'], [0.42, 4, 'hold'], [0.5, -10, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.3, -6, 'out'], [0.42, -6, 'hold'], [0.5, 8, 'out'], [1, 0, 'inOut']] },
      cannon: {
        rot: [[0, 0], [0.3, 2, 'out'], [0.42, 2, 'hold'], [0.5, -20, 'out'], [0.75, -6, 'inOut'], [1, 0, 'inOut']],
        x: [[0, 0], [0.42, 0, 'hold'], [0.5, -5, 'out'], [1, 0, 'inOut']],
      },
      arm_back: { rot: [[0, 0], [0.3, -14, 'out'], [0.5, 20, 'out'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.42, 0, 'hold'], [0.5, 8, 'out'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.42, 0, 'hold'], [0.5, -6, 'out'], [1, 0, 'inOut']] },
      streamer: { rot: [[0, 0], [0.42, 0, 'hold'], [0.5, -70, 'out'], [0.7, 30, 'inOut'], [0.85, -12, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    cannon: { rot: rattle(8, 3) },
    streamer: { rot: rattle(24, 3) },
  }),

  die: slinkOff(
    { legLen: 38, stride: 64 },
    {
      // Home with the empty tube dragging, goggles fogged, the serpentine trailing.
      arm_front: { rot: swing(5, 6) },
      cannon: { rot: [[0, 30]] },
      streamer: { rot: swing(16, 10), rate: 2 },
      arm_back: { rot: swing(-30, -20) },
    },
  ),
};

export default confettischutter;
