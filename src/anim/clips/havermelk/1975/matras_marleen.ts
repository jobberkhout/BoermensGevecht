import { bob, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet } from '../../../types.ts';

/**
 * Matras-Marleen: moving into a squat with her mattress held up in front of her,
 * peeking round it. Whatever is fired at her goes plof. To hit she gives a shove
 * with the whole mattress; beaten, she hoists it on her back and trudges home under it.
 *
 * The mattress (`shield`) hangs from her fist, so it goes wherever her arm goes.
 * The clips turn it back by as much as her arm and body have turned, to keep it upright.
 */
const matrasMarleen: ClipSet = {
  idle: idle(
    { seconds: 3.2, breathe: 0.03, armSway: 3 },
    {
      // She has put it down. Now and then she leans out for a look past the edge.
      head: {
        y: [[0, 0], [0.5, -1.2, 'sineInOut'], [1, 0, 'sineInOut']],
        x: [[0, 0], [0.5, 0, 'hold'], [0.62, 3, 'inOut'], [0.86, 3, 'hold'], [1, 0, 'inOut']],
        rot: [[0, 0], [0.5, 0, 'hold'], [0.62, 9, 'inOut'], [0.86, 9, 'hold'], [1, 0, 'inOut']],
      },
      knot: { rot: [[0, 0], [0.5, 4, 'sineInOut'], [0.66, -9, 'inOut'], [0.86, 2, 'inOut'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0]] },
      // On the road, and not breathing along with her.
      shield: { y: [[0, 6]], sy: [[0, 1], [0.5, 1 / 1.03, 'sineInOut'], [1, 1, 'sineInOut']] },
      spring: { rot: swing(3), rate: 2 },
    },
  ),

  walk: walk(
    { stride: 40, legSwing: 22, legLen: 38, armSwing: 18, armRest: 4, lean: 5, sway: 2, headNod: 2 },
    {
      // Her arm stays straight down whatever her back does; the mattress rocks against her shoulder.
      arm_front: { rot: bob(-2, -5) },
      shield: { rot: bob(2.5, -4) },
      spring: { rot: swing(10, 0, 0.15), rate: 2 },
      head: { rot: bob(-2, 4) },
      knot: { rot: swing(9, 6, 0.9) },
    },
  ),

  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      // She hauls it back against her chest, then puts her shoulder behind it.
      hips: {
        x: [[0, 0], [0.24, -4, 'out'], [0.45, 5, 'in'], [1, 0, 'inOut']],
        y: [[0, 0], [0.24, 2, 'out'], [0.45, -1, 'in'], [1, 0, 'inOut']],
      },
      torso: { rot: [[0, 0], [0.24, -8, 'out'], [0.45, 11, 'in'], [0.68, 6, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.24, 6, 'out'], [0.45, -6, 'in'], [1, 0, 'inOut']] },
      knot: { rot: [[0, 0], [0.24, -10, 'out'], [0.5, 18, 'in'], [0.78, -6, 'out'], [1, 0, 'inOut']] },
      arm_front: { rot: [[0, 0], [0.24, 14, 'out'], [0.45, -26, 'in'], [0.68, -14, 'out'], [1, 0, 'inOut']] },
      // What is left after her arm and back: leaning back at first, tipped forward on the hit.
      shield: { rot: [[0, 0], [0.24, -12, 'out'], [0.45, 23, 'in'], [0.68, 12, 'out'], [1, 0, 'inOut']] },
      spring: { rot: [[0, 0], [0.24, 12, 'out'], [0.45, -24, 'in'], [0.6, 16, 'out'], [0.75, -9, 'inOut'], [0.88, 4, 'inOut'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.24, -26, 'out'], [0.45, 30, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.24, 6, 'out'], [0.45, -15, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.24, -4, 'out'], [0.45, 12, 'in'], [1, 0, 'inOut']] },
    },
  },

  // Plof. The mattress dents where it is struck, wobbles and settles; the spring twangs.
  // She only ducks a little.
  hit: {
    loop: false,
    seconds: 0.34,
    tracks: {
      shield: {
        x: [[0, 0], [0.15, -3, 'out'], [0.45, 1.2, 'inOut'], [1, 0, 'inOut']],
        sx: [[0, 1], [0.15, 0.9, 'out'], [0.45, 1.05, 'inOut'], [0.75, 0.99, 'inOut'], [1, 1, 'inOut']],
        rot: rattle(2.4, 3),
      },
      spring: {
        rot: rattle(30, 4),
        sy: [[0, 1], [0.18, 0.7, 'out'], [0.45, 1.25, 'inOut'], [0.75, 0.95, 'inOut'], [1, 1, 'inOut']],
      },
      head: { y: [[0, 0], [0.2, 1.4, 'out'], [1, 0, 'inOut']] },
      knot: { rot: rattle(10, 3) },
    },
  },

  die: slinkOff(
    { legLen: 38, stride: 60 },
    {
      // Home is behind her now, and so is the mattress: on her back, held at the hip.
      arm_front: { rot: bob(-3, 4) },
      shield: { sx: [[0, -1]], y: [[0, -9]], rot: bob(2, -8) },
      spring: { rot: swing(14), rate: 2 },
      arm_back: { rot: swing(-16, 26) },
      head: { rot: bob(3, 6) },
      knot: { rot: bob(8, 20) },
    },
  ),
};

export default matrasMarleen;
