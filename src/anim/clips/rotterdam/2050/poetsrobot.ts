import { bob, flinch, idle, slinkOff, swing, walk } from '../../../humanoid.ts';
import { rattle } from '../../../props.ts';
import type { ClipSet, Key } from '../../../types.ts';

/** One blink of the work lamps per cycle. */
const BLINK: Key[] = [[0, 1], [0.7, 1, 'hold'], [0.74, 0.15, 'in'], [0.8, 1, 'out'], [1, 1, 'hold']];

/**
 * De Poetsrobot. Delivered with its sleeves already rolled up, and it does not
 * talk: the grille stays shut. Standing still it scrubs the deck under its
 * feet, because standing still is no reason to stop. It walks with the
 * schrobber at the ready, and fights with one hard swipe of it across the
 * shins. Beaten, battery flat, it drags the brush home behind it.
 */
const poetsrobot: ClipSet = {
  idle: idle(
    { seconds: 2.4, breathe: 0, armSway: 0 },
    {
      // Scrub, scrub, scrub: the whole body leans into every stroke.
      torso: { rot: [[0, 2], [0.5, 5, 'sineInOut'], [1, 2, 'sineInOut']], rate: 4 },
      arm_front: { rot: swing(7, -2), rate: 4 },
      brush: { rot: swing(-6, 2), rate: 4 },
      arm_back: { rot: swing(3, 0, 0.25), rate: 2 },
      hips: { x: [[0, 0], [0.5, 1, 'sineInOut'], [1, 0, 'sineInOut']], rate: 4 },
      // Eyes on the floor; once a cycle a look up at the enemy, not a word.
      head: { rot: [[0, 6], [0.5, 6, 'hold'], [0.58, -4, 'inOut'], [0.84, -4, 'hold'], [0.92, 6, 'inOut'], [1, 6]] },
      eyes: { sy: BLINK },
      beacon: { rot: [[0, -3], [0.5, 3, 'sineInOut'], [1, -3, 'sineInOut']], rate: 4 },
    },
  ),

  walk: walk(
    { stride: 46, legSwing: 24, legLen: 36, armSwing: 12, lean: 3, sway: 1.5, headNod: 2 },
    {
      // The brush carried at the ready, bristles off the deck.
      arm_front: { rot: swing(4, -16) },
      brush: { rot: [[0, -10]] },
      arm_back: { rot: swing(-10, 0) },
      beacon: { rot: swing(5, 0, 0.2), rate: 2 },
      eyes: { sy: BLINK },
    },
  ),

  // Back with the brush, and one hard swipe across the shins.
  attack: {
    loop: false,
    markers: { hit: 0.45 },
    tracks: {
      hips: { x: [[0, 0], [0.26, -4, 'out'], [0.45, 7, 'in'], [0.7, 3, 'out'], [1, 0, 'inOut']] },
      torso: { rot: [[0, 0], [0.26, -8, 'out'], [0.45, 14, 'in'], [0.7, 8, 'out'], [1, 0, 'inOut']] },
      head: { rot: [[0, 0], [0.26, 6, 'out'], [0.45, -6, 'in'], [1, 0, 'inOut']] },
      // Backswing: the bristles up behind it. Then through, low, at shin height.
      arm_front: { rot: [[0, 0], [0.26, 34, 'out'], [0.45, -20, 'in'], [0.66, -26, 'out'], [1, 0, 'inOut']] },
      brush: { rot: [[0, 0], [0.26, 100, 'out'], [0.45, -25, 'in'], [0.66, -34, 'out'], [1, 0, 'inOut']] },
      arm_back: { rot: [[0, 0], [0.26, -14, 'out'], [0.45, 18, 'in'], [1, 0, 'inOut']] },
      leg_front: { rot: [[0, 0], [0.26, 6, 'out'], [0.45, -16, 'in'], [1, 0, 'inOut']] },
      leg_back: { rot: [[0, 0], [0.26, -4, 'out'], [0.45, 12, 'in'], [1, 0, 'inOut']] },
      beacon: { rot: [[0, 0], [0.45, 0, 'hold'], [0.5, 14, 'out'], [0.62, -8, 'inOut'], [0.76, 4, 'inOut'], [1, 0, 'inOut']] },
    },
  },

  hit: flinch({
    eyes: { sx: [[0, 1], [0.2, 1.3, 'out'], [1, 1, 'inOut']], sy: [[0, 1], [0.2, 0.3, 'out'], [1, 1, 'inOut']] },
    beacon: { rot: rattle(16, 3) },
    // The brush stays down: it was told to keep scrubbing.
    arm_front: { rot: [[0, 0], [0.3, 8, 'out'], [1, 0, 'inOut']] },
    brush: { rot: [[0, 0], [0.3, -6, 'out'], [1, 0, 'inOut']] },
  }),

  // Accu leeg. Aftaaien: head down, lamps dimmed, the brush dragged along behind.
  die: slinkOff(
    { legLen: 36, stride: 60 },
    {
      arm_front: { rot: swing(3, 40) },
      brush: { rot: [[0, 2], [0.5, 6, 'sineInOut'], [1, 2, 'sineInOut']] },
      arm_back: { rot: swing(-8, 20) },
      head: { rot: bob(3, 18) },
      eyes: { sy: [[0, 0.35]], y: [[0, 1.2]] },
      beacon: { rot: [[0, 20]] },
    },
  ),
};

export default poetsrobot;
