import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** Twice per loop the crowbar hops on his shoulder, as if he is weighing it. */
const HOP: Key[] = [[0, 0], [0.08, -11, 'out'], [0.18, 0, 'in'], [0.5, 0, 'hold'], [0.58, -11, 'out'], [0.68, 0, 'in'], [1, 0, 'hold']];

/**
 * Kraker Sjors: swaggers along with a crowbar on his shoulder and his thumb in
 * his belt. To hit he leans back, then chops the bar over his head and down.
 * His arm has an elbow, which the other humanoids do not: `forearm` folds it.
 */
const krakerSjors: ClipSet = {
  idle: idle(
    { seconds: 2.2, breathe: 0.03, armSway: 0 },
    {
      // Nodding along to a song only he can hear.
      head: { rot: [[0, 0], [0.12, 6, 'out'], [0.25, 0, 'in'], [0.5, 0, 'hold'], [0.62, 6, 'out'], [0.75, 0, 'in'], [1, 0, 'hold']] },
      mohawk: { rot: [[0, 0], [0.16, 7, 'out'], [0.32, -3, 'inOut'], [0.5, 0, 'inOut'], [0.66, 7, 'out'], [0.82, -3, 'inOut'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0]] },
      forearm: { rot: HOP },
      prop: { rot: HOP.map((k): Key => [k[0], k[1] * 0.6, k[2]]) },
      arm_back: { rot: [[0, 6], [0.5, 9, 'sineInOut'], [1, 6, 'sineInOut']] },
    },
  ),

  walk: walk(
    { stride: 56, legSwing: 31, legLen: 38, armSwing: 30, armRest: 4, lean: -4, sway: 3.5, headNod: 4 },
    {
      // The crowbar arm stays where it is; the bar bounces with every step.
      arm_front: { rot: bob(3) },
      forearm: { rot: bob(-6) },
      prop: { rot: bob(-5) },
      mohawk: { rot: bob(7, -3) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: {
        x: [[0, 0], [0.26, -4, 'out'], [0.45, 7, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.26, 2, 'out'], [0.45, -2, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.26, -12, 'out'], [0.45, 18, 'in'], [0.7, 10, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 8, 'out'], [0.45, -10, 'in'], [1, 0, 'inOut']] },
      mohawk: { rot: [[0, 0], [0.26, -10, 'out'], [0.5, 16, 'in'], [0.75, -6, 'out'], [1, 0, 'inOut']] },
      // The elbow leads: the bar leaves his shoulder and goes over the top. It lands at
      // head height on the hit and carries on down to the road.
      arm_front: { rot: [[0, 0], [0.26, 14, 'out'], [0.45, -68, 'in'], [0.6, -50, 'out'], [0.74, -46, 'inOut'], [1, 0, 'inOut']] },
      forearm: { rot: [[0, 0], [0.26, -12, 'out'], [0.45, 144, 'in'], [0.74, 144, 'hold'], [1, 0, 'inOut']] },
      prop: { rot: [[0, 0], [0.26, -28, 'out'], [0.45, 28, 'in'], [0.6, 100, 'out'], [0.74, 96, 'inOut'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, -30, 'out'], [0.45, 36, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 8, 'out'], [0.45, -18, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -6, 'out'], [0.45, 14, 'in'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    mohawk: { rot: [[0, 0], [0.3, 20, 'out'], [0.65, -6, 'inOut'], [1, 0, 'inOut']] },
    // His fist stays at his collar; the far end of the bar jumps off his shoulder.
    arm_front: { rot: [[0, 0], [0.3, -8, 'out'], [1, 0, 'inOut']] },
    prop: { rot: [[0, 0], [0.3, 16, 'out'], [0.65, -4, 'inOut'], [1, 0, 'inOut']] },
  }),

  die: slinkOff(
    { legLen: 38, stride: 70 },
    {
      // The crowbar stays behind; he needs both arms for running, elbows pumping.
      prop: { sx: [[0, 0]], sy: [[0, 0]] },
      arm_front: { rot: swing(46, -4) },
      forearm: { rot: [[0, 58]] },
      arm_back: { rot: swing(-46, 4) },
      mohawk: { rot: swing(13, 10) },
    },
  ),
};

export default krakerSjors;
