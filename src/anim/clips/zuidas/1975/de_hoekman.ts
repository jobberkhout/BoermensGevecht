import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** Taking aim: the forearm pumps back and forth three times, the way a darts player does. */
const AIM: Key[] = [
  [0, 0],
  [0.1, -11, 'sineInOut'],
  [0.2, 2, 'sineInOut'],
  [0.3, -11, 'sineInOut'],
  [0.4, 2, 'sineInOut'],
  [0.5, -11, 'sineInOut'],
  [0.62, 0, 'sineInOut'],
  [1, 0, 'hold'],
];

/** The pencil stays level while the forearm under it moves. */
const level = (keys: readonly Key[], share = 0.8): Key[] => keys.map((k): Key => [k[0], -k[1] * share, k[2]]);

/**
 * De hoekman. He stands in his corner with one hand in his pocket and makes
 * the price: he takes aim over his half-moon glasses like a darts player,
 * little finger out, and lets the pencil go with a flick of the wrist. The
 * next one comes out of his inside pocket. He never takes the other hand out
 * of his pocket, not even when he has to leave.
 */
const deHoekman: ClipSet = {
  idle: idle(
    { seconds: 3.4, breathe: 0.035, armSway: 0 },
    {
      // Rocking on his heels.
      torso: { rot: swing(1.6), sy: [[0, 1], [0.5, 1.035, 'sineInOut'], [1, 1, 'sineInOut']] },
      head: { rot: [[0, 0], [0.3, 4, 'sineInOut'], [0.62, 4, 'hold'], [0.8, -3, 'sineInOut'], [1, 0, 'sineInOut']], y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']] },
      throw: { rot: AIM },
      prop: { rot: level(AIM) },
      arm_back: { rot: [[0, 0], [0.5, -2, 'sineInOut'], [1, 0, 'sineInOut']] },
      arm_front: { rot: [[0, 0]] },
      chain: { rot: swing(5) },
    },
  ),

  walk: walk(
    { stride: 38, legSwing: 19, legLen: 38, armSwing: 0, lean: -3, sway: 3.5, headNod: 2 },
    {
      // A stately waddle. The pencil stays up, the hand stays in the pocket.
      arm_front: { rot: bob(2) },
      arm_back: { rot: bob(-3) },
      throw: { rot: bob(-5) },
      prop: { rot: bob(4) },
      chain: { rot: swing(15, 4, 0.15) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.42 },
    tracks: {
      hips: { x: [[0, 0], [0.28, -2, 'out'], [0.42, 4, 'in'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.28, -5, 'out'], [0.42, 7, 'in'], [0.7, 2, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.28, 4, 'out'], [0.42, -5, 'in'], [1, 0, 'inOut']] },
      // Back to his ear, a flick, and then into his inside pocket for the next pencil.
      arm_back: { rot: [[0, 0], [0.28, -7, 'out'], [0.42, -15, 'in'], [0.52, -12, 'out'], [0.68, 75, 'inOut'], [0.8, 75, 'hold'], [1, 0, 'inOut']] },
      throw: { rot: [[0, 0], [0.28, -42, 'out'], [0.42, 50, 'in'], [0.52, 44, 'out'], [0.68, -77, 'inOut'], [0.8, -77, 'hold'], [1, 0, 'inOut']] },
      prop: {
        rot: [[0, 0], [0.28, 24, 'out'], [0.42, -46, 'in'], [0.68, 90, 'hold'], [0.8, 90, 'hold'], [1, 0, 'inOut']],
        sx: [[0, 1], [0.42, 0, 'hold'], [0.72, 0, 'hold'], [0.74, 1, 'hold'], [1, 1]],
        sy: [[0, 1], [0.42, 0, 'hold'], [0.72, 0, 'hold'], [0.74, 1, 'hold'], [1, 1]],
      },
      chain: { rot: [[0, 0], [0.28, 10, 'out'], [0.45, -22, 'in'], [0.62, 12, 'inOut'], [0.8, -5, 'inOut'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.28, 3, 'out'], [0.42, -9, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.28, -2, 'out'], [0.42, 7, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    // The hand stays in the pocket.
    arm_front: { rot: [[0, 0], [0.3, -5, 'out'], [1, 0, 'inOut']] },
    arm_back: { rot: [[0, 0], [0.3, -12, 'out'], [1, 0, 'inOut']] },
    throw: { rot: [[0, 0], [0.3, -18, 'out'], [1, 0, 'inOut']] },
    chain: { rot: rattle(22, 3) },
  }),

  die: slinkOff(
    { legLen: 38, stride: 52 },
    {
      // He leaves at a trot with his dignity and his pocket hand intact. The pencil stays behind.
      torso: { rot: bob(3, 9) },
      head: { rot: bob(4, 4) },
      arm_front: { rot: bob(3, 3) },
      arm_back: { rot: swing(10, 62) },
      throw: { rot: swing(14, 44) },
      prop: { sx: [[0, 0]], sy: [[0, 0]] },
      chain: { rot: swing(24, 10) },
    },
  ),
};

export default deHoekman;
