import { flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { pop } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** The flash stays out of sight, except in the attack. */
const DARK: Key[] = [[0, 0]];

/**
 * Flitsblokje-Fien: a lady on her first trip abroad. Now and then she lifts
 * the camera, thinks better of it and lowers it again. To fight she takes a
 * picture of you, flash and all, and while you blink she tosses the spent
 * cube at you, underhand, as politely as she can.
 */
const flitsblokjeFien: ClipSet = {
  idle: idle(
    { seconds: 4, breathe: 0.03, armSway: 2 },
    {
      // Is that a windmill? Camera halfway up... no.
      arm_front: { rot: [[0, 0], [0.38, 0, 'hold'], [0.48, -42, 'sineInOut'], [0.66, -42, 'hold'], [0.76, 0, 'sineInOut'], [1, 0, 'hold']] },
      camera: { rot: [[0, 0], [0.38, 0, 'hold'], [0.48, 40, 'sineInOut'], [0.66, 40, 'hold'], [0.76, 0, 'sineInOut'], [1, 0, 'hold']] },
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        rot: [[0, 0], [0.38, 0, 'hold'], [0.48, -8, 'sineInOut'], [0.66, -8, 'hold'], [0.76, 4, 'sineInOut'], [0.9, 0, 'sineInOut'], [1, 0, 'hold']],
      },
      cube: { rot: swing(8) },
      flash: { sx: DARK, sy: DARK },
    },
  ),

  walk: walk(
    { stride: 40, legSwing: 22, legLen: 38, armSwing: 16, lean: 3, sway: 2, headNod: 2 },
    {
      // The camera is held steady against her chest; the far hand swings with the cube.
      arm_front: { rot: swing(3, -2) },
      camera: { rot: swing(-3, 2) },
      cube: { rot: swing(10) },
      flash: { sx: DARK, sy: DARK },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.46 },
    tracks: {
      // Camera up to her eye...
      arm_front: {
        rot: [[0, 0], [0.16, -100, 'out'], [0.32, -100, 'hold'], [0.6, -20, 'inOut'], [1, 0, 'inOut']],
        y: [[0, 0], [0.16, -5, 'out'], [0.32, -5, 'hold'], [0.6, 0, 'inOut'], [1, 0]],
      },
      camera: { rot: [[0, 0], [0.16, 100, 'out'], [0.32, 100, 'hold'], [0.6, 20, 'inOut'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.16, 6, 'out'], [0.22, -6, 'out'], [0.32, 4, 'inOut'], [0.6, -4, 'inOut'], [1, 0, 'inOut']] },
      // ...flash!
      flash: pop(0.18, 0.32, 2.1),
      // ...and the spent cube, tossed underhand.
      arm_back: { rot: [[0, 0], [0.32, 48, 'out'], [0.46, -78, 'in'], [0.6, -88, 'out'], [1, 0, 'inOut']] },
      cube: {
        rot: [[0, 0], [0.32, 20, 'out'], [0.46, -30, 'in'], [1, 0]],
        sx: [[0, 1], [0.46, 0, 'hold'], [0.84, 0, 'hold'], [1, 1, 'backOut']],
        sy: [[0, 1], [0.46, 0, 'hold'], [0.84, 0, 'hold'], [1, 1, 'backOut']],
      },
      torso: { rot: [[0, 0], [0.16, -4, 'out'], [0.32, -6, 'inOut'], [0.46, 6, 'in'], [0.7, 2, 'out'], [1, 0, 'inOut']] },
      hips: { x: [[0, 0], [0.32, -2, 'out'], [0.46, 3, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.32, 4, 'out'], [0.46, -10, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.32, -3, 'out'], [0.46, 8, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    camera: { rot: [[0, 0], [0.3, -18, 'out'], [1, 0, 'inOut']] },
    cube: { rot: [[0, 0], [0.3, 20, 'out'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 58 },
    {
      // Off to the bus, the camera clutched to her chest; no cubes left.
      arm_front: { rot: swing(4, -6) },
      camera: { rot: swing(-4, 6) },
      cube: { sx: DARK, sy: DARK },
      flash: { sx: DARK, sy: DARK },
    },
  ),
};

export default flitsblokjeFien;
