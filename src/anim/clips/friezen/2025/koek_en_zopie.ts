import { bob, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

const STEAM: Key[] = [[0, 0.7], [0.5, 1.2, 'sineInOut'], [1, 0.7, 'sineInOut']];

/**
 * Beppe's Koek-en-zopie: stirs her pea soup behind the stall while she waits,
 * and every second someone of hers who stands close gets a ladle of it. She
 * pushes the stall along on its runners, shoves with it when she has to, and
 * whatever is thrown at her lands in the soup with a plop.
 */
const koekEnZopie: ClipSet = {
  idle: idle(
    { seconds: 2.4, breathe: 0.03, armSway: 0 },
    {
      // Stirring: round and round, the ladle never leaves the pan.
      arm_front: { rot: [[0, 0], [0.25, -6, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, 6, 'sineInOut'], [1, 0, 'sineInOut']], x: [[0, 0], [0.25, 1.5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -1.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      ladle: { rot: [[0, 0], [0.25, 8, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -8, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_back: { rot: [[0, 0]] },
      head: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [1, 0, 'sineInOut']], y: [[0, 0], [0.5, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      steam: { sy: STEAM, sx: [[0, 1], [0.5, 0.85, 'sineInOut'], [1, 1, 'sineInOut']], rate: 2 },
    },
  ),

  walk: walk(
    { stride: 42, legSwing: 22, legLen: 38, armSwing: 0, lean: 6, sway: 1.5, headNod: 2 },
    {
      // She pushes the stall; it slides on its runners and the soup sloshes.
      stall: { y: [[0, -1]], rot: swing(0.8) },
      arm_front: { rot: [[0, 0]] },
      arm_back: { rot: [[0, -4]] },
      pot: { rot: swing(3), rate: 2 },
      steam: { sy: STEAM, rot: [[0, -14]], rate: 2 },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.4 },
    tracks: {
      // The whole stall forward into whoever it is, and a swipe of the ladle for good measure.
      hips: { x: [[0, 0], [0.26, -3, 'out'], [0.4, 7, 'in'], [0.62, 4, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -6, 'out'], [0.4, 9, 'in'], [0.62, 5, 'out'], [1, 0, 'inOut']] },
      stall: {
        x: [[0, 0], [0.26, -3, 'out'], [0.4, 8, 'in'], [0.62, 3, 'out'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.26, -3, 'out'], [0.4, 4, 'in'], [0.6, 1, 'out'], [1, 0, 'inOut']],
      },
      arm_front: { rot: [[0, 0], [0.26, 30, 'out'], [0.4, -40, 'in'], [0.62, -20, 'out'], [1, 0, 'inOut']] },
      ladle: { rot: [[0, 0], [0.26, 20, 'out'], [0.4, -50, 'in'], [1, 0, 'inOut']] },
      pot: { y: [[0, 0], [0.4, 0, 'hold'], [0.48, -4, 'out'], [0.6, 0, 'in'], [1, 0]] },
      leg_front: { rot: [[0, 0], [0.26, 5, 'out'], [0.4, -14, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.4, 12, 'in'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, -4, 'out'], [0.4, 6, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Plop. It lands in the soup: the pan jumps, the steam puffs, the stall shudders. She does not feel a thing.
  hit: {
    loop: false,
    seconds: 0.32,
    tracks: {
      stall: { rot: [[0, 0], [0.1, -2.6, 'out'], [0.3, 1.8, 'sineInOut'], [0.55, -1, 'sineInOut'], [1, 0, 'sineInOut']] },
      pot: { y: [[0, 0], [0.12, -6, 'out'], [0.35, 0, 'in'], [0.5, -2, 'out'], [0.65, 0, 'in'], [1, 0]], rot: rattle(6, 3) },
      steam: { sy: [[0, 1], [0.15, 1.6, 'out'], [1, 1, 'inOut']], sx: [[0, 1], [0.15, 1.4, 'out'], [1, 1, 'inOut']] },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 60 },
    {
      // Home, dragging the stall behind her on its runners; the soup stays warm.
      torso: { rot: bob(2, 10) },
      head: { rot: bob(3, 6) },
      arm_back: { rot: swing(3, -30) },
      arm_front: { rot: swing(4, -10) },
      stall: { rot: [[0, -4], [0.5, -2, 'sineInOut'], [1, -4, 'sineInOut']], x: [[0, -4]] },
      steam: { sy: STEAM },
    },
  ),
};

export default koekEnZopie;
