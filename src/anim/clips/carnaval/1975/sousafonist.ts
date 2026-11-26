import { bob, flinch, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** Oom-pah: the cheek blows up on the first beat and on the third, and goes down in between. */
const OOMPAH: Key[] = [
  [0, 1], [0.08, 1.22, 'out'], [0.22, 1, 'in'],
  [0.5, 1, 'hold'], [0.58, 1.22, 'out'], [0.72, 1, 'in'], [1, 1, 'hold'],
];

/** The bell nods on every note. */
const BELL: Key[] = [
  [0, 0], [0.08, -2, 'out'], [0.25, 0, 'inOut'],
  [0.5, 0, 'hold'], [0.58, -2, 'out'], [0.75, 0, 'inOut'], [1, 0, 'hold'],
];

/**
 * De Sousafonist: plays oom-pah on the spot, cheek and bell going in time and
 * a foot tapping; marches with the bell bobbing over his head. To attack he
 * takes a breath that blows his cheek up like a ball, and lets it go: the bell
 * jerks up as the note leaves it. Beaten, the bell droops on the way home.
 */
const sousafonist: ClipSet = {
  idle: {
    loop: true,
    seconds: 1.4,
    tracks: {
      cheek: { sx: OOMPAH, sy: OOMPAH },
      horn: { rot: BELL },
      torso: { rot: [[0, 0], [0.25, 2, 'sineInOut'], [0.75, -2, 'sineInOut'], [1, 0, 'sineInOut']], sy: [[0, 1], [0.5, 1.02, 'sineInOut'], [1, 1, 'sineInOut']] },
      head: { rot: [[0, 0], [0.08, -3, 'out'], [0.25, 0, 'inOut'], [0.5, 0, 'hold'], [0.58, -3, 'out'], [0.75, 0, 'inOut'], [1, 0, 'hold']] },
      leg_front: { rot: [[0, 0], [0.04, -9, 'out'], [0.14, 0, 'in'], [0.5, 0, 'hold'], [0.54, -9, 'out'], [0.64, 0, 'in'], [1, 0, 'hold']] },
      arm_back: { rot: [[0, 0], [0.5, -3, 'sineInOut'], [1, 0, 'sineInOut']] },
    },
  },

  walk: walk(
    { stride: 46, legSwing: 24, legLen: 38, armSwing: 18, lean: 2, sway: 1.5, headNod: 2 },
    {
      // The hand stays on the valves; the sousaphone bobs along and he keeps playing.
      arm_front: { rot: [[0, 0]] },
      horn: { rot: [[0, 0], [0.25, -2.5, 'sineInOut'], [0.5, 0, 'sineInOut'], [0.75, -2.5, 'sineInOut'], [1, 0, 'sineInOut']] },
      cheek: { sx: OOMPAH, sy: OOMPAH },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // A huge breath, leaning back to take it in...
      torso: { rot: [[0, 0], [0.34, -7, 'out'], [0.45, 6, 'in'], [0.7, 2, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.34, -5, 'out'], [0.45, 4, 'in'], [1, 0, 'inOut']] },
      cheek: {
        sx: [[0, 1], [0.38, 1.65, 'out'], [0.45, 1.5, 'in'], [0.56, 0.8, 'out'], [0.8, 1, 'inOut'], [1, 1, 'hold']],
        sy: [[0, 1], [0.38, 1.6, 'out'], [0.45, 1.45, 'in'], [0.56, 0.8, 'out'], [0.8, 1, 'inOut'], [1, 1, 'hold']],
      },
      // ...and out it goes: the bell kicks up as the note leaves.
      horn: { rot: [[0, 0], [0.34, 2, 'out'], [0.45, -9, 'in'], [0.56, -3, 'out'], [0.66, -5, 'inOut'], [1, 0, 'inOut']] },
      hips: { x: [[0, 0], [0.34, -2, 'out'], [0.45, -4, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.34, -4, 'out'], [0.45, 4, 'in'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.34, 10, 'out'], [0.45, -6, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    arm_front: { rot: [[0, 0], [0.3, -4, 'out'], [1, 0, 'inOut']] },
    horn: { rot: rattle(3, 4) },
    cheek: { sx: [[0, 1], [0.2, 0.75, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.2, 0.75, 'out'], [1, 1, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 56 },
    {
      // Head down, cheek flat, and the bell hanging its head as well.
      torso: { rot: bob(2, 9) },
      head: { rot: bob(3, 12), y: [[0, 2]] },
      horn: { rot: swing(2, 8) },
      cheek: { sx: [[0, 0.8]], sy: [[0, 0.8]] },
      arm_front: { rot: [[0, 4]] },
      arm_back: { rot: swing(6, 4) },
    },
  ),
};

export default sousafonist;
